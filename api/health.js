export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    ok: true,
    service: 'global-esl-market-atlas',
    platform: 'vercel',
    now: new Date().toISOString()
  });
}
