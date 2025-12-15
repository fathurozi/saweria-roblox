const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let donations = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Saweria-Roblox Bridge</title>
            <style>
                body { font-family: Arial; background: #1a1a2e; color: #eee; padding: 40px; text-align: center; }
                .status { color: #0f0; font-size: 24px; font-weight: bold; }
                .info { background: #16213e; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 600px; }
            </style>
        </head>
        <body>
            <h1>🎮 Saweria-Roblox Bridge</h1>
            <div class="status">✅ SERVER ONLINE</div>
            <div class="info">
                <p>Total donasi: <strong>${donations.length}</strong></p>
                <form action="/test/donate" method="POST">
                    <input type="text" name="username" placeholder="Username Roblox" style="padding: 8px; margin: 5px;">
                    <input type="number" name="amount" placeholder="Jumlah Rp" style="padding: 8px; margin: 5px;">
                    <button type="submit" style="padding: 8px 20px; background: #0f0; border: none; cursor: pointer;">Test Donasi</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/webhook/saweria', (req, res) => {
    console.log('📩 Donasi diterima:', req.body);
    const donation = {
        id: Date.now(),
        username: req.body.donator_name || req.body.username || 'Anonymous',
        amount: parseInt(req.body.amount || req.body.total || 0),
        message: req.body.message || '',
        timestamp: new Date().toISOString()
    };
    donations.push(donation);
    if (donations.length > 100) donations = donations.slice(-100);
    console.log('✅ Donasi disimpan:', donation);
    res.json({ success: true, donation });
});

app.post('/test/donate', (req, res) => {
    const donation = {
        id: Date.now(),
        username: req.body.username || 'TestUser',
        amount: parseInt(req.body.amount) || 10000,
        message: 'Test donation',
        timestamp: new Date().toISOString()
    };
    donations.push(donation);
    console.log('🧪 Test donasi:', donation);
    res.send(`<html><body style="font-family: Arial; background: #1a1a2e; color: #eee; padding: 40px; text-align: center;">
        <h1>✅ Test Donasi Berhasil!</h1>
        <p>Username: ${donation.username}</p>
        <p>Amount: Rp ${donation.amount.toLocaleString('id-ID')}</p>
        <a href="/" style="color: #0f0;">← Kembali</a>
    </body></html>`);
});

app.get('/api/donations', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const since = req.query.since;
    let result = donations;
    if (since) result = donations.filter(d => new Date(d.timestamp) > new Date(since));
    result = result.slice(-limit);
    res.json({ success: true, donations: result, total: result.length });
});

app.get('/api/leaderboard', (req, res) => {
    const leaderboard = {};
    donations.forEach(d => {
        const user = d.username;
        if (!leaderboard[user]) leaderboard[user] = { username: user, total: 0, count: 0 };
        leaderboard[user].total += d.amount;
        leaderboard[user].count += 1;
    });
    const sorted = Object.values(leaderboard).sort((a, b) => b.total - a.total).slice(0, 10);
    res.json({ success: true, leaderboard: sorted });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
});
