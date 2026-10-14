import { chromium } from "playwright";
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
const PAIRS=new Set(["11/16","12/18","14/20","14/22","16/24","16/26","18/26","18/28","20/28","24/32","28/36","32/40","40/48"]);
const seenCls=new Map();
for (const r of ["/","/search?q=ao","/cart","/checkout","/sell","/login"]) {
  await p.goto("http://localhost:5001"+r,{waitUntil:"domcontentloaded",timeout:90000}).catch(()=>{});
  await p.waitForTimeout(1800);
  const odd=await p.evaluate((pairs)=>{
    const out=[]; const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; const seen=new Set();
    while((n=walk.nextNode())){
      const t=(n.textContent||"").trim(); if(!t) continue;
      const el=n.parentElement; if(!el||seen.has(el)) continue; seen.add(el);
      if (el.classList.contains("material-symbols-outlined")) continue;
      const cs=getComputedStyle(el); const fs=Math.round(parseFloat(cs.fontSize)); const lh=parseFloat(cs.lineHeight);
      const key=`${fs}/${Number.isNaN(lh)?"normal":Math.round(lh)}`;
      if (!pairs.includes(key)) out.push({key, cls:(el.className||"").toString().slice(0,80), tag:el.tagName});
    }
    return out;
  }, [...PAIRS]).catch(()=>[]);
  for (const o of odd) {
    const k=o.key+" | "+o.cls;
    seenCls.set(k,(seenCls.get(k)||0)+1);
  }
}
[...seenCls.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).forEach(([k,n])=>console.log(`${String(n).padStart(4)} × ${k}`));
await b.close();
