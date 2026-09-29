# Career OS — WhatsApp Bot 🤖

Bot de atención automatizada para el proceso de pago y activación del **Plan Pro** de Career OS.

## ¿Qué hace?

Cuando un usuario hace clic en "Pagar con Nequi" dentro de la app, se abre WhatsApp con un mensaje predefinido. Este bot intercepta ese mensaje y gestiona el proceso automáticamente:

```
Usuario  →  Mensaje de pago con su User ID
Bot      →  Instrucciones de transferencia Nequi
Usuario  →  Foto del comprobante
Bot      →  Confirmación de recepción
Admin    →  Verifica en Nequi → activa en /admin
```

## Stack

- **Runtime:** Node.js 20
- **WhatsApp:** [whatsapp-web.js](https://wwebjs.dev/)
- **Web server:** Express (sirve el QR de vinculación)
- **Hosting:** Railway (Dockerfile)
- **Sesión:** Persistida en volumen de Railway (`/data`)

## Despliegue

### Variables de entorno requeridas

Configura las siguientes variables en Railway → Settings → Variables.
**Nunca las incluyas en el código ni en este repositorio.**

| Variable | Descripción |
|---|---|
| `NEQUI_NUMBER` | Número de Nequi al que los usuarios deben transferir |
| `PLAN_PRICE` | Precio del plan (solo informativo en los mensajes) |
| `PLAN_NAME` | Nombre del plan que se muestra en las respuestas |
| `SESSION_DATA_PATH` | Ruta del volumen donde se guarda la sesión de WhatsApp |
| `PAYMENT_LOG_PATH` | Ruta del archivo de log de pagos recibidos |

### Volumen persistente (obligatorio)

El bot necesita un volumen montado en `/data` para no perder la sesión de WhatsApp entre deploys.

En Railway: **Volumes → Create Volume → Mount path: `/data`**

### Vincular WhatsApp

Una vez desplegado, abre la URL pública del servicio en tu navegador.
Verás un código QR que debes escanear desde WhatsApp → Dispositivos vinculados.

## Desarrollo local

```bash
cp .env.example .env
# Edita .env con tus valores reales
npm install
node src/index.js
# Visita http://localhost:3001 para ver el QR
```

## Nota de seguridad

`npm audit` reporta vulnerabilidades en `extract-zip` (dependencia de Puppeteer).
**No aplican a este proyecto** — el `Dockerfile` usa `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`,
por lo que Puppeteer usa Chrome del sistema operativo y ese código nunca se ejecuta.
