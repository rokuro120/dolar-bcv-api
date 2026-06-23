import axios from 'axios';
import * as cheerio from 'cheerio';

let cachedRate: {
  rate: number;
  date: string;
  lastUpdated: string;
} | null = null;

let lastScrapeTime = 0;

async function scrapeBCV() {
  try {
    const { data: html } = await axios.get('https://www.bancodevenezuela.com/index.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DolarBCV-API/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    // Selector actualizado (junio 2026)
    let rateText = '';

    // Buscar directamente después de "USD"
    $('strong').each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes(',') && text.length > 8) {
        const prevText = $(el).parent().prev().text().trim();
        if (prevText === 'USD' || prevText.includes('USD')) {
          rateText = text;
          return false; // break
        }
      }
    });

    // Backup
    if (!rateText) {
      rateText = html.match(/USD[\s\S]*?(\d{1,3}(?:\.\d{3})*,\d{6})/i)?.[1] || '';
    }

    const cleanRate = rateText.replace(/\./g, '').replace(',', '.');
    const rate = parseFloat(cleanRate);

    if (isNaN(rate) || rate < 30) {
      throw new Error(`Tasa inválida extraída: ${rateText}`);
    }

    // Extraer fecha
    const dateMatch = html.match(/Fecha Valor:\s*([^\n<]+)/i);
    const dateText = dateMatch 
      ? dateMatch[1].trim() 
      : new Date().toISOString().split('T')[0];

    cachedRate = {
      rate,
      date: dateText,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BCV actualizada: ${rate} | ${dateText}`);
    return cachedRate;

  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error);
    return null;
  }
}

// Handler principal para Vercel
export default async function handler(req: any, res: any) {
  const now = Date.now();

  // Actualizar cada 4 horas como máximo
  if (!cachedRate || now - lastScrapeTime > 4 * 60 * 60 * 1000) {
    const result = await scrapeBCV();
    if (result) {
      lastScrapeTime = now;
    }
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