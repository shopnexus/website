// Screenshot one mockup while designing it:
//   node shoot.mjs <page.html> <out.png> [--tall <px>] [--width <px>] [--height <px>] [--js "<expression>"]
// --tall stretches #app so the whole scrolling page lands in one image.
// --js runs after load; it may return a promise. Exceptions are printed.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i < 0 ? null : args.splice(i, 2)[1]; };
const tall = Number(flag('--tall') || 0);
const width = Number(flag('--width') || 412);
const height = Number(flag('--height') || 915);
const js = flag('--js');
const [page, out] = args;

const browser = spawn('/opt/thorium-browser-avx2/thorium', [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=0', '--hide-scrollbars',
  `--user-data-dir=${resolve('../tmp/browser-or')}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
const deadline = setTimeout(() => browser.kill('SIGTERM'), 60000);
let ws;
try {
  const wsUrl = await new Promise((ok, fail) => {
    let text = '';
    browser.stderr.on('data', d => { text += d; const m = text.match(/DevTools listening on (ws:\/\/\S+)/); if (m) ok(m[1]); });
    browser.on('error', fail);
  });
  ws = new WebSocket(wsUrl);
  await new Promise(ok => ws.addEventListener('open', ok));
  let seq = 0;
  const pending = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') console.log('EXCEPTION', m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.log('CONSOLE', m.params.args.map(a => a.value).join(' '));
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}, sessionId) => new Promise(ok => { const id = ++seq; pending.set(id, ok); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  const { result: { targetInfos } } = await send('Target.getTargets');
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId: targetInfos.find(t => t.type === 'page').targetId, flatten: true });
  const call = (m, p) => send(m, p, sessionId);
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) console.log('EVAL ERROR', r.result.exceptionDetails.exception?.description);
    return r.result?.result?.value;
  };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width, height: tall || height, deviceScaleFactor: 1, mobile: true });
  const [file, hash] = page.split('#');
  await call('Page.navigate', { url: 'file://' + resolve(file) + (hash ? '#' + hash : '') });
  await evaluate(`new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))`);
  await evaluate('document.fonts.ready.then(() => true)');
  if (tall) await evaluate(`(() => { const a = document.getElementById('app'); a.style.height = '${tall}px'; a.style.maxHeight = 'none'; })()`);
  if (js) { const v = await evaluate(js); if (v !== undefined) console.log('JS', JSON.stringify(v)); }
  // Let lazy icons and images settle.
  await evaluate(`new Promise(r => setTimeout(r, 1200))`);
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved', out);
} finally {
  clearTimeout(deadline);
  ws?.close();
  browser.kill('SIGTERM');
}
