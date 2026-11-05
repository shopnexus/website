// Static server for the map prototype. Answers HTTP Range requests, as RustFS
// or any CDN does, so the browser reads only the parts of hcm.pmtiles it needs.
//   bun prototypes/map/serve.ts      → http://localhost:4610
const dir = import.meta.dir;
Bun.serve({
  port: 4610,
  async fetch(req) {
    const path = new URL(req.url).pathname;
    const file = Bun.file(`${dir}/${path === "/" ? "index.html" : path.slice(1)}`);
    if (!(await file.exists())) return new Response("not found", { status: 404 });
    const range = req.headers.get("range")?.match(/bytes=(\d+)-(\d*)/);
    if (!range) return new Response(file);
    const start = Number(range[1]);
    const end = range[2] ? Number(range[2]) : file.size - 1;
    return new Response(file.slice(start, end + 1), {
      status: 206,
      headers: { "Content-Range": `bytes ${start}-${end}/${file.size}`, "Accept-Ranges": "bytes", "Content-Length": String(end - start + 1) },
    });
  },
});
console.log("map prototype on http://localhost:4610");
