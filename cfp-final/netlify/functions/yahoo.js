exports.handler = async (event) => {
  const symbols = event.queryStringParameters?.symbols || 'SPY';
  
  // Try multiple Yahoo Finance endpoints
  const urls = [
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent`,
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
    'Cache-Control': 'no-cache',
  };

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      const results = data?.quoteResponse?.result;
      if (results && results.length > 0) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(data)
        };
      }
    } catch (e) { continue; }
  }

  // Fallback: try with crumb
  try {
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', { headers });
    const crumb = await crumbRes.text();
    const urlWithCrumb = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&crumb=${encodeURIComponent(crumb)}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent`;
    const res = await fetch(urlWithCrumb, { headers });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
