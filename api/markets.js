import { readFile } from 'node:fs/promises';
import path from 'node:path';

let cachedData = null;

async function getData() {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), 'app', 'dist', 'market-data.json');
  cachedData = JSON.parse(await readFile(filePath, 'utf8'));
  return cachedData;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const data = await getData();
    const { cluster, minimum_evidence, iso } = req.query || {};

    if (iso) {
      const market = data.market_records.find(m => m.iso3 === String(iso).toUpperCase());
      if (!market) return res.status(404).json({ error: 'Market not found' });
      return res.status(200).json(market);
    }

    let records = data.market_records;
    if (cluster) {
      records = records.filter(m => m.cluster.toLowerCase() === String(cluster).toLowerCase());
    }
    if (minimum_evidence) {
      records = records.filter(m => m.ratings.evidence_confidence >= Number(minimum_evidence));
    }

    return res.status(200).json({
      as_of: data.as_of,
      count: records.length,
      markets: records
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
