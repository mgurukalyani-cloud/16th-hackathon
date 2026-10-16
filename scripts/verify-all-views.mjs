import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9679;
const TEMP_DIR = path.resolve('scratch-chrome-views-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== Capturing Verification Screenshots for All 4 Crop Planning Sub-Views ===\n');

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${TEMP_DIR}`,
  '--disable-gpu',
  '--disable-background-networking',
  '--disable-sync',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-component-update',
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1400,1000',
  'http://localhost:5173/16th-hackathon/'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  await sleep(4000);

  const tabsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('16th-hackathon')) || tabs[0];

  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

  let msgId = 0;
  const callbacks = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const type = data.params?.type;
      const text = data.params?.args?.map(a => a.value || a.description || '').join(' ');
      if (type === 'error') {
        consoleErrors.push(text);
      }
    }
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await sleep(2000);

  // Navigate to Crop Planning Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cropTab = buttons.find(b => b.innerText.includes('Crop Planning'));
      if (cropTab) cropTab.click();
    })()`,
    returnByValue: true
  });
  await sleep(1500);

  // Scroll down a bit to show crop recommendation cards
  await send('Runtime.evaluate', {
    expression: `window.scrollBy(0, 450);`
  });
  await sleep(500);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-cards-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('1. Saved crop-cards-view.png');

  // Click Cultivation Cost Calculator Sub-Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const calcTab = buttons.find(b => b.innerText.includes('Cultivation Cost'));
      if (calcTab) calcTab.click();
      window.scrollTo(0, 400);
    })()`,
    returnByValue: true
  });
  await sleep(1000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-calculator-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('2. Saved crop-calculator-view.png');

  // Click Mandi Wholesale Prices Sub-Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mandiTab = buttons.find(b => b.innerText.includes('Mandi Prices'));
      if (mandiTab) mandiTab.click();
      window.scrollTo(0, 400);
    })()`,
    returnByValue: true
  });
  await sleep(1000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-mandi-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('3. Saved crop-mandi-view.png');

  // Click Compare Crops Sub-Tab
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const compTab = buttons.find(b => b.innerText.includes('Cross-Crop') || b.innerText.includes('Compare'));
      if (compTab) compTab.click();
      window.scrollTo(0, 400);
    })()`,
    returnByValue: true
  });
  await sleep(1000);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-comparator-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('4. Saved crop-comparator-view.png');

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}

  console.log('All screenshots captured successfully!');
}

runTest().catch(err => {
  console.error('Error:', err);
  chrome.kill();
});
