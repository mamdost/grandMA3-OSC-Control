// server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const osc = require("osc");

// ⚙️ Nastavení OSC
const MA3_IP = "172.16.15.1"; // stejné PC
const MA3_PORT = 8000; // OSC port v MA3
const MA3_PREFIX = "/gma3"; // nastav prefix dle MA3 (nebo nech '' pokud není)
const LOCAL_PORT = 9001; // volný port pro Node server

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔌 Otevření OSC UDP portu
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: LOCAL_PORT,
  remoteAddress: MA3_IP,
  remotePort: MA3_PORT,
  metadata: true,
});

udpPort.open();

udpPort.on("ready", () => {
  console.log(
    `✅ OSC ready → sending to ${MA3_IP}:${MA3_PORT} (prefix: ${
      MA3_PREFIX || "(none)"
    })`
  );
});

// 🧠 Funkce pro odeslání OSC příkazu
function sendOSCCommand(cmd) {
  const address = `${MA3_PREFIX}/cmd`;
  console.log(`➡️ Sending OSC → ${address} "${cmd}"`);
  udpPort.send({
    address,
    args: [{ type: "s", value: cmd }],
  });
}

// 💾 Uchovává aktuální hodnoty všech 4 faderů
let currentValues = [0, 0, 0, 0];

// 🎚️ Endpoint pro SCÉNY (s crossfadem)
app.post("/api/scene/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { xfade = 0 } = req.body;

  if (id < 1 || id > 9)
    return res.status(400).json({ error: "Invalid scene id" });

  // 🎯 cílové hodnoty: vybraná scéna = 100, ostatní = 0
  const endValues = [0, 0, 0, 0];
  endValues[id - 1] = 100;

  const steps = Math.max(5, Math.floor(xfade / 20)); // cca 50 FPS
  const delay = xfade > 0 ? xfade / steps : 0;

  // 🔄 Crossfade mezi currentValues a endValues
  for (let step = 1; step <= steps; step++) {
    const progress = xfade > 0 ? step / steps : 1;

    const interpolated = currentValues.map((start, i) => {
      const end = endValues[i];
      return Math.round(start + (end - start) * progress);
    });

    interpolated.forEach((value, idx) => {
      const cmd = `FaderMaster Page 1.20${idx + 1} At ${value}`;
      sendOSCCommand(cmd);
    });

    if (step < steps && delay > 0)
      await new Promise((r) => setTimeout(r, delay));
  }

  // 💾 Uložit nový stav
  currentValues = [...endValues];

  console.log(`✅ Crossfade complete → Scene ${id} (xfade: ${xfade}ms)`);
  res.json({ ok: true, scene: id, xfade });
});

// 🎚️ Endpoint pro jednotlivé fadery (ruční ovládání)
app.post("/api/fader/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { value } = req.body;

  if (id < 1 || id > 9)
    return res.status(400).json({ error: "Invalid fader id" });
  if (value < 0 || value > 100)
    return res.status(400).json({ error: "Invalid fader value" });

  currentValues[id - 1] = value;

  const cmd = `FaderMaster Page 1.20${id} At ${value}`;
  sendOSCCommand(cmd);

  res.json({ ok: true, fader: id, value });
});

// ⚙️ Info endpoint
app.get("/api/config", (req, res) => {
  res.json({
    MA3_IP,
    MA3_PORT,
    LOCAL_PORT,
    MA3_PREFIX,
    currentValues,
  });
});

// 🚀 Start serveru
app.listen(3001, () =>
  console.log("🚀 Server běží na http://localhost:3001")
);
