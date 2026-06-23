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
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // Selector exacto según la imagen que mostraste
    let rateText = $('#mesa-cambio-bcv-dolar').text().trim();

    // Backup por si cambia el ID
    if (!rateText) {
      rateText = $('span[id*="bcv-dolar"]').first().text().trim();
    }

    if (!rateText) {
      // Buscar cualquier número grande con comas
      const match = html.match(/(\d{1,3}(?:\.\d{3})*,\d{4})/);
      if (match) rateText = match[1];
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 100) {
      throw new Error(`Tasa inválida: ${rateText}`);
    }

    // Fecha actual (el BDV no muestra fecha exacta fácilmente)
    const dateText = new Date().toISOString().split('T')[0];

    cachedRate = {
      rate,
      date: dateText,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BDV actualizada: ${rate}`);
    return cachedRate;

  } catch (error) {
    console.error('❌ Error al obtener tasa:', error);
    return null;
  }
}

// Handler principal
export default async function handler(req: any, res: any) {
  const now = Date.now();

  if (!cachedRate || now - lastScrapeTime > 3600000) { // cada hora
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