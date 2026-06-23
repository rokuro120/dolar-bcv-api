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
    const { data: html } = await axios.get('https://www.bancodevenezuela.com/index.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
        'Referer': 'https://www.bancodevenezuela.com/',
      },
      timeout: 20000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(html);
    let rateText = '';

    // Selectores del Banco de Venezuela
    rateText = $('#mesa-cambio-bcv-dolar').text().trim();

    if (!rateText) {
      rateText = $('span[id*="bcv-dolar"]').first().text().trim();
    }

    if (!rateText) {
      rateText = $('span[id*="mesa-cambio"]').text().trim();
    }

    if (!rateText) {
      rateText = $('[class*="tasa"][class*="dolar"]').first().text().trim();
    }

    if (!rateText) {
      rateText = $('[class*="cambio"]').first().text().trim();
    }

    // Backup regex — busca números con formato venezolano (ej: 617,3880)
    if (!rateText) {
      const matches = html.match(/(\d{1,3}(?:\.\d{3})*,\d{2,8})/g);
      if (matches && matches.length > 0) {
        rateText =
          matches.find((m: string) =>
            parseFloat(m.replace(/\./g, '').replace(',', '.')) > 10
          ) || matches[0];
      }
    }

    if (!rateText) {
      throw new Error('No se encontró ningún selector con tasa');
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 10) {
      console.error('❌ Tasa BDV inválida. Texto encontrado:', rateText);
      throw new Error('Tasa inválida');
    }

    cachedRate = {
      rate: Number(rate.toFixed(4)),
      source: 'Banco de Venezuela',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BDV USD: ${rate}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping Banco de Venezuela:', error);
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
    res.status(503).json({
      error: 'No se pudo obtener la tasa del Banco de Venezuela',
      message: 'Inténtalo nuevamente en unos minutos',
    });
  }
}