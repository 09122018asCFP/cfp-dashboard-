exports.handler = async (event) => {
  const sym = event.queryStringParameters?.sym || 'SPY';
  const period1 = event.queryStringParameters?.period1 || '1735516800';
  const period2 = event.queryStringParameters?.period2 || '1735689600';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&period1=${period1}&period2=${period2}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
