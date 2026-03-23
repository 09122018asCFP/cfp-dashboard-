exports.handler = async (event) => {
  const symbols = (event.queryStringParameters?.symbols || 'SPY').split(',');
  
  const results = [];
  
  for (const symbol of symbols.slice(0, 30)) {
    const sym = symbol.trim();
    // Use stooq as primary source - no API key needed, works from servers
    // stooq format: /q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv
    try {
      const stooqSym = sym.replace('.BA', '_BA').replace('^', '').replace('-Y.NYB', '').toLowerCase();
      const suffix = sym.endsWith('.BA') ? '.ba' : sym.startsWith('^') ? '' : '.us';
      const stooqUrl = `https://stooq.com/q/l/?s=${stooqSym}${suffix}&f=sd2ohlcv&h&e=json`;
      
      const res = await fetch(stooqUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (res.ok) {
        const text = await res.text();
        // stooq returns CSV: Symbol,Date,Open,High,Low,Close,Volume
        const lines = text.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[1].split(',');
          const close = parseFloat(parts[4]);
          if (!isNaN(close) && close > 0) {
            results.push({
              symbol: sym,
              regularMarketPrice: close,
              regularMarketPreviousClose: close,
              regularMarketChangePercent: 0,
            });
            continue;
          }
        }
      }
    } catch(e) {}

    // Fallback: try Yahoo Finance with different approach
    try {
      const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`;
      const res = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com',
        }
      });
      if (res.ok) {
        const data = await res.json();
        const chart = data?.chart?.result?.[0];
        if (chart) {
          const quotes = chart.indicators?.quote?.[0];
          const closes = quotes?.close?.filter(v => v != null);
          if (closes && closes.length >= 1) {
            const last = closes[closes.length - 1];
            const prev = closes.length >= 2 ? closes[closes.length - 2] : last;
            const pct = prev !== 0 ? ((last - prev) / prev) * 100 : 0;
            results.push({
              symbol: sym,
              regularMarketPrice: last,
              regularMarketPreviousClose: prev,
              regularMarketChangePercent: pct,
            });
            continue;
          }
        }
      }
    } catch(e) {}

    // If all fails, push empty
    results.push({
      symbol: sym,
      regularMarketPrice: null,
      regularMarketPreviousClose: null,
      regularMarketChangePercent: null,
    });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ quoteResponse: { result: results } })
  };
};
