const mineflayer = require('mineflayer');
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6LI2szGxxgD3EkYfqWNhl0HZcKD60wILHO7UbsGSGfVyw' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let activeBots = new Map();
let botStatuses = new Map();
let globalLogs = [];
let isSystemRunning = false;

// 200 Adet Tamamen Farklı ve Özgün İsim Havuzu
const UNIQUE_NAMES = [
  "StrykerX", "AlphaWolf", "CyberNinja", "PixelMaster", "ShadowGhost", "VortexPrime", "QuantumHacker", "NeonRider", "BlazeStorm", "FrostbiteX",
  "StormBringer", "TitanAtlas", "EchoPulse", "RogueAgent", "ZenithLord", "AetherNet", "SolarFlare", "VoidWalker", "HyperDrive", "ApexPredator",
  "DarkSpecter", "IronTitan", "GhostProtocol", "NexusCore", "MatrixRunner", "ByteStorm", "NanoBot", "OmegaNode", "HyperionX", "ZeroCool",
  "CrashOverride", "GlitchMatrix", "KernelPanic", "RootAccess", "FirewallX", "PacketSniffer", "BitShift", "LogicBomb", "DaemonLord", "SysAdmin",
  "CyberPunk", "RetroWave", "SynthBeat", "VaporWave", "ByteRunner", "DataGhost", "NetRunner", "IceBreaker", "BlackHat", "WhiteHat",
  "ScriptKiddie", "BufferError", "MemoryLeak", "NullPointer", "SegmentFault", "ThreadLock", "AsyncAwait", "PromiseAll", "EventLoop", "StackWalker",
  "HexCode", "BinaryX", "QuantumLeap", "SuperConductor", "PlasmaCore", "FusionReactor", "DarkMatter", "SolarWind", "CosmicRay", "SuperNova",
  "BlackHole", "EventHorizon", "WormHole", "TimeDilation", "SpeedForce", "FlashPoint", "VelocityX", "TachyonX", "Neutrino", "QuarkSpin",
  "LeptonX", "HadronCol", "BosonField", "HiggsBoson", "NeutronStar", "PulsarX", "MagnetarX", "RedGiant", "WhiteDwarf", "TitaniumX",
  "CarbonFiber", "SteelClaw", "IronFist", "ShadowBlade", "PhantomStrike", "NightStalker", "BloodHound", "DeathStrike", "ViperX", "VenomSnake",
  "StormRider", "ThunderBolt", "IronClad", "ApexStryke", "DarkKnight", "LightBringer", "FlameHeart", "FrostGuard", "EarthShaker", "WindWalker",
  "VoidStalker", "BloodThirst", "SoulReaper", "DeathDealer", "DoomSlayer", "WarMachine", "BattleBorn", "SteelFang", "SilverClaw", "GoldToken",
  "PlatinumX", "DiamondEdge", "EmeraldEye", "RubyShield", "SapphireBlade", "ObsidianX", "BedrockPro", "NetherLord", "EnderDragon", "WitherKing",
  "CreeperSlayer", "ZombieHunter", "SkeletonSniper", "SpiderBite", "GhostRider", "PhantomLord", "RavagerX", "WardenBeast", "DragonSlayer", "TitanForge",
  "ColossusX", "Behemoth", "Leviathan", "KrakenX", "HydraHead", "ChimeraX", "Cerberus", "Minotaur", "CentaurX", "Pegasus",
  "ApexLegend", "ProGamer", "MasterMind", "EliteForce", "SpecialOps", "BlackOps", "SecretAgent", "Undercover", "GhostAgent", "PhantomX",
  "NightWolf", "LoneWanderer", "WildCard", "JokerX", "AceOfSpades", "KingPin", "BossMan", "OverLord", "SupremeX", "UltimatePro",
  "InfinityX", "Eternity", "Paradigm", "GenesisX", "Armageddon", "JudgmentDay", "FinalHour", "LastStand", "NeoMatrix", "TrinityX",
  "Morpheus", "CypherX", "OracleAI", "Architect", "TheOne", "AgentSmith", "KeyMaker", "Merovingian", "Persephone", "NiobeX",
  "LinkMaster", "TankDriver", "GhostInShell", "MajorX", "Section9", "Tachikoma", "MotokoX", "BatouPro", "Togusa", "CyberLord"
];

function addLog(msg) {
  const time = new Date().toLocaleTimeString();
  globalLogs.unshift(`[${time}] ${msg}`);
  if (globalLogs.length > 50) globalLogs.pop();
}

app.get('/', (req, res) => {
  let botsHtml = '';
  botStatuses.forEach((status, idx) => {
    botsHtml += `
      <div class="bot-card ${status.online ? 'online' : 'offline'}">
        <div class="bot-header">
          <span class="bot-name">${status.name}</span>
          <span class="badge ${status.online ? 'bg-online' : 'bg-offline'}">${status.state}</span>
        </div>
        <div class="bot-body">
          <p>❤️ Can: ${status.hp}/20 | 🍗 Açlık: ${status.food}/20</p>
          <div class="bot-chat-input">
            <input type="text" id="msg_${idx}" placeholder="Bu bota yazdır...">
            <button onclick="sendPrivateChat(${idx})">Gönder</button>
          </div>
        </div>
      </div>
    `;
  });

  let logsHtml = globalLogs.map(l => `<div class="log-line">${l}</div>`).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>STRYKER BOT MASTER STUDIO</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
        body { background: #090d16; color: #f1f5f9; padding: 20px; }
        h1 { text-align: center; margin-bottom: 20px; color: #38bdf8; font-weight: 800; }
        .config-box { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; max-width: 1000px; margin: 0 auto 25px auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: end; }
        .input-group { display: flex; flex-direction: column; gap: 4px; }
        .input-group label { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
        .input-group input { background: #0f172a; border: 1px solid #475569; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 0.95rem; }
        .btn { background: #0284c7; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; height: 38px; }
        .btn:hover { background: #0369a1; }
        .btn-stop { background: #e11d48; }
        .btn-stop:hover { background: #be123c; }
        .main-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; max-width: 1400px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
        .bot-card { background: #1e293b; border-radius: 10px; padding: 12px; border: 1px solid #334155; }
        .bot-card.online { border-left: 4px solid #22c55e; }
        .bot-card.offline { border-left: 4px solid #ef4444; }
        .bot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #334155; padding-bottom: 6px; }
        .bot-name { font-weight: bold; font-size: 0.95rem; color: #e2e8f0; }
        .badge { font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; font-weight: bold; }
        .bg-online { background: #14532d; color: #4ade80; }
        .bg-offline { background: #7f1d1d; color: #fca5a5; }
        .bot-body p { font-size: 0.8rem; color: #94a3b8; margin-bottom: 8px; }
        .bot-chat-input { display: flex; gap: 4px; }
        .bot-chat-input input { flex: 1; background: #0f172a; border: 1px solid #334155; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; }
        .bot-chat-input button { background: #38bdf8; color: #000; border: none; padding: 4px 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 0.75rem; }
        .console-box { background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; height: 600px; }
        .console-title { font-weight: bold; color: #38bdf8; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px; }
        .logs-container { flex: 1; overflow-y: auto; font-family: monospace; font-size: 0.8rem; color: #cbd5e1; display: flex; flex-direction: column-reverse; }
        .log-line { margin-bottom: 4px; border-bottom: 1px solid #1e293b; padding-bottom: 2px; }
        .global-chat-box { margin-top: 10px; display: flex; gap: 6px; }
        .global-chat-box input { flex: 1; background: #1e293b; border: 1px solid #475569; color: #fff; padding: 8px; border-radius: 6px; }
      </style>
      <script>
        setTimeout(() => { location.reload(); }, 5000);

        function controlSystem(action) {
          const host = document.getElementById('host').value;
          const port = document.getElementById('port').value;
          const version = document.getElementById('version').value;
          const count = document.getElementById('count').value;

          fetch('/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, host, port, version, count })
          }).then(res => res.json()).then(data => {
            alert(data.message);
            location.reload();
          });
        }

        function sendGlobalChat() {
          const text = document.getElementById('global_msg').value;
          if(!text) return;
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'all', text })
          }).then(() => { document.getElementById('global_msg').value = ''; });
        }

        function sendPrivateChat(index) {
          const text = document.getElementById('msg_' + index).value;
          if(!text) return;
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'single', index, text })
          }).then(() => { document.getElementById('msg_' + index).value = ''; });
        }
      </script>
    </head>
    <body>
      <h1>⚡ STRYKER BOT KONTROL & AI SOHBET MERKEZİ ⚡</h1>
      
      <div class="config-box">
        <div class="input-group">
          <label>IP / Host:</label>
          <input type="text" id="host" value="sofiamc.mcsh.gg">
        </div>
        <div class="input-group">
          <label>Port:</label>
          <input type="number" id="port" value="25565">
        </div>
        <div class="input-group">
          <label>Sürüm:</label>
          <input type="text" id="version" value="1.21.4">
        </div>
        <div class="input-group">
          <label>Bot Sayısı (1-200):</label>
          <input type="number" id="count" min="1" max="200" value="20">
        </div>
        <div>
          ${isSystemRunning 
            ? '<button class="btn btn-stop" onclick="controlSystem(\'stop\')">Sistemi Durdur</button>'
            : '<button class="btn" onclick="controlSystem(\'start\')">Botları Başlat</button>'
          }
        </div>
      </div>

      <div class="main-layout">
        <div class="grid">${botsHtml}</div>
        
        <div class="console-box">
          <div class="console-title">💬 Canlı Sohbet & Log Akışı</div>
          <div class="logs-container">${logsHtml}</div>
          <div class="global-chat-box">
            <input type="text" id="global_msg" placeholder="Tüm botlara toplu yazdır...">
            <button class="btn" onclick="sendGlobalChat()">Gönder</button>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/api/system', (req, res) => {
  const { action, host, port, version, count } = req.body;

  if (action === 'stop') {
    activeBots.forEach((bot) => bot.quit());
    activeBots.clear();
    botStatuses.clear();
    isSystemRunning = false;
    addLog("Sistem kullanıcı tarafından durduruldu.");
    return res.json({ message: 'Tüm botlar durduruldu!' });
  }

  if (action === 'start') {
    if (isSystemRunning) return res.json({ message: 'Sistem zaten çalışıyor!' });
    
    const botCount = Math.min(Math.max(parseInt(count) || 5, 1), 200);
    isSystemRunning = true;
    addLog(`Sistem başlatılıyor: ${botCount} bot -> ${host}:${port}`);
    res.json({ message: `${botCount} bot kademeli olarak bağlanıyor.` });

    // Botlar arası 4 saniye gecikme (IP Ban ve Throttle önlemi)
    for (let i = 0; i < botCount; i++) {
      setTimeout(() => {
        if (!isSystemRunning) return;
        const name = UNIQUE_NAMES[i % UNIQUE_NAMES.length] + (i >= UNIQUE_NAMES.length ? `_${i}` : '');
        createBot(i, name, host, parseInt(port), version);
      }, i * 4000);
    }
  }
});

app.post('/api/chat', (req, res) => {
  const { mode, index, text } = req.body;
  if (mode === 'all') {
    activeBots.forEach((bot) => bot.chat(text));
    addLog(`[PANEL] Tüm botlar: "${text}"`);
  } else if (mode === 'single') {
    const bot = activeBots.get(index);
    if (bot) {
      bot.chat(text);
      addLog(`[PANEL] ${bot.username}: "${text}"`);
    }
  }
  res.json({ status: 'ok' });
});

function createBot(index, name, host, port, version) {
  if (!isSystemRunning) return;

  botStatuses.set(index, { name, state: 'Bağlanıyor...', hp: 20, food: 20, online: false });

  const bot = mineflayer.createBot({
    host,
    port,
    username: name,
    version,
    hideErrors: true
  });

  let moveInterval = null;

  const startAI = () => {
    if (moveInterval) clearInterval(moveInterval);
    moveInterval = setInterval(() => {
      if (!bot.entity) return;
      bot.clearControlStates();

      botStatuses.set(index, {
        name,
        state: 'Oyunda',
        hp: bot.health || 20,
        food: bot.food || 20,
        online: true
      });

      const act = Math.random();
      if (act < 0.40) {
        const yaw = (Math.random() * 360 - 180) * (Math.PI / 180);
        bot.look(yaw, 0, false);
        bot.setControlState('forward', true);
        if (bot.entity.isCollidedHorizontally) bot.setControlState('jump', true);
      } else if (act < 0.65) {
        bot.setControlState('sneak', true);
      } else if (act < 0.80) {
        bot.setControlState('jump', true);
      }
    }, 4000 + Math.random() * 2000);
  };

  bot.once('spawn', () => {
    addLog(`[+] ${name} oyuna girdi.`);
    startAI();

    // İlk girişte register, ardından login komutu
    setTimeout(() => {
      bot.chat('/register babayaya1234 babayaya1234');
      setTimeout(() => {
        bot.chat('/login babayaya1234');
      }, 1500);
    }, 4000);
  });

  bot.on('messagestr', (msg) => {
    const cleanMsg = msg.toLowerCase();
    if (cleanMsg.includes('/register') || cleanMsg.includes('kayıt')) {
      bot.chat('/register babayaya1234 babayaya1234');
    } else if (cleanMsg.includes('/login') || cleanMsg.includes('giriş') || cleanMsg.includes('wrong password')) {
      bot.chat('/login babayaya1234');
    }
  });

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    addLog(`[CHAT] ${username}: ${message}`);

    if (message.toLowerCase().includes(bot.username.toLowerCase()) || message.toLowerCase().includes('bot')) {
      try {
        const prompt = `Sen Minecraft'ta ${bot.username} adlı oyuncusun. Oyuncu ${username} sana şunu yazdı: "${message}". Minecraft chatine uygun, çok kısa, Türkçe ve doğal tek cümlelik bir yanıt yaz:`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const reply = response.text ? response.text.trim().replace(/\n/g, ' ') : 'Aynen!';
        bot.chat(reply);
        addLog(`[AI] ${bot.username} -> ${username}: ${reply}`);
      } catch (err) {}
    }
  });

  const reconnect = (reason) => {
    if (moveInterval) clearInterval(moveInterval);
    bot.removeAllListeners();
    activeBots.delete(index);
    botStatuses.set(index, { name, state: 'Ayrıldı', hp: 0, food: 0, online: false });

    if (!isSystemRunning) return;

    const delay = 12000 + Math.random() * 5000;
    addLog(`[-] ${name} koptu (${reason}). ${Math.round(delay/1000)}s sonra tekrar denenecek.`);
    setTimeout(() => {
      if (isSystemRunning) createBot(index, name, host, port, version);
    }, delay);
  };

  bot.on('kicked', (reason) => reconnect(`Kicked`));
  bot.on('error', (err) => reconnect(`Hata`));
  bot.on('end', () => reconnect('Disconnection'));

  activeBots.set(index, bot);
}

app.listen(PORT, () => {
  console.log(`[SYS] STRYKER MASTER STUDIO http://localhost:${PORT} adresinde çalışıyor.`);
});
