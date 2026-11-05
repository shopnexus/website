// Delete draft nodes from the Superdesign canvas the way a person would: select the frame, press Delete,
// and confirm if the canvas asks, since the CLI has no command for deleting a draft.
//   node canvas_delete.mjs <embedCanvasUrl> <out-dir> <draftId>...
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

const [target, outDir, ...ids] = process.argv.slice(2);
const browser = spawn('/opt/thorium-browser-avx2/thorium', [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=0', '--window-size=1600,1000',
  `--user-data-dir=${resolve(outDir, 'profile')}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
const deadline = setTimeout(() => browser.kill('SIGTERM'), 300000);
let ws;
const sleep = ms => new Promise(r => setTimeout(r, ms));
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
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}, sessionId) => new Promise(ok => { const id = ++seq; pending.set(id, ok); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  const { result: { targetInfos } } = await send('Target.getTargets');
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId: targetInfos.find(t => t.type === 'page').targetId, flatten: true });
  const call = (m, p) => send(m, p, sessionId);
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  const shot = async name => {
    const s = await call('Page.captureScreenshot', { format: 'png' });
    await writeFile(resolve(outDir, name), Buffer.from(s.result.data, 'base64'));
  };
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: target });
  // Wait for the canvas to render its frames; a slow load used to report every draft as missing.
  for (let t = 0; t < 60 && !(await evaluate(`document.querySelectorAll('.react-flow__node').length`)); t++) await sleep(1000);
  await sleep(2000);
  const mouse = (type, x, y, buttons) => call('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1 });
  const key = async (k, code, keyCode) => {
    await call('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code, windowsVirtualKeyCode: keyCode });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: keyCode });
  };
  const rect = id => evaluate(`(() => {
      const n = document.querySelector('.react-flow__node[data-id="draft-variant-${id}"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return [r.left, r.top, r.right, r.bottom];
    })()`);
  for (const id of ids) {
    // Pan with the wheel until the frame sits inside the viewport; a frame off screen cannot be clicked.
    for (let i = 0; i < 8; i++) {
      const r = await rect(id);
      if (!r || (r[0] > 90 && r[2] < 1380 && r[1] > 70 && r[3] < 980)) break;
      const dx = (r[0] + r[2]) / 2 - 800, dy = (r[1] + r[3]) / 2 - 500;
      await call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 800, y: 500, deltaX: dx, deltaY: dy });
      await sleep(400);
    }
    const where = await evaluate(`(() => {
      const n = document.querySelector('.react-flow__node[data-id="draft-variant-${id}"]');
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + Math.min(40, r.height / 4)];
    })()`);
    if (!where) { console.log('missing', id); continue; }
    await mouse('mouseMoved', where[0], where[1], 0);
    await mouse('mousePressed', where[0], where[1], 1);
    await mouse('mouseReleased', where[0], where[1], 0);
    await sleep(500);
    await key('Delete', 'Delete', 46);
    await sleep(1200);
    await shot(`delete-${id.slice(0, 8)}.png`);
    // The canvas asks "Delete item?" and can undo; confirm with its Delete button.
    const confirmed = await evaluate(`(() => {
      const box = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].find(d => d.textContent.includes('Delete item?'));
      const button = box && [...box.querySelectorAll('button')].find(b => b.textContent.trim() === 'Delete');
      if (button) button.click();
      return !!button;
    })()`);
    await sleep(2500);
    console.log('deleted', id.slice(0, 8), 'confirmed', confirmed,
      'still there', await evaluate(`!!document.querySelector('.react-flow__node[data-id="draft-variant-${id}"]')`));
  }
} finally {
  clearTimeout(deadline);
  ws?.close();
  browser.kill('SIGTERM');
}
