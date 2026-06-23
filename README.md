# 🇻🇪 Dólar BCV API

API gratuita y de código abierto para consultar la **tasa oficial del dólar** publicada por el Banco Central de Venezuela (BCV).

Esta API obtiene automáticamente la información desde el sitio oficial del BCV y la expone mediante un endpoint JSON simple, ideal para integrarla en aplicaciones web, móviles, sistemas administrativos, bots, dashboards, videojuegos y herramientas financieras.

---

## 🚀 Características

* Consulta rápida de la tasa oficial del dólar BCV.
* Respuestas en formato JSON.
* Actualización automática de datos.
* Caché inteligente para mejorar el rendimiento.
* Desarrollada con TypeScript y Vercel.
* Gratuita y fácil de integrar.
* Código abierto.

---

## 🌐 URL Base

```text
https://TU-PROYECTO.vercel.app
```

Reemplaza `TU-PROYECTO` por el dominio generado por Vercel después del despliegue.

**Ejemplo:**

```text
https://dolar-bcv-api.vercel.app
```

---

## 📌 Endpoints

### Obtener tasa oficial del dólar

```http
GET /api/dollar
```

#### Respuesta

```json
{
  "rate": 85.67,
  "date": "2026-06-23",
  "lastUpdated": "2026-06-23T17:15:22.456Z"
}
```

| Campo       | Tipo   | Descripción                             |
| ----------- | ------ | --------------------------------------- |
| rate        | number | Tasa oficial del dólar BCV              |
| date        | string | Fecha de publicación de la tasa         |
| lastUpdated | string | Fecha y hora de actualización de la API |

---

### Información de la API

```http
GET /
```

Retorna un mensaje de bienvenida con información básica sobre la API.

---

## 💻 Ejemplos de Uso

### JavaScript / TypeScript

```ts
const response = await fetch(
  'https://TU-PROYECTO.vercel.app/api/dollar'
);

const data = await response.json();

console.log(`💰 Tasa BCV: ${data.rate} Bs/USD`);
console.log(`📅 Fecha: ${data.date}`);
```

### cURL

```bash
curl https://TU-PROYECTO.vercel.app/api/dollar
```

---

## 🛠 Tecnologías Utilizadas

* TypeScript
* Vercel Serverless Functions
* Axios
* Cheerio
* Caché en memoria

---

## 🚀 Despliegue

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/dolar-bcv-api.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar localmente

```bash
npm run dev
```

### 4. Desplegar en Vercel

1. Sube el proyecto a GitHub.
2. Ingresa a Vercel.
3. Importa el repositorio.
4. Realiza el despliegue.

Vercel detectará automáticamente la configuración del proyecto.

---

## ⚠️ Advertencia

Esta API no está afiliada ni es un servicio oficial del Banco Central de Venezuela (BCV).

La información es obtenida desde datos públicos disponibles en el sitio web del BCV. Se recomienda verificar siempre la tasa oficial directamente en el portal del BCV.

El funcionamiento de la API depende de la estructura actual del sitio web del BCV. Si esta cambia, puede ser necesario actualizar el sistema de extracción de datos.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas.

Puedes colaborar mediante:

* Corrección de errores.
* Optimización del scraping.
* Nuevos endpoints.
* Mejoras de rendimiento.
* Reporte de problemas.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT.

---

Desarrollado para facilitar la integración de la tasa BCV en proyectos venezolanos 🇻🇪
