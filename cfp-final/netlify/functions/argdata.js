exports.handler = async (event) => {
  const path = event.queryStringParameters?.path || 'finanzas/indices/riesgo-pais/ultimo';
  try {
    const res = await fetch(`https://api.argentinadatos.com/v1/${path}`);
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
