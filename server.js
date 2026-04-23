const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 7860; // Hugging Face default port එක

app.use(express.static('public'));
app.use(express.json());

// Main Page එක පෙන්වීමට
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pairing Code ලබා ගැනීමේ Endpoint එක
app.get('/pairing', async (req, res) => {
    let number = req.query.number;

    if (!number) {
        return res.status(400).json({ error: "කරුණාකර දුරකථන අංකය ලබා දෙන්න!" });
    }

    // අංකයේ ප්ලස් ලකුණු හෝ හිස්තැන් අයින් කිරීම
    number = number.replace(/[^0-9]/g, '');

    console.log(`🚀 Pairing Code ඉල්ලනවා: ${number}`);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: `session-${Date.now()}` }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ],
            // Docker එකේ Chrome තියෙන තැන (Dockerfile එකේ අපි මේක සෙට් කරනවා)
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
        }
    });

    // ලොග් වුණාම Session ID එක හදලා WhatsApp යවන ලොජික් එක
    client.on('ready', async () => {
        console.log("✅ Client is ready!");
        try {
            // සරල Session ID එකක් (Base64)
            const sessionObj = {
                wid: client.info.wid,
                platform: client.info.platform,
                pushname: client.info.pushname
            };
            const sessionId = "PODDA-MD;;;" + Buffer.from(JSON.stringify(sessionObj)).toString('base64');

            const message = `🚀 *PODDA MD SESSION ID* 🚀\n\n` +
                            `ඔබේ Session ID එක සාර්ථකව උත්පාදනය විය.\n\n` +
                            `\`\`\`${sessionId}\`\`\`\n\n` +
                            `මෙම කේතය කොපි කර config.js හි SESSION_ID ලෙස භාවිතා කරන්න.\n\n` +
                            `> Powered by Podda MD`;

            await client.sendMessage(client.info.wid._serialized, message);
            console.log("📤 Session ID එක WhatsApp වෙත යැවුවා!");
            
            // සර්වර් එකේ රෑම් එක ඉතුරු කරගන්න විනාඩි 2කින් ක්ලියන්ට්ව නතර කරනවා
            setTimeout(() => {
                client.destroy();
                console.log("🔌 Client disconnected to save resources.");
            }, 120000);

        } catch (err) {
            console.error("❌ Session sending error:", err);
        }
    });

    client.initialize();

    // පයිරින් කෝඩ් එක රික්වෙස්ට් කිරීම
    setTimeout(async () => {
        try {
            const code = await client.requestPairingCode(number);
            console.log(`🔑 Pairing Code: ${code}`);
            res.json({ code: code });
        } catch (err) {
            console.error("❌ Pairing error:", err);
            res.status(500).json({ error: "කේතය ලබා ගැනීමට අපොහොසත් විය. නැවත උත්සාහ කරන්න." });
        }
    }, 8000); // තත්පර 8ක් රැඳී සිටීම (Client init වෙන්න වෙලාව ඕන නිසා)
});

app.listen(PORT, () => {
    console.log(`
    =========================================
    🤖 PODDA MD SESSION GENERATOR IS RUNNING
    🌍 Port: ${PORT}
    🚀 Mode: Hacker Style Active
    =========================================
    `);
});
