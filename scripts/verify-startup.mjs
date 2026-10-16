import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9685;
const TEMP_DIR = path.resolve('scratch-chrome-startup-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== Verifying Vite Dev Server Startup & React DOM Rendering ===\n');

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
  '--window-size=1280,800',
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
  console.log('Connected to Chrome tab:', pageTab.title, pageTab.url);

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
        console.error('Browser Console Error:', text);
        consoleErrors.push(text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const desc = data.params?.exceptionDetails?.text || data.params?.exceptionDetails?.exception?.description;
      console.error('Browser Exception:', desc);
      consoleErrors.push(desc);
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

  await sleep(2500);

  // Check Vite error overlay
  const overlayCheck = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector('vite-error-overlay'))`,
    returnByValue: true
  });
  console.log('Vite Error Overlay Present:', overlayCheck.result?.result?.value ? 'YES (FAIL)' : 'NO (PASS)');

  // Check whether root element has rendered child elements
  const rootCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const root = document.getElementById('root');
      return {
        hasRoot: Boolean(root),
        childrenCount: root ? root.children.length : 0,
        hasHeader: Boolean(document.querySelector('header')),
        bodyTextSnippet: document.body.innerText.slice(0, 150).replace(/\\n/g, ' ')
      };
    })()`,
    returnByValue: true
  });
  console.log('React Mount & DOM Status:', rootCheck.result?.result?.value);

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.result?.data) {
    fs.writeFileSync('startup-verified.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Captured verification screenshot: startup-verified.png');
  }

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}

  if (overlayCheck.result?.result?.value || rootCheck.result?.result?.value?.childrenCount === 0) {
    console.error('Verification failed: App did not mount or error overlay present!');
    process.exit(1);
  }

  console.log('\n=== VERIFICATION SUCCESS: react-dom/client resolved and AgriSense is running smoothly! ===');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  chrome.kill();
  process.exit(1);
});
