# Dólar BCV API

> API gratuita y de código abierto para consultar la tasa oficial del dólar publicada por el Banco Central de Venezuela.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://dolar-bcv-api.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## ¿Qué es esto?

**Dólar BCV API** extrae automáticamente la tasa de cambio oficial publicada por el [Banco Central de Venezuela](https://www.bcv.org.ve) y la expone a través de un endpoint JSON simple, con caché inteligente para minimizar la carga sobre el sitio del BCV.

Ideal para integrar en aplicaciones web, móviles, sistemas administrativos, bots, dashboards y herramientas financieras.

---

## Base URL

```
https://dolar-bcv-api.vercel.app
```

---

## Endpoints

### `GET /api/dollar`

Retorna la tasa oficial del dólar según el BCV.

```bash
curl https://dolar-bcv-api.vercel.app/api/dollar
```

**Respuesta exitosa — `200 OK`**

```json
{
  "rate": 617.6388,
  "date": "2026-06-23",
  "lastUpdated": "2026-06-23T17:15:22.456Z"
}
```

| Campo         | Tipo     | Descripción                                      |
| ------------- | -------- | ------------------------------------------------ |
| `rate`        | `number` | Tasa oficial del dólar BCV (4 decimales)         |
| `date`        | `string` | Fecha de publicación de la tasa (`YYYY-MM-DD`)   |
| `lastUpdated` | `string` | Timestamp de la última actualización (ISO 8601)  |

**Respuesta de error — `503 Service Unavailable`**

```json
{
  "error": "No se pudo obtener la tasa en este momento",
  "message": "Inténtalo nuevamente en unos minutos"
}
```

---

### `GET /`

Retorna un mensaje de bienvenida con información básica de la API.

---

## Ejemplos de integración

### JavaScript / TypeScript

```ts
const response = await fetch('https://dolar-bcv-api.vercel.app/api/dollar');
const { rate, date } = await response.json();

console.log(`Tasa BCV: ${rate} Bs/USD`);
console.log(`Fecha: ${date}`);
```

### Python

```python
import requests

res = requests.get('https://dolar-bcv-api.vercel.app/api/dollar')
data = res.json()

print(f"Tasa BCV: {data['rate']} Bs/USD")
print(f"Fecha: {data['date']}")
```

### cURL

```bash
curl https://dolar-bcv-api.vercel.app/api/dollar
```

---

## Stack tecnológico

| Tecnología                  | Rol                                    |
| --------------------------- | -------------------------------------- |
| TypeScript                  | Lenguaje principal                     |
| Vercel Serverless Functions | Infraestructura de despliegue          |
| Axios                       | Cliente HTTP para el scraping          |
| Cheerio                     | Parsing del HTML del BCV               |
| Caché en memoria            | Reducción de requests al BCV (30 min)  |

---

## Instalación y despliegue

### Prerrequisitos

- Node.js 18+
- Cuenta en [Vercel](https://vercel.com) (para despliegue en producción)

### Ejecutar localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/dolar-bcv-api.git
cd dolar-bcv-api

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`.

### Desplegar en Vercel

```bash
# Con Vercel CLI
npm install -g vercel
vercel
```

O directamente desde la UI: importa el repositorio en [vercel.com/new](https://vercel.com/new). Vercel detecta la configuración automáticamente.

---

## Comportamiento del caché

Para no saturar el sitio del BCV, la API almacena la tasa en memoria con un TTL de **30 minutos**. Si la caché está vigente, la respuesta es inmediata. Si expiró o no existe, se realiza un nuevo scraping antes de responder.

```
Primera request  →  scraping del BCV  →  almacena en caché  →  responde
Requests siguientes (< 30 min)  →  responde desde caché
Request tras 30 min  →  nuevo scraping  →  actualiza caché  →  responde
```

---

## Aviso importante

> Esta API **no es un servicio oficial** del Banco Central de Venezuela ni está afiliada a él. La información se obtiene desde datos públicos disponibles en [bcv.org.ve](https://www.bcv.org.ve).
>
> El funcionamiento depende de la estructura HTML del sitio del BCV. Ante cambios en dicho sitio, puede ser necesario actualizar el selector de scraping. Para decisiones financieras críticas, verifica siempre la tasa directamente en la fuente oficial.

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
