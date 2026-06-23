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

async function scrapeBCV() {
  try {
    const { data: html } = await axios.get('https://www.bcv.org.ve/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
      },
      timeout: 20000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(html);

    // Selector exacto del BCV
    let rateText = $('#dolar .col-sm-6.centrado.textp strong').text().trim();

    if (!rateText) rateText = $('#dolar .strong-tb').text().trim();
    if (!rateText) rateText = $('#dolar strong').text().trim();

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 100) {
      throw new Error(`Tasa inválida: "${rateText}"`);
    }

    cachedRate = {
      rate: Number(rate.toFixed(4)),
      source: 'Banco Central de Venezuela',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BCV: ${rate}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping BCV:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const now = Date.now();

  if (!cachedRate || now - lastScrapeTime > 1800000) {
    const result = await scrapeBCV();
    if (result) lastScrapeTime = now;
  }

  if (cachedRate) {
    res.status(200).json(cachedRate);
  } else {
    res.status(503).json({
      error: 'No se pudo obtener la tasa del BCV',
      message: 'Inténtalo nuevamente en unos minutos',
    });
  }
}