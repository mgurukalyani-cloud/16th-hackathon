import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9680;
const TEMP_DIR = path.resolve('scratch-chrome-views2-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== Capturing Mandi Prices & Comparator Screenshots ===\n');

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

  // Click 3. AGMARKNET Mandi Prices
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mandiTab = buttons.find(b => b.innerText.includes('AGMARKNET Mandi'));
      if (mandiTab) mandiTab.click();
      window.scrollTo(0, 420);
    })()`,
    returnByValue: true
  });
  await sleep(1200);

  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-mandi-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved crop-mandi-view.png');

  // Click 4. Cross-Crop Comparator
  await send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const compTab = buttons.find(b => b.innerText.includes('Cross-Crop'));
      if (compTab) compTab.click();
      window.scrollTo(0, 420);
    })()`,
    returnByValue: true
  });
  await sleep(1200);

  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('crop-comparator-view.png', Buffer.from(shot.result.data, 'base64'));
  console.log('Saved crop-comparator-view.png');

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}

  console.log('Done!');
}

runTest().catch(err => {
  console.error('Error:', err);
  chrome.kill();
});
