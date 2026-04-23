const express = require('express');
const { Client, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 7860;

app.use(express.static('public'));

// Optimized Puppeteer for Hugging Face
const pOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--no-zygote'],
    executablePath: '/usr/bin/chromium'
};

const client = new Client({
    authStrategy: new NoAuth(),
    puppeteer: pOptions,
    webVersionCache: { type: 'none' } // Error Fix: Disable Cache
});

client.initialize().catch(err => console.log("Init Error: " + err.message));

app.get('/pairing', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.status(400).send("No Number");
    num = num.replace(/[^0-9]/g, '');

    console.log(`[TERMINAL] PAIRING REQUEST: ${num}`);

    try {
        // Wait 15s for the browser to stabilize
        setTimeout(async () => {
            try {
                const code = await client.requestPairingCode(num);
                res.json({ code: code });
                console.log(`[TERMINAL] CODE GENERATED: ${code}`);
            } catch (err) {
                res.status(500).json({ error: "Retry" });
            }
        }, 15000);
    } catch (e) {
        res.status(500).send("Error");
    }
});

app.get('/qr', async (req, res) => {
    client.once('qr', async (qr) => {
        const qrImg = await qrcode.toDataURL(qr);
        if(!res.headersSent) res.json({ qr: qrImg });
    });
});

client.on('ready', () => {
    console.log("[TERMINAL] CLIENT READY");
});

app.listen(PORT, () => console.log(`[TERMINAL] SERVER ONLINE ON ${PORT}`));
