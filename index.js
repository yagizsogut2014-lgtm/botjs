const mineflayer = require('mineflayer');
const express = require('express');

// --- KEEP ALIVE (7/24 UYUMAMA) SUNUCUSU ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot 7/24 aktif tutuluyor!');
});

app.listen(PORT, () => {
  console.log(`Web sunucusu ${PORT} portunda çalışıyor.`);
});

// --- MINECRAFT BOT AYARLARI ---
const botOptions = {
  host: 'SUNUCU_IP_ADRESI', // Buraya sunucu IP adresini yaz (örn: sunucum.aternos.me)
  port: 25565,               // Sunucu Portu (varsayılan: 25565)
  username: 'bot',           // Botun oyundaki adı
  version: '1.21.4'          // Minecraft Sürümü
};

function createBot() {
  const bot = mineflayer.createBot(botOptions);

  bot.on('spawn', () => {
    console.log(`[+] ${bot.username} sunucuya başarıyla katıldı!`);

    // Sunucuya ilk giriş veya sonraki girişler için şifre doğrulama mantığı
    setTimeout(() => {
      // Önce sunucunun chati veya mesajları incelenebilir ancak garanti olması için
      // AuthMe gibi eklentiler genellikle sohbette "register" veya "login" yazar.
      // Burada pratik olması adına sohbette mesajları dinleyip otomatik komut atabiliriz:
    }, 2000);

    // Botun sunucudan afk kalıp kick yemesini önlemek için düzenli zıplama
    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }, 15000); // 15 saniyede bir zıplar
  });

  // Sunucudaki mesajları ve uyarıları takip ederek otomatik kayıt/giriş yapma
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    // Eğer sunucu kayıt olmanızı istiyorsa
    if (message.toLowerCase().includes('register') || message.toLowerCase().includes('kayıt')) {
      console.log('Kayıt isteği algılandı, /register gönderiliyor...');
      bot.chat('/register baba1234 baba1234');
    }
    
    // Eğer sunucu giriş yapmanızı istiyorsa
    if (message.toLowerCase().includes('login') || message.toLowerCase().includes('giriş')) {
      console.log('Giriş isteği algılandı, /login gönderiliyor...');
      bot.chat('/login baba1234');
    }
  });

  // Alternatif olarak sunucuya girer girmez garanti olsun diye birkaç saniye sonra komut göndermesini de sağlayabiliriz:
  bot.once('spawn', () => {
    setTimeout(() => {
      // Önce register dener, sunucu zaten kayıtlısın derse sıkıntı olmaz, 
      // ardından veya doğrudan login de denenebilir. Sunucu yapına göre burayı şekillendirebiliriz.
      bot.chat('/register baba1234 baba1234');
      setTimeout(() => {
        bot.chat('/login baba1234');
      }, 3000);
    }, 4000); // Oyuna girdikten 4 saniye sonra komutları sırayla dener
  });

  bot.on('kicked', (reason) => {
    console.log(`[-] Bot sunucudan atıldı. Sebep: ${reason}`);
  });

  bot.on('error', (err) => {
    console.error('Bot Hatası:', err);
  });

  // Bot oyundan düşerse otomatik olarak tekrar bağlanır
  bot.on('end', () => {
    console.log('[-] Bağlantı kesildi. 5 saniye sonra tekrar bağlanılıyor...');
    setTimeout(createBot, 5000);
  });
}

createBot();
