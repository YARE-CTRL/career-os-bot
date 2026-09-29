# Career OS — WhatsApp Bot

Bot de WhatsApp para automatizar la atención de pagos por Nequi y activación del Plan Pro.

## Flujo de conversación

```
Usuario (app)     →  "Buen día equipo de Career OS... mi User ID es: xxx"
Bot               →  "Transfiere $9.900 COP al Nequi 3053421833 y envíanos el comprobante."
Usuario           →  [envía foto del comprobante]
Bot               →  "✅ Comprobante recibido. Te activamos en los próximos minutos."
Tú (admin)        →  Verificas en Nequi, vas a /admin y activas el usuario.
```

## Despliegue en Railway

### 1. Crear repositorio en GitHub
```bash
cd career-os-bot
git init
git add .
git commit -m "feat: initial bot setup"
git remote add origin https://github.com/TU_USUARIO/career-os-bot.git
git push -u origin main
```

### 2. Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app) y crea un nuevo proyecto.
2. Selecciona **"Deploy from GitHub repo"** → elige `career-os-bot`.
3. Railway detectará el `Dockerfile` automáticamente.

### 3. Configurar volumen (CRÍTICO para persistir la sesión)
Sin esto, cada deploy borra la sesión y tendrás que escanear el QR de nuevo.

1. En Railway → tu servicio → **"Add Volume"**
2. Mount path: `/data`
3. Eso es todo. Los archivos de sesión y el log de pagos vivirán en ese disco persistente.

### 4. Configurar variables de entorno
En Railway → tu servicio → **Settings → Variables**, agrega:

| Variable | Valor |
|---|---|
| `NEQUI_NUMBER` | `3053421833` |
| `PLAN_PRICE` | `9.900` |
| `PLAN_NAME` | `Plan Pro` |
| `SESSION_DATA_PATH` | `/data/.wwebjs_auth` |
| `PAYMENT_LOG_PATH` | `/data/payments.json` |

### 5. Escanear el QR
1. Una vez desplegado, ve a la URL pública de tu servicio en Railway.
2. Verás un QR en la pantalla.
3. En tu WhatsApp de negocio: **Dispositivos vinculados → Vincular dispositivo** → Escanear.
4. Listo. El bot queda activo 24/7.

## Desarrollo local (opcional)

```bash
npm install
node src/index.js
# Visita http://localhost:3001 para ver el QR
```

## Log de pagos

Cada comprobante recibido se registra en `/data/payments.json`:

```json
[
  {
    "chatId": "573001234567@c.us",
    "userId": "a1b2c3d4-...",
    "plan": "monthly",
    "amount": 9900,
    "status": "pending_verification",
    "note": "Comprobante recibido. Verificación manual pendiente.",
    "createdAt": "2026-09-29T18:00:00.000Z"
  }
]
```

> **Fase 2:** Este archivo se reemplazará por integración directa con Google Sheets para análisis en Power BI.

## Nota de seguridad (`npm audit`)

`npm audit` reporta 5 vulnerabilidades en `extract-zip`, dependencia transitiva de `puppeteer`.  
**No son explotables en este proyecto** porque el `Dockerfile` incluye:

```
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

Esto hace que `puppeteer` use el Chrome instalado del sistema y nunca invoque `extract-zip` para descargar nada. El código vulnerable nunca se ejecuta.
