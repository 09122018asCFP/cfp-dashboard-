exports.handler = async (event) => {
  const endpoint = event.queryStringParameters?.endpoint || '/live/arg_bonds';
  try {
    const res = await fetch(`https://data912.com${endpoint}`);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
