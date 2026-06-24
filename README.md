# Dólar BCV API

> API gratuita y de código abierto para consultar la tasa oficial del dólar en Venezuela.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://dolar-bcv-api.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-active-success)](https://dolar-bcv-api.vercel.app/api/dollar)

---

## ¿Qué es esto?

**Dólar BCV API** expone la tasa de cambio oficial del dólar en Venezuela a través de endpoints JSON simples, con caché inteligente para minimizar la carga sobre las fuentes de datos.

Cuenta con dos endpoints independientes:

- **`/api/dollar`** — tasa oficial publicada directamente por el [Banco Central de Venezuela](https://www.bcv.org.ve)
- **`/api/bdv`** — tasa del dólar con cierre anterior y valor del día, vía [Banca y Negocios](https://www.bancaynegocios.com)

Ideal para integrar en aplicaciones web, móviles, sistemas administrativos, bots, dashboards y herramientas financieras.

---

## Base URL

```
https://dolar-bcv-api.vercel.app
```

---

## Endpoints

### `GET /api/dollar`

Tasa oficial del dólar publicada por el BCV.

```bash
curl https://dolar-bcv-api.vercel.app/api/dollar
```

**Respuesta exitosa — `200 OK`**

```json
{
  "rate": 621.5299,
  "source": "Banco Central de Venezuela",
  "date": "2026-06-24",
  "lastUpdated": "2026-06-24T00:00:33.357Z"
}
```

| Campo         | Tipo     | Descripción                                     |
| ------------- | -------- | ----------------------------------------------- |
| `rate`        | `number` | Tasa oficial del dólar BCV (4 decimales)        |
| `source`      | `string` | Fuente de los datos                             |
| `date`        | `string` | Fecha de consulta (`YYYY-MM-DD`)                |
| `lastUpdated` | `string` | Timestamp de la última actualización (ISO 8601) |

---

### `GET /api/bdv`

Tasa del dólar con valor del día y cierre anterior.

```bash
curl https://dolar-bcv-api.vercel.app/api/bdv
```

**Respuesta exitosa — `200 OK`**

```json
{
  "rate": 621.5299,
  "rateAnterior": 617.6388,
  "source": "Banca y Negocios (Fuente: BCV)",
  "date": "2026-06-24",
  "lastUpdated": "2026-06-24T00:43:58.931Z"
}
```

| Campo          | Tipo     | Descripción                                     |
| -------------- | -------- | ----------------------------------------------- |
| `rate`         | `number` | Tasa del dólar del día (4 decimales)            |
| `rateAnterior` | `number` | Tasa del cierre anterior (4 decimales)          |
| `source`       | `string` | Fuente de los datos                             |
| `date`         | `string` | Fecha de consulta (`YYYY-MM-DD`)                |
| `lastUpdated`  | `string` | Timestamp de la última actualización (ISO 8601) |

---

**Respuesta de error — `503 Service Unavailable`** (ambos endpoints)

```json
{
  "error": "No se pudo obtener la tasa en este momento",
  "message": "Inténtalo nuevamente en unos minutos"
}
```

---

### `GET /`

Mensaje de bienvenida con información básica de la API.

---

## Ejemplos de integración

### JavaScript / TypeScript

```ts
// Tasa BCV oficial
const res = await fetch('https://dolar-bcv-api.vercel.app/api/dollar');
const { rate, source, date } = await res.json();
console.log(`${source}: ${rate} Bs/USD (${date})`);

// Tasa con cierre anterior
const res2 = await fetch('https://dolar-bcv-api.vercel.app/api/bdv');
const { rate: hoy, rateAnterior } = await res2.json();
console.log(`Hoy: ${hoy} — Ayer: ${rateAnterior}`);
```

### Python

```python
import requests

# Tasa BCV oficial
data = requests.get('https://dolar-bcv-api.vercel.app/api/dollar').json()
print(f"Tasa BCV: {data['rate']} Bs/USD")

# Tasa con cierre anterior
data2 = requests.get('https://dolar-bcv-api.vercel.app/api/bdv').json()
print(f"Hoy: {data2['rate']} — Ayer: {data2['rateAnterior']}")
```

### cURL

```bash
# Tasa BCV oficial
curl https://dolar-bcv-api.vercel.app/api/dollar

# Tasa con cierre anterior
curl https://dolar-bcv-api.vercel.app/api/bdv
```

---

## Stack tecnológico

| Tecnología                  | Rol                                         |
| --------------------------- | ------------------------------------------- |
| TypeScript                  | Lenguaje principal                          |
| Vercel Serverless Functions | Infraestructura de despliegue               |
| Axios                       | Cliente HTTP para el scraping               |
| Cheerio                     | Parsing del HTML                            |
| Caché en memoria            | Reducción de requests a las fuentes (30 min)|

---

## Instalación y despliegue

### Prerrequisitos

- Node.js 18+
- Cuenta en [Vercel](https://vercel.com) (para producción)

### Ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/rokuro120/dolar-bcv-api.git
cd dolar-bcv-api

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`.

### Desplegar en Vercel

```bash
npm install -g vercel
vercel
```

O importa el repositorio directamente en [vercel.com/new](https://vercel.com/new). Vercel detecta la configuración automáticamente.

---

## Comportamiento del caché

Ambos endpoints almacenan la tasa en memoria con un TTL de **30 minutos** para no saturar las fuentes de datos.

```
Primera request       →  scraping  →  almacena en caché  →  responde
Requests < 30 min     →  responde desde caché
Request tras 30 min   →  nuevo scraping  →  actualiza caché  →  responde
```

---

## Fuentes de datos

| Endpoint      | Fuente                                                     |
| ------------- | ---------------------------------------------------------- |
| `/api/dollar` | [bcv.org.ve](https://www.bcv.org.ve) (BCV oficial)        |
| `/api/bdv`    | [bancaynegocios.com](https://www.bancaynegocios.com) (BCV) |

---

## Aviso importante

> Esta API **no es un servicio oficial** del Banco Central de Venezuela ni de ninguna entidad bancaria venezolana.
>
> La información se obtiene desde fuentes públicas. Para decisiones financieras críticas, verifica siempre la tasa directamente en el portal oficial del BCV. El funcionamiento puede verse afectado si las fuentes cambian su estructura HTML.

---

## Contribuciones

Las contribuciones son bienvenidas. Antes de abrir un PR, revisa los issues abiertos o crea uno nuevo describiendo el cambio propuesto.

Áreas donde puedes colaborar:

- Corrección de errores o selectores desactualizados
- Nuevos endpoints (EUR, otras divisas)
- Mejoras de rendimiento o resiliencia
- Tests automatizados
- Documentación

---

## Licencia

Distribuido bajo la licencia [MIT](LICENSE). Libre para uso personal y comercial.

---

<p align="center">Hecho con ❤️ para la comunidad venezolana 🇻🇪</p>