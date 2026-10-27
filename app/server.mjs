import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chatHandler from "../api/chat.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "dist");
const dataPath = path.join(dist, "market-data.json");
const port = Number(process.env.PORT || 4173);
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml"};

function send(res, status, body, type="application/json; charset=utf-8") {
  res.writeHead(status, {"Content-Type":type,"Cache-Control":"no-store","Access-Control-Allow-Origin":"*"});
  res.end(Buffer.isBuffer(body) || typeof body === "string" ? body : JSON.stringify(body));
}

async function evidence() { return JSON.parse(await readFile(dataPath, "utf8")); }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === "/api/health") return send(res, 200, {ok:true, service:"global-esl-market-atlas", now:new Date().toISOString()});
    if (pathname === "/api/market-data") return send(res, 200, await evidence());
    if (pathname === "/api/markets") {
      const pack = await evidence();
      const cluster = url.searchParams.get("cluster");
      const minimumEvidence = Number(url.searchParams.get("minimum_evidence") || 0);
      const records = pack.market_records.filter(m => (!cluster || m.cluster === cluster) && m.ratings.evidence_confidence >= minimumEvidence);
      return send(res, 200, {as_of:pack.as_of,count:records.length,markets:records});
    }
    if (pathname === "/api/chat") {
      let body = {};
      if (req.method === "POST") {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        try { body = raw ? JSON.parse(raw) : {}; } catch(e) {}
      }
      const mockReq = { method: req.method, body, headers: req.headers };
      const mockRes = {
        statusCode: 200,
        setHeader(k, v) { res.setHeader(k, v); return this; },
        status(code) { this.statusCode = code; return this; },
        json(data) { send(res, this.statusCode, data); },
        end() { res.end(); }
      };
      return chatHandler(mockReq, mockRes);
    }
    const match = pathname.match(/^\/api\/markets\/([A-Za-z]{3})$/);
    if (match) {
      const pack = await evidence(); const market = pack.market_records.find(m => m.iso3 === match[1].toUpperCase());
      return market ? send(res, 200, market) : send(res, 404, {error:"Market not found"});
    }
    let file = pathname === "/" ? path.join(dist, "index.html") : path.resolve(dist, "." + pathname);
    if (!file.startsWith(dist)) return send(res, 403, {error:"Forbidden"});
    const info = await stat(file); if (!info.isFile()) return send(res, 404, {error:"Not found"});
    const body = await readFile(file); send(res, 200, body, mime[path.extname(file)] || "application/octet-stream");
  } catch (error) { send(res, error?.code === "ENOENT" ? 404 : 500, {error:error?.message || "Server error"}); }
});
server.listen(port, "127.0.0.1", () => console.log(`Global ESL Market Atlas running at http://127.0.0.1:${port}`));