import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9445;
const TEMP_DIR = path.resolve('scratch-chrome-cam-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== AgriSense Camera-to-Prediction Workflow Verification ===\n');

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${TEMP_DIR}`,
  '--disable-gpu',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1280,800',
  'http://localhost:5173/16th-hackathon/'
]);

chrome.stderr.on('data', () => {});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  await sleep(4000);

  const tabsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('5173')) || tabs[0];
  console.log('Found Chrome Tab:', pageTab.title, pageTab.url);

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let msgId = 0;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = ++msgId;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise(res => ws.onopen = res);
  console.log('Connected to Chrome DevTools Protocol WebSocket.\n');

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Waiting for weather data and React hydration...');
  // Wait until loading spinner finishes
  for (let i = 0; i < 30; i++) {
    const isStillLoading = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.animate-spin'))`
    });
    if (!isStillLoading.result?.value) break;
    await sleep(500);
  }
  await sleep(1000);

  // Step 1: Navigate to Plant Health
  console.log('Step 1: Navigating to Plant Health tab...');
  const navRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        let btn = null;
        for (let i = 0; i < 40; i++) {
          btn = document.querySelector('button[data-tab-id="plant_health"]') ||
                Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Plant Health') || b.textContent.includes('Scanner'));
          if (btn) break;
          await new Promise(r => setTimeout(r, 300));
        }
        return {
          found: !!btn,
          bodyText: document.body.innerText.slice(0, 500),
          allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const nVal = navRes.result?.result?.value || navRes.result?.value;
  console.log('Navigation search result:', nVal);
  if (!nVal?.found) {
    throw new Error('Failed to find and click Plant Health tab button.');
  }
  // Click the button
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[data-tab-id="plant_health"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Plant Health') || b.textContent.includes('Scanner'));
        if (btn) btn.click();
      })()
    `
  });
  console.log('Navigated to Plant Health.');
  await sleep(1500);

  // Step 2: Launch Live Camera Scanner Modal
  console.log('Step 2: Launching Camera Scanner modal...');
  const launchCamRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const camBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Launch Live Camera Scanner'));
        if (camBtn) {
          camBtn.click();
          return true;
        }
        return false;
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const lVal = launchCamRes.result?.result?.value || launchCamRes.result?.value;
  if (!lVal) {
    throw new Error('Failed to click Launch Live Camera Scanner button.');
  }
  await sleep(2500);

  // Step 3: Verify Camera Preview & Click Capture Leaf Photo
  console.log('Step 3: Verifying camera live preview and capturing leaf photo...');
  const captureRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const captureBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Capture Leaf Photo'));
        if (!captureBtn) return { error: 'Capture button not found' };
        
        // Wait until capture button is enabled (camera ready)
        for (let i = 0; i < 20; i++) {
          if (!captureBtn.disabled) break;
          await new Promise(r => setTimeout(r, 200));
        }

        captureBtn.click();
        await new Promise(r => setTimeout(r, 1200));

        // Verify captured leaf preview is visible
        const previewImg = document.querySelector('img[alt="Captured Leaf Specimen"]');
        const analyzeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Analyze Captured Leaf'));
        const retakeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Retake Photo'));

        return {
          hasPreviewImage: !!previewImg,
          hasAnalyzeButton: !!analyzeBtn,
          hasRetakeButton: !!retakeBtn
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const capVal = captureRes.result?.result?.value || captureRes.result?.value;
  console.log('Captured Leaf State in Modal:', capVal);
  if (!capVal?.hasAnalyzeButton) {
    throw new Error('Analyze Captured Leaf button was not found after capture!');
  }

  // Step 4: Click "Analyze Captured Leaf" and verify transition to results panel
  console.log('Step 4: Clicking Analyze Captured Leaf...');
  const analyzeClickRes = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const analyzeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Analyze Captured Leaf'));
        if (!analyzeBtn) return { error: 'Analyze button not found' };
        analyzeBtn.click();

        // Wait for modal to close and PlantAnalysisResult to mount
        let resultContainer = null;
        for (let i = 0; i < 30; i++) {
          resultContainer = document.querySelector('div[data-testid="plant-analysis-results"]');
          if (resultContainer) break;
          await new Promise(r => setTimeout(r, 250));
        }

        const conditionTitle = document.querySelector('h2[data-testid="diagnosed-condition-title"]')?.innerText;
        const modalStillOpen = Array.from(document.querySelectorAll('h3')).some(h => h.innerText.includes('Live Leaf Disease Scanner'));

        return {
          hasResultContainer: !!resultContainer,
          conditionTitle,
          modalStillOpen,
          pageText: resultContainer ? resultContainer.innerText.slice(0, 300) : ''
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const aVal = analyzeClickRes.result?.result?.value || analyzeClickRes.result?.value;
  console.log('Prediction Results Output:');
  console.log('  Result Container Present:', aVal?.hasResultContainer);
  console.log('  Diagnosed Condition:', aVal?.conditionTitle);
  console.log('  Scanner Modal Closed:', !aVal?.modalStillOpen);
  console.log('  Text Preview:', aVal?.pageText?.replace(/\n+/g, ' '));

  if (!aVal?.hasResultContainer || !aVal?.conditionTitle) {
    throw new Error('Camera-to-prediction flow failed: results panel did not appear!');
  }

  console.log('\n======================================================');
  console.log('SUCCESS: Complete Camera-to-Prediction Workflow Verified!');
  console.log('Capture -> Review -> Analyze -> Results Displayed Perfectly!');
  console.log('======================================================\n');

  ws.close();
  chrome.kill();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Camera Verification Error:', err);
  chrome.kill();
  process.exit(1);
});
