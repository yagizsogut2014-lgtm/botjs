const mineflayer = require('mineflayer');
const express = require('express');

// --- KEEP ALIVE SUNUCUSU ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('20 Tane Gelişmiş AFK Botu Active!');
});

app.listen(PORT, () => {
  console.log(`[SYS] Web sunucusu ${PORT} portunda aktif.`);
});

// --- AYARLAR ---
const CONFIG = {
  host: 'sofiamc.mcsh.gg',
  port: 25565,
  version: '1.21.4',
  botCount: 20,
  password: 'baba' + Math.floor(1000 + Math.random() * 9000), // Sabit/Rastgele Şifre
  joinInterval: 4000 // Botlar arası giriş süresi (ms)
};

// Aktif bot nesnelerini ve döngülerini saklama
const activeBots = new Map();

function createAdvancedBot(index) {
  const username = `bot_${index}`;
  console.log(`[+] ${username} başlatılıyor...`);

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: username,
    version: CONFIG.version
  });

  let moveInterval = null;
  let authTimeout = null;

  // --- GELİŞMİŞ HAREKET VE YAYALAMA ALGORİTMASI ---
  const startAdvancedAI = () => {
    if (moveInterval) clearInterval(moveInterval);

    moveInterval = setInterval(() => {
      if (!bot.entity) return;

      // Tüm kontrolleri sıfırla
      bot.clearControlStates();

      const actionChoice = Math.random();

      if (actionChoice < 0.50) {
        // %50 Şans: Rastgele yöne yürü
        const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
        const pitch = (Math.random() * 60 - 30) * (Math.PI / 180);
        bot.look(yaw, pitch, false);
        bot.setControlState('forward', true);

        // Yürürken önüne engel çıkarsa zıpla
        if (bot.entity.isCollidedHorizontally) {
          bot.setControlState('jump', true);
        }
      } else if (actionChoice < 0.75) {
        // %25 Şans: Eğilerek Etrafa Bak (Anti-Bot bypass)
        const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
        bot.look(yaw, 0, false);
        bot.setControlState('sneak', true);
      } else if (actionChoice < 0.90) {
        // %15 Şans: Dur ve Zıpla
        bot.setControlState('jump', true);
      } else {
        // %10 Şans: Geriye Doğru Adımla
        bot.setControlState('back', true);
      }

    }, 2500 + Math.random() * 2000); // 2.5 - 4.5 sn arası rastgele karar anları
  };

  // --- KAYIT VE OTOMATİK GİRİŞ ---
  bot.once('spawn', () => {
    console.log(`[SUCCESS] ${bot.username} oyuna girdi ve AI aktif edildi.`);
    startAdvancedAI();

    // Giriş komutları
    authTimeout = setTimeout(() => {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
      bot.chat(`/login ${CONFIG.password}`);
    }, 3000);
  });

  // Sunucu Chat Mesajlarını Dinleme (AuthMe/Login Güvenliği)
  bot.on('messagestr', (message) => {
    const msg = message.toLowerCase();

    if (msg.includes('/register') || msg.includes('kayıt')) {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
    } else if (msg.includes('/login') || msg.includes('giriş')) {
      bot.chat(`/login ${CONFIG.password}`);
    }
  });

  // Otomatik GUI/Menü Tıklayıcı (Lobi Seçim Ekranı Varsa)
  bot.on('windowOpen', async (window) => {
    setTimeout(async () => {
      try {
        await bot.clickWindow(0, 0, 0); // Envanterdeki/Menüdeki ilk slota tıklar
      } catch (e) {
        // Menü tıklama hatasını yok say
      }
    }, 1500);
  });

  // --- TEMİZLİK VE YENİDEN BAĞLANMA (RAM KORUMASI) ---
  const cleanupAndReconnect = (reasonStr) => {
    if (moveInterval) clearInterval(moveInterval);
    if (authTimeout) clearTimeout(authTimeout);

    bot.removeAllListeners();
    activeBots.delete(index);

    // 20 botun aynı an tekrar yüklenmemesi için rastgele gecikmeli reconnect (8-15 sn)
    const reconnectDelay = 8000 + Math.random() * 7000;
    console.log(`[-] ${username} ayrıldı (${reasonStr}). ${Math.round(reconnectDelay/1000)}s sonra tekrar denenecek.`);
    
    setTimeout(() => createAdvancedBot(index), reconnectDelay);
  };

  bot.on('kicked', (reason) => cleanupAndReconnect(`Kicked: ${reason}`));
  bot.on('error', (err) => cleanupAndReconnect(`Error: ${err.message}`));
  bot.on('end', () => cleanupAndReconnect('Disconnected'));

  activeBots.set(index, bot);
}

// Botları kademeli olarak oyuna sok (IP Ban / Rate Limit Koruması)
console.log(`[SYS] Toplam ${CONFIG.botCount} bot sırayla aktifleştiriliyor...`);
for (let i = 1; i <= CONFIG.botCount; i++) {
  setTimeout(() => {
    createAdvancedBot(i);
  }, i * CONFIG.joinInterval);
}
