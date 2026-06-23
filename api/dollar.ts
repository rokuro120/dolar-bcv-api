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
    const { data: html } = await axios.get('https://www.bancodevenezuela.com/index.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    let rateText = '';

    // Selector más preciso según la estructura actual del BDV
    rateText = $('#mesa-cambio-bcv-dolar').text().trim();

    // Backups
    if (!rateText) {
      rateText = $('span[id*="bcv-dolar"]').first().text().trim();
    }
    if (!rateText) {
      rateText = $('span:contains("BCV")').parent().find('span[id*="dolar"]').first().text().trim();
    }

    // Último backup: buscar el número que aparece después de "BCV" en la mesa de cambio
    if (!rateText) {
      const match = html.match(/BCV:\s*\$?\s*(\d{1,3}(?:\.\d{3})*,\d+)/i);
      if (match) rateText = match[1];
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 100) {
      console.error('❌ Tasa no válida encontrada:', rateText);
      throw new Error('Tasa inválida');
    }

    const dateText = new Date().toISOString().split('T')[0];

    cachedRate = {
      rate,
      date: dateText,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa USD correcta: ${rate}`);
    return cachedRate;

  } catch (error) {
    console.error('❌ Error al scrapear:', error);
    return null;
  }
}

// Handler
export default async function handler(req: any, res: any) {
  const now = Date.now();

  if (!cachedRate || now - lastScrapeTime > 1800000) { // cada 30 minutos
    const result = await scrapeDollar();
    if (result) lastScrapeTime = now;
  }

  if (cachedRate) {
    res.status(200).json(cachedRate);
  } else {
    res.status(503).json({
      error: "No se pudo obtener la tasa en este momento",
      message: "Inténtalo nuevamente en unos minutos"
    });
  }
}