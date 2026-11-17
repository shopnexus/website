// Screenshot a page of the running site, the whole height:
//   node .superdesign/tools/shoot-site.mjs <url> <out.png> [--width 1440] [--height 900] [--signed-in] [--js "<expr>"]
// --signed-in sets the mock session cookie first. Set SHOOT_PROFILE to run
// several at once (each needs its own browser profile directory).
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? null : args.splice(i, 2)[1];
};
const bool = (name) => {
  const i = args.indexOf(name);
  return i < 0 ? false : (args.splice(i, 1), true);
};
const width = Number(flag('--width') || 1440);
const height = Number(flag('--height') || 900);
const js = flag('--js');
const signedIn = bool('--signed-in');
const [url, out] = args;

const browser = spawn(
  process.env.SHOOT_BROWSER || '/opt/thorium-browser-avx2/thorium',
  [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=0',
    '--hide-scrollbars',
    `--user-data-dir=${resolve(process.env.SHOOT_PROFILE || join(tmpdir(), 'shopnexus-shoot'))}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
const deadline = setTimeout(() => browser.kill('SIGTERM'), 60000);
let ws;
try {
  const wsUrl = await new Promise((ok, fail) => {
    let text = '';
    browser.stderr.on('data', (d) => {
      text += d;
      const m = text.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) ok(m[1]);
    });
    browser.on('error', fail);
  });
  ws = new WebSocket(wsUrl);
  await new Promise((ok) => ws.addEventListener('open', ok));
  let seq = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown')
      console.log('EXCEPTION', m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      console.log('CONSOLE', m.params.args.map((a) => a.value).join(' '));
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((ok) => {
      const id = ++seq;
      pending.set(id, ok);
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const {
    result: { targetInfos },
  } = await send('Target.getTargets');
  const {
    result: { sessionId },
  } = await send('Target.attachToTarget', { targetId: targetInfos.find((t) => t.type === 'page').targetId, flatten: true });
  const call = (m, p) => send(m, p, sessionId);
  const evaluate = async (expression) => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) console.log('EVAL ERROR', r.result.exceptionDetails.exception?.description);
    return r.result?.result?.value;
  };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  const u = new URL(url);
  if (signedIn) await call('Network.setCookie', { name: 'sn_session', value: 'demo', url: u.origin, path: '/' });
  else await call('Network.deleteCookies', { name: 'sn_session', url: u.origin });
  await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 840 });
  const status = await new Promise(async (ok) => {
    let code = 0;
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Network.responseReceived' && m.params.type === 'Document' && !code) code = m.params.response.status;
      if (m.method === 'Page.loadEventFired') ok(code);
    });
    await call('Page.navigate', { url });
  });
  await evaluate('document.fonts.ready.then(() => true)');
  // Load lazy images: scroll through, then back up.
  await evaluate(
    `(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); })()`,
  );
  if (js) {
    const v = await evaluate(js);
    if (v !== undefined) console.log('JS', JSON.stringify(v));
  }
  await evaluate(`new Promise(r => setTimeout(r, 1500))`);
  const full = await evaluate('document.documentElement.scrollHeight');
  await call('Emulation.setDeviceMetricsOverride', { width, height: Math.max(height, full), deviceScaleFactor: 1, mobile: width < 840 });
  await evaluate(`new Promise(r => setTimeout(r, 400))`);
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved', out, 'status', status, 'height', full);
} finally {
  clearTimeout(deadline);
  ws?.close();
  browser.kill('SIGTERM');
}
