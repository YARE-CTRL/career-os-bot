# Imagen base: Node 20 + Google Chrome (requerido por Puppeteer / whatsapp-web.js)
FROM node:20-slim

# Instalar Google Chrome estable y sus dependencias del sistema
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates \
    --no-install-recommends \
 && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
 && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    >> /etc/apt/sources.list.d/google.list \
 && apt-get update && apt-get install -y \
    google-chrome-stable \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

# Decirle a Puppeteer que use Chrome del sistema (no descargue el suyo)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Instalar dependencias primero (mejor caché de capas)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY . .

# Puerto del servidor web (Railway asigna PORT automáticamente)
EXPOSE 3001

CMD ["node", "src/index.js"]
