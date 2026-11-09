const mineflayer = require('mineflayer');
const express = require('express');

// --- KEEP ALIVE (7/24 UYUMAMA) SUNUCUSU ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('5 Tane Bot 7/24 aktif tutuluyor!');
});

app.listen(PORT, () => {
  console.log(`Web sunucusu ${PORT} portunda çalışıyor.`);
});

// --- MINECRAFT BOT AYARLARI ---
const SERVER_HOST = 'sofiamc.mcsh.gg'; // Buraya sunucu IP adresini yaz (örn: sunucum.aternos.me)
const SERVER_PORT = 25565;               // Sunucu Portu (varsayılan: 25565)
const MC_VERSION = '1.21.4';             // Minecraft Sürümü
const BOT_COUNT = 5;                     // Toplam bot sayısı

// 5 Tane Bot Oluşturma Fonksiyonu
function startBot(index) {
  const username = `bot_${index}`;

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: username,
    version: MC_VERSION
  });

  bot.on('spawn', () => {
    console.log(`[+] ${bot.username} sunucuya başarıyla katıldı!`);

    // Botların afk kalıp kick yememesi için rastgele aralıklarla zıplama
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 12000 + index * 1000); // Hepsi aynı anda zıplamasın diye süre farkı
  });

  // Sunucuya ilk giriş veya sonraki girişler için kayıt/login işlemleri
  bot.once('spawn', () => {
    setTimeout(() => {
      bot.chat('/register baba1234 baba1234');
      setTimeout(() => {
        bot.chat('/login baba1234');
      }, 3000);
    }, 4000);
  });

  bot.on('chat', (usernameMsg, message) => {
    if (usernameMsg === bot.username) return;
    
    if (message.toLowerCase().includes('register') || message.toLowerCase().includes('kayıt')) {
      bot.chat('/register baba1234 baba1234');
    }
    if (message.toLowerCase().includes('login') || message.toLowerCase().includes('giriş')) {
      bot.chat('/login baba1234');
    }
  });

  bot.on('kicked', (reason) => {
    console.log(`[-] ${username} sunucudan atıldı. Sebep: ${reason}`);
  });

  bot.on('error', (err) => {
    console.error(`[!] ${username} Hatası:`, err.message);
  });

  // Düşen bot otomatik olarak 5 saniye sonra tekrar bağlanır
  bot.on('end', () => {
    console.log(`[-] ${username} bağlantısı kesildi. 5 saniye sonra tekrar bağlanıyor...`);
    setTimeout(() => startBot(index), 5000);
  });
}

// Botları 2'şer saniye arayla oyuna sok (Sunucu ban atmasın diye)
for (let i = 1; i <= BOT_COUNT; i++) {
  setTimeout(() => {
    startBot(i);
  }, i * 2000);
}
