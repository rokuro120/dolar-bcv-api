import axios from 'axios';
import * as cheerio from 'cheerio';

let cachedRate: {
  rate: number;
  date: string;
  lastUpdated: string;
} | null = null;
let lastScrapeTime = 0;

async function scrapeDollar() {
  try {
    const { data: html } = await axios.get('https://www.bcv.org.ve/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
      },
      timeout: 20000,
    });

    const $ = cheerio.load(html);
    let rateText = '';

    // Selector principal del BCV (estructura actual)
    rateText = $('#dolar strong').text().trim();

    if (!rateText) {
      rateText = $('div#dolar .centrado strong').text().trim();
    }

    if (!rateText) {
      // Backup: buscar en todo el HTML el patrón numérico venezolano
      const matches = html.match(/(\d{1,3}(?:\.\d{3})*,\d{4,8})/g);
      if (matches && matches.length > 0) {
        rateText =
          matches.find((m: string) =>
            parseFloat(m.replace(/\./g, '').replace(',', '.')) > 10
          ) || matches[0];
      }
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 10) {
      console.error('❌ No se encontró tasa válida. Texto:', rateText);
      throw new Error('Tasa inválida');
    }

    cachedRate = {
      rate: Number(rate.toFixed(4)),
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa USD encontrada: ${rate}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping BCV:', error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const now = Date.now();

  if (!cachedRate || now - lastScrapeTime > 1800000) {
    const result = await scrapeDollar();
    if (result) lastScrapeTime = now;
  }

  if (cachedRate) {
    res.status(200).json(cachedRate);
  } else {
    res.status(503).json({
      error: 'No se pudo obtener la tasa en este momento',
      message: 'Inténtalo nuevamente en unos minutos',
    });
  }
}