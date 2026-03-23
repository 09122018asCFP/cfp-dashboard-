exports.handler = async () => {
  try {
    const res = await fetch('https://api.bcra.gob.ar/estadisticas/v2.0/principalesvariables');
    const data = await res.json();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
