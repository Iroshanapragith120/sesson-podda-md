const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/pairing', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: "No number provided" });

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: `session-${Date.now()}` }),
        puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });

    client.on('ready', async () => {
        // ලොග් වුණාම සෙෂන් අයිඩී එක හදලා නම්බර් එකට යැවීම
        const sessionId = "PODDA-MD;;;" + Buffer.from(JSON.stringify(client.info)).toString('base64');
        await client.sendMessage(client.info.wid._serialized, `🚀 *PODDA MD SESSION ID*\n\n\`${sessionId}\`\n\nCopy this ID to your config file.`);
        console.log("Session Sent!");
        // සර්වර් එකේ ඉඩ ඉතුරු කරන්න මෙතනින් ක්ලියන්ට්ව නතර කරනවා
        setTimeout(() => client.destroy(), 5000);
    });

    client.initialize();

    // පයිරින් කෝඩ් එක රික්වෙස්ට් කිරීම
    setTimeout(async () => {
        try {
            const code = await client.requestPairingCode(number);
            res.json({ code: code });
        } catch (e) {
            res.json({ error: "Failed to get code" });
        }
    }, 6000);
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
