// sendosc.js
//
// Jednoduchý CLI nástroj pro odesílání OSC příkazů do grandMA3
// Použití: node sendosc.js "FaderMaster Page 1.201 At 50"

const osc = require('osc');

// ⚙️ Nastavení připojení
const MA3_IP = '127.0.0.1';     // stejné PC
const MA3_PORT = 8000;          // port dle MA3 OSC nastavení
const MA3_PREFIX = '/gma3';     // prefix podle tvé konfigurace v MA3
const LOCAL_PORT = 9002;        // libovolný volný port

// 📥 Načtení příkazu z argumentů
const cmd = process.argv.slice(2).join(' ');
if (!cmd) {
  console.error('❌ Použití: node sendosc.js "FaderMaster Page 1.201 At 50"');
  process.exit(1);
}

// 🔌 Nastavení OSC portu
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: LOCAL_PORT,
  remoteAddress: MA3_IP,
  remotePort: MA3_PORT,
  metadata: true
});

udpPort.open();

udpPort.on("ready", () => {
  const address = `${MA3_PREFIX}/cmd`;
  console.log(`➡️ Odesílám na ${MA3_IP}:${MA3_PORT}`);
  console.log(`📡 OSC → ${address} "${cmd}"`);

  udpPort.send({
    address,
    args: [{ type: "s", value: cmd }]
  });

  // počkej krátce a ukonči proces
  setTimeout(() => {
    udpPort.close();
    console.log('✅ Hotovo.');
    process.exit(0);
  }, 300);
});
