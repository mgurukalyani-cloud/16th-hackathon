import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9555;
const TEMP_DIR = path.resolve('scratch-chrome-preview-' + Date.now());

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

console.log('=== Verifying Production Build under /16th-hackathon/ in Headless Chrome ===\n');

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
  'http://localhost:4173/16th-hackathon/'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  await sleep(4000);

  const tabsRes = await fetch(`http://127.0.0.1:${PORT}/json`);
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('16th-hackathon')) || tabs[0];
  console.log('Found Chrome Tab:', pageTab.title, pageTab.url);

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
      console.error('Browser Runtime Exception:', desc);
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
  console.log('Connected to Chrome DevTools Protocol WebSocket.\n');

  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Waiting for React hydration, CSS styling, and Open-Meteo weather fetch...');
  await sleep(4000);

  const domCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const root = document.getElementById('root');
        const rootChildCount = root ? root.children.length : 0;
        const bodyText = document.body.innerText;
        const isBlank = !bodyText || bodyText.trim().length === 0;

        const hasHeaderTitle = bodyText.includes('AgriSense');
        const hasLiveWeatherTab = bodyText.includes('Live Weather') || !!document.querySelector('button[data-tab-id="live"]');
        const hasPlantHealthTab = bodyText.includes('Plant Health') || !!document.querySelector('button[data-tab-id="plant_health"]');
        const hasForecastTab = bodyText.includes('Weather Forecast') || !!document.querySelector('button[data-tab-id="forecast"]');
        const hasOpenMeteoData = bodyText.includes('°C') || bodyText.includes('°F') || bodyText.includes('km/h');
        const hasVoiceButton = !!document.querySelector('button[title*="Voice"]') || bodyText.includes('Voice Assistant');

        return {
          rootExists: !!root,
          rootChildCount,
          isBlank,
          bodyTextSample: bodyText.slice(0, 300).replace(/\\n+/g, ' '),
          hasHeaderTitle,
          hasLiveWeatherTab,
          hasPlantHealthTab,
          hasForecastTab,
          hasOpenMeteoData,
          hasVoiceButton
        };
      })()
    `,
    returnByValue: true
  });

  const res = domCheck.result?.result?.value;
  console.log('DOM Inspection Output:');
  console.log('  Root Element Exists:', res?.rootExists);
  console.log('  Root Children Count:', res?.rootChildCount);
  console.log('  Is Page Blank White:', res?.isBlank);
  console.log('  Text Preview:', res?.bodyTextSample);
  console.log('  AgriSense Header Found:', res?.hasHeaderTitle);
  console.log('  Live Weather Tab Found:', res?.hasLiveWeatherTab);
  console.log('  Plant Health Tab Found:', res?.hasPlantHealthTab);
  console.log('  Weather Forecast Tab Found:', res?.hasForecastTab);
  console.log('  Open-Meteo Live Data Rendered:', res?.hasOpenMeteoData);
  console.log('  Voice Assistant Trigger Found:', res?.hasVoiceButton);
  console.log('  Console Errors Count:', consoleErrors.length);

  if (res?.isBlank || res?.rootChildCount === 0 || !res?.hasHeaderTitle) {
    throw new Error('FAIL: Production preview rendered a blank screen or failed to mount root component!');
  }

  console.log('\n============================================================');
  console.log('>>> PRODUCTION BUILD VERIFIED UNDER /16th-hackathon/! <<<');
  console.log('============================================================\n');

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test Execution Error:', err);
  chrome.kill();
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}
  process.exit(1);
});
