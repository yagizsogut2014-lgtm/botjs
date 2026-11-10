const mineflayer = require('mineflayer');
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

// --- GEMINI API YAPILANDIRMASI ---
// API anahtarın doğrudan koda eklendi
const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6LI2szGxxgD3EkYfqWNhl0HZcKD60wILHO7UbsGSGfVyw' });

// --- KEEP ALIVE SUNUCUSU ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('20 Akıllı Yapay Zeka Botu 7/24 Aktif!');
});

app.listen(PORT, () => {
  console.log(`[SYS] Web sunucusu ${PORT} portunda aktif.`);
});

// --- 20 FARKLI BOT İSMİ VE ÖZEL ŞİFRELERİ ---
const BOT_PROFILES = [
  { name: 'StrykerBot', pass: 'Stryker_991!', role: 'Kıdemli sunucu yöneticisi gibi konuşur, tekniktir.' },
  { name: 'AlphaMatrix', pass: 'Matrix_774*', role: 'Esprili, oyuncularla dalga geçen ama samimi bir bot.' },
  { name: 'CyberKnight', pass: 'Knight_332#', role: 'Sessiz, gizemli ve kısa ve net konuşan bir savaşçı.' },
  { name: 'PixelGamer', pass: 'Pixel_881$', role: 'Minecraft optimizasyonu ve modlardan anlayan bir nerd.' },
  { name: 'ShadowRun', pass: 'Shadow_556%', role: 'Heyecanlı, hızlı konuşan ve aceleci bir tip.' },
  { name: 'VortexNode', pass: 'Vortex_119&', role: 'Sunucunun kurallarını ezbere bilen sıkı bir denetçi.' },
  { name: 'QuantumByte', pass: 'Quantum_443?', role: 'Bilimsel ve teknik terimler kullanan yapay zeka.' },
  { name: 'NeonVibe', pass: 'Neon_667!', role: 'Cyberpunk tarzını seven, havalı konuşan bir bot.' },
  { name: 'BlazeCore', pass: 'Blaze_223*', role: 'Ateşli, agresif ama eğlenceli bir PvP oyuncusu.' },
  { name: 'FrostByte', pass: 'Frost_994#', role: 'Sakin, soğukkanlı ve mantıklı çözümler üreten biri.' },
  { name: 'StormRider', pass: 'Storm_112$', role: 'Fırtına gibi ortama giren enerjik bir tip.' },
  { name: 'TitanForge', pass: 'Titan_558%', role: 'Güçlü ve korumacı bir lobi bekçisi.' },
  { name: 'EchoPulse', pass: 'Echo_771&', role: 'Her şeyi tekrar eden ama tatlı bir maskot.' },
  { name: 'RogueLogic', pass: 'Rogue_334?', role: 'Kuralları esnetmeyi seven asi bir karakter.' },
  { name: 'ZenithCode', pass: 'Zenith_668!', role: 'Lider ruhlu, insanlara yardım etmeyi seven bir rehber.' },
  { name: 'AetherNet', pass: 'Aether_992*', role: 'Bulut sistemlerinden ve sunucu pinginden bahseden bot.' },
  { name: 'SolarFlare', pass: 'Solar_441#', role: 'Etrafa sürekli pozitif enerji saçan neşeli biri.' },
  { name: 'VoidWalker', pass: 'Void_225$', role: 'Karanlık köşelerde takılan sessiz bir gözlemci.' },
  { name: 'HyperDrive', pass: 'Hyper_883%', role: 'Hızlı koşmayı ve parkur yapmayı çok seven bir çılgın.' },
  { name: 'ApexStryke', pass: 'Apex_116&', role: 'STRYKER komutasında özel görevde olan elit bir bot.' }
];

const activeBots = new Map();

function createSmartBot(profile, index) {
  console.log(`[+] ${profile.name} başlatılıyor (Şifre: ${profile.pass})...`);

  const bot = mineflayer.createBot({
    host: 'sofiamc.mcsh.gg',
    port: 25565,
    username: profile.name,
    version: '1.21.4'
  });

  let moveInterval = null;
  let authTimeout = null;

  // --- HAREKET SİSTEMİ ---
  const startAI = () => {
    if (moveInterval) clearInterval(moveInterval);

    moveInterval = setInterval(() => {
      if (!bot.entity) return;
      bot.clearControlStates();

      const action = Math.random();
      if (action < 0.45) {
        const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
        bot.look(yaw, 0, false);
        bot.setControlState('forward', true);
        if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
      } else if (action < 0.70) {
        bot.setControlState('sneak', true);
      } else if (action < 0.85) {
        bot.setControlState('jump', true);
      }
    }, 3000 + Math.random() * 2000);
  };

  // --- KAYIT VE GİRİŞ ---
  bot.once('spawn', () => {
    console.log(`[SUCCESS] ${profile.name} oyuna giriş yaptı.`);
    startAI();

    authTimeout = setTimeout(() => {
      bot.chat(`/register ${profile.pass} ${profile.pass}`);
      bot.chat(`/login ${profile.pass}`);
    }, 3000);
  });

  bot.on('messagestr', (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('/register') || msg.includes('kayıt')) {
      bot.chat(`/register ${profile.pass} ${profile.pass}`);
    } else if (msg.includes('/login') || msg.includes('giriş')) {
      bot.chat(`/login ${profile.pass}`);
    }
  });

  // --- GEMINI İLE AKILLI SOHBET SİSTEMİ ---
  bot.on('chat', async (username, message) => {
    if (username === bot.name) return; // Kendi mesajına cevap vermesin

    // Eğer biri bota ismen seslenirse veya genel bir soru sorarsa Gemini'ye sor
    if (message.toLowerCase().includes(bot.name.toLowerCase()) || message.toLowerCase().includes('bot')) {
      try {
        const prompt = `Sen bir Minecraft sunucusunda oynayan ${bot.name} adlı bir botsun. Kişiliğin/Rolün: "${profile.role}". 
        Oyuncu ${username} sana şu mesajı yazdı: "${message}". 
        Bu mesaja Minecraft chat tarzında, kısa, Türkçe ve karakterine uygun tek bir cümleyle cevap ver (Asla uzun paragraf yazma, oyun içi chat gibi olsun):`;

        // Yeni SDK çağrı formatı
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        const reply = response.text ? response.text.trim().replace(/\n/g, ' ') : 'Aynen öyle!';
        bot.chat(reply);
      } catch (err) {
        console.error(`[AI Error - ${bot.name}]:`, err.message);
        bot.chat('Eyvah, beynim yandı patron!');
      }
    }
  });

  // --- BAĞLANTI KOPMA VE TEMİZLİK ---
  const reconnect = (reason) => {
    if (moveInterval) clearInterval(moveInterval);
    if (authTimeout) clearTimeout(authTimeout);
    bot.removeAllListeners();
    activeBots.delete(index);

    const delay = 8000 + Math.random() * 7000;
    console.log(`[-] ${profile.name} koptu (${reason}). ${Math.round(delay/1000)}s sonra tekrar bağlanıyor.`);
    setTimeout(() => createSmartBot(profile, index), delay);
  };

  bot.on('kicked', (reason) => reconnect(`Kicked: ${reason}`));
  bot.on('error', (err) => reconnect(`Error: ${err.message}`));
  bot.on('end', () => reconnect('Disconnected'));

  activeBots.set(index, bot);
}

// 20 Botu farklı profillerle sırayla oyuna sok
console.log(`[SYS] 20 Benzersiz Akıllı Bot başlatılıyor...`);
BOT_PROFILES.forEach((profile, index) => {
  setTimeout(() => {
    createSmartBot(profile, index);
  }, index * 3500); // Her bot arası 3.5 saniye gecikme
});
