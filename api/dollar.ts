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
      timeout: 20000,
    });

    const $ = cheerio.load(html);

    let rateText = '';

    // Selectores según la estructura actual del BDV
    rateText = $('#mesa-cambio-bcv-dolar').text().trim();

    if (!rateText) {
      rateText = $('span[id*="bcv-dolar"]').first().text().trim();
    }

    if (!rateText) {
      rateText = $('span[id*="mesa-cambio"]').text().trim();
    }

    // Backup potente: buscar números con formato típico de tasa (muchos dígitos y coma)
    if (!rateText) {
      const matches = html.match(/(\d{1,3}(?:\.\d{3})*,\d{4,8})/g);
      if (matches && matches.length > 0) {
        // Tomamos el que parece ser del dólar (generalmente el primero o segundo grande)
        rateText = matches.find(m => parseFloat(m.replace(/\./g, '').replace(',', '.')) > 100) || matches[0];
      }
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 100) {
      console.error('❌ No se encontró tasa válida. Texto:', rateText);
      throw new Error('Tasa inválida');
    }

    const dateText = new Date().toISOString().split('T')[0];

    cachedRate = {
      rate: Number(rate.toFixed(4)), // más precisión
      date: dateText,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa USD encontrada: ${rate}`);
    return cachedRate;

  } catch (error) {
    console.error('❌ Error scraping BDV:', error);
    return null;
  }
}

// Handler
export default async function handler(req: any, res: any) {
  const now = Date.now();

  // Forzar actualización si no hay caché o es viejo
  if (!cachedRate || now - lastScrapeTime > 1800000) { // 30 minutos
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