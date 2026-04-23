FROM node:18-slim

# Puppeteer වලට අවශ්‍ය Linux Libraries සහ Chrome ඉන්ස්ටෝල් කිරීම
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer එකට කියනවා Chrome තියෙන තැන
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Package files කොපි කරලා ඉන්ස්ටෝල් කිරීම
COPY package*.json ./
RUN npm install

# ඉතිරි ඔක්කොම ෆයිල් කොපි කිරීම
COPY . .

# සර්වර් එක රන් කරන පෝර්ට් එක (Hugging Face default 7860)
EXPOSE 7860
ENV PORT=7860

CMD ["node", "server.js"]
