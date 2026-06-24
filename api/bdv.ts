import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

let cachedRate: {
  rate: number;
  rateAnterior: number;
  source: string;
  date: string;
  lastUpdated: string;
} | null = null;
let lastScrapeTime = 0;

async function scrapeBDV() {
  try {
    const { data: html } = await axios.get('https://www.bancaynegocios.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
      },
      timeout: 20000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    const $ = cheerio.load(html);
    let rateHoy = '';
    let rateAnterior = '';

    // Buscar la fila del Dólar oficial en la tabla iedv
    $('table.iedv tbody tr').each((_: any, row: any) => {
      const cells = $(row).find('td');
      const indicador = $(cells[0]).text().trim().toLowerCase();
      if (indicador.includes('dólar oficial') || indicador.includes('dolar oficial')) {
        rateAnterior = $(cells[1]).text().trim();
        rateHoy      = $(cells[2]).text().trim();
      }
    });

    if (!rateHoy) {
      throw new Error('No se encontró la fila del Dólar oficial');
    }

    const cleanHoy      = rateHoy.replace(/\./g, '').replace(',', '.');
    const cleanAnterior = rateAnterior.replace(/\./g, '').replace(',', '.');
    const hoy      = parseFloat(cleanHoy);
    const anterior = parseFloat(cleanAnterior);

    if (isNaN(hoy) || hoy < 100) {
      throw new Error(`Tasa inválida: "${rateHoy}"`);
    }

    cachedRate = {
      rate: Number(hoy.toFixed(4)),
      rateAnterior: Number(anterior.toFixed(4)),
      source: 'Banca y Negocios (Fuente: BCV)',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa dólar oficial: ${hoy}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping bancaynegocios.com:', error);
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
      error: 'No se pudo obtener la tasa del dólar',
      message: 'Inténtalo nuevamente en unos minutos',
    });
  }
}