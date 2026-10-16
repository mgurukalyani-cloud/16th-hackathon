import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(CHROME_PATH, ['--headless=new', '--remote-debugging-port=9488', '--disable-gpu', 'http://localhost:5173']);

setTimeout(async () => {
  const tabs = await fetch('http://127.0.0.1:9488/json').then(r => r.json());
  const pageTab = tabs.find(t => t.url && t.url.includes('5173'));
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `
        (() => {
          return {
            title: document.title,
            allButtons: Array.from(document.querySelectorAll('button')).map(b => ({
              text: b.innerText.slice(0, 30).replace(/\\n/g, ' '),
              tabId: b.getAttribute('data-tab-id'),
              sampleId: b.getAttribute('data-sample-id'),
              action: b.getAttribute('data-action')
            }))
          };
        })()
      `,
      returnByValue: true
    }
  }));

  ws.onmessage = (e) => {
    console.log('DOM Buttons Check:', JSON.stringify(JSON.parse(e.data)?.result?.result?.value, null, 2));
    chrome.kill();
    process.exit(0);
  };
}, 4500);
