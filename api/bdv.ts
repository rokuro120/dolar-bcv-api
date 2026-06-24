import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

let cachedRate: {
  rate: number;
  rateCompra: number;
  rateVenta: number;
  source: string;
  date: string;
  lastUpdated: string;
} | null = null;
let lastScrapeTime = 0;

async function scrapeBDV() {
  try {
    // El BCV publica las tasas de todos los bancos en su propia página
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
    let rateCompra = '';
    let rateVenta = '';

    // El BCV tiene tabla de tasas informativas del sistema bancario
    // Buscar la fila del Banco de Venezuela
    $('table tr').each((_: any, row: any) => {
      const cells = $(row).find('td');
      const banco = $(cells[0]).text().trim();
      if (banco.toLowerCase().includes('banco de venezuela') || 
          banco.toLowerCase().includes('bdv')) {
        rateCompra = $(cells[1]).text().trim();
        rateVenta  = $(cells[2]).text().trim();
      }
    });

    if (!rateCompra && !rateVenta) {
      throw new Error('No se encontró la fila del Banco de Venezuela');
    }

    const cleanCompra = rateCompra.replace(/\./g, '').replace(',', '.');
    const cleanVenta  = rateVenta.replace(/\./g, '').replace(',', '.');
    const compra = parseFloat(cleanCompra);
    const venta  = parseFloat(cleanVenta);

    if (isNaN(compra) || isNaN(venta) || compra < 100) {
      throw new Error(`Tasas inválidas: compra="${rateCompra}" venta="${rateVenta}"`);
    }

    cachedRate = {
      rate: Number(venta.toFixed(4)),
      rateCompra: Number(compra.toFixed(4)),
      rateVenta: Number(venta.toFixed(4)),
      source: 'Banco de Venezuela (vía BCV)',
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✅ Tasa BDV: compra=${compra} venta=${venta}`);
    return cachedRate;
  } catch (error) {
    console.error('❌ Error scraping BDV desde BCV:', error);
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