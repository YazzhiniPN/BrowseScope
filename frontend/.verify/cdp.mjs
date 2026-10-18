import { writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const list = await fetch('http://127.0.0.1:9223/json/list').then((r) => r.json());
const page = list.find((t) => t.url && t.url.includes('localhost:5174'));
const WS = page.webSocketDebuggerUrl;
console.log('Connecting', WS);
const outDir = new URL('./', import.meta.url);

let id = 0;
const pending = new Map();
const ws = new WebSocket(WS);

function send(method, params = {}) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(name) {
  const res = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL(name, outDir), Buffer.from(res.data, 'base64'));
}

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
});

ws.addEventListener('open', async () => {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280, height: 800, deviceScaleFactor: 1, mobile: false
    });
    await sleep(400);

    const info = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        colorScheme: document.documentElement.style.colorScheme,
        hasToggle: !!document.querySelector('.theme-toggle'),
        aria: document.querySelector('.theme-toggle')?.getAttribute('aria-label'),
        title: document.querySelector('h1')?.textContent,
        fileInput: !!document.querySelector('input[type=file]')
      })`,
      returnByValue: true
    });
    console.log('STATE', JSON.stringify(info.result.value));

    await screenshot('dark-desktop.png');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('.theme-toggle').click()`,
      userGesture: true
    });
    await sleep(500);

    const after = await send('Runtime.evaluate', {
      expression: `({
        theme: document.documentElement.getAttribute('data-theme'),
        stored: localStorage.getItem('browsescope-theme'),
        aria: document.querySelector('.theme-toggle')?.getAttribute('aria-label')
      })`,
      returnByValue: true
    });
    console.log('AFTER_TOGGLE', JSON.stringify(after.result.value));
    await screenshot('light-desktop.png');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 375, height: 720, deviceScaleFactor: 2, mobile: true
    });
    await sleep(400);
    await screenshot('light-mobile.png');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('.theme-toggle').click()`,
      userGesture: true
    });
    await sleep(400);
    await screenshot('dark-mobile.png');

    const persist = await send('Runtime.evaluate', {
      expression: `localStorage.getItem('browsescope-theme')`,
      returnByValue: true
    });
    console.log('STORED', persist.result.value);

    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `(() => {
        const json = (obj) => new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json' } });
        window.fetch = async (input) => {
          const url = String(input);
          if (url.includes('/status')) return json({ hasData: true });
          if (url.includes('/stats/domains')) return json([
            { domain: 'github.com', visitCount: 40 },
            { domain: 'wikipedia.org', visitCount: 22 }
          ]);
          if (url.includes('/stats/daily')) return json({ Mon: 4, Tue: 8, Wed: 12, Thu: 6 });
          if (url.includes('/stats/hourly')) return json({ 9: 3, 10: 7, 14: 11, 21: 5 });
          if (url.includes('/productivity')) return json({
            overallScore: 72.4,
            visitsByCategory: { productive: 10, social: 4, entertainment: 3, educational: 6 }
          });
          if (url.includes('/graph')) return json({
            nodes: [
              { id: 'a', label: 'github.com', visitCount: 40, category: 'productive' },
              { id: 'b', label: 'youtube.com', visitCount: 12, category: 'entertainment' }
            ],
            edges: [{ source: 'a', target: 'b', weight: 5 }]
          });
          if (url.includes('/visits')) return json([{
            visitId: 1, url: 'https://github.com', title: 'GitHub',
            domain: 'github.com', category: 'productive', visitTimeEpochMillis: Date.now()
          }]);
          return json({});
        };
      })();`
    });
    await send('Page.reload', { ignoreCache: true });
    await sleep(1200);
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280, height: 900, deviceScaleFactor: 1, mobile: false
    });
    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme','light'); document.documentElement.style.colorScheme='light';`,
    });
    await sleep(500);
    await screenshot('dashboard-light.png');

    await send('Runtime.evaluate', {
      expression: `[...document.querySelectorAll('.tab')].find(t => t.textContent === 'Navigation Graph')?.click()`,
      userGesture: true
    });
    await sleep(800);
    await screenshot('graph-light.png');

    await send('Runtime.evaluate', {
      expression: `[...document.querySelectorAll('.tab')].find(t => t.textContent === 'History')?.click()`,
      userGesture: true
    });
    await sleep(600);
    await screenshot('history-light.png');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('.theme-toggle')?.click()`,
      userGesture: true
    });
    await sleep(400);
    await screenshot('history-dark.png');

    await send('Runtime.evaluate', {
      expression: `[...document.querySelectorAll('.tab')].find(t => t.textContent === 'Dashboard')?.click()`,
      userGesture: true
    });
    await sleep(600);
    await screenshot('dashboard-dark.png');

    ws.close();
  } catch (err) {
    console.error(err);
    ws.close();
    process.exit(1);
  }
});
