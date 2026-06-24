import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

let cachedRate: {
  rate: number;
  source: string;
  date: string;
  lastUpdated: string;
} | null = null;
let lastScrapeTime = 0;

async function scrapeBDV() {
  try {
    const { data: html } = await axios.get('https://www.bancodevenezuela.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
      },
      timeout: 20000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(html);

    // Selectores exactos según DevTools del BDV
    let rateText = $('span#mesa-cambio-bdv-dolar').text().trim();

    if (!rateText) {
      rateText = $('span#mesa-cambio-bcv-dolar').text().trim();
    }

    if (!rateText) {
      rateText = $('[id*="mesa-cambio"][id*="dolar"]').first().text().trim();
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 100) {
      throw new Error(`Tasa inválida: "${rateText}"`);
    }

    cachedRate = {
      rate: Number(rate.toFixed(4)),
      source: 'Banco de Venezuela',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BDV: ${rate}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping BDV:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const now = Date.now();

  if (!cachedRate || now - lastScrapeTime > 1800000) {
    const result = await scrapeBDV();
    if (result) lastScrapeTime = now;
  }

  if (cachedRate) {
    res.status(200).json(cachedRate);
  } else {
    // TEMPORAL: muestra el error real
    try {
      const { data: html } = await axios.get('https://www.bancodevenezuela.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        },
        timeout: 20000,
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      });
      res.status(200).json({ 
        debug: true,
        htmlLength: html.length,
        selectorResult: {
            byId: require('cheerio').load(html)('span#mesa-cambio-bdv-dolar').text(),
            byIdBCV: require('cheerio').load(html)('span#mesa-cambio-bcv-dolar').text(),
            anySpanWithMesa: require('cheerio').load(html)('[id*="mesa-cambio"]').map((_: any, el: any) => ({
            id: require('cheerio').load(html)(el).attr('id'),
            text: require('cheerio').load(html)(el).text()
            })).get(),
        }
        });
    } catch (err: any) {
      res.status(503).json({
        debug: true,
        errorMessage: err.message,
        errorCode: err.code,
        status: err.response?.status,
      });
    }
  }
}

