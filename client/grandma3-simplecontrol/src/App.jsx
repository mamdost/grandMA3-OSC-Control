import React, { useState, useEffect } from "react";

const BACKEND = "http://localhost:3001";

export default function App() {
  const [active, setActive] = useState(1);
  const [config, setConfig] = useState(null);
  const [mode, setMode] = useState("buttons");
  const [faders, setFaders] = useState([100, 0, 0, 0]);
  const [fadersTouched, setFadersTouched] = useState(false);
  const [xfade, setXfade] = useState(200);
  const [showConfig, setShowConfig] = useState(false);
  const scenes = [1, 2, 3, 4, 5, 6, 7, 8];

  // Triple click outside the panel → toggles configuration
  useEffect(() => {
    let clickCount = 0;
    let timer;
    const handleClick = () => {
      clickCount++;
      clearTimeout(timer);
      timer = setTimeout(() => (clickCount = 0), 400);
      if (clickCount === 3) {
        setShowConfig((prev) => !prev);
        clickCount = 0;
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Disable scrolling on mobile (but keep slider touch working)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const preventScroll = (e) => {
      // Allow scroll only on faders
      if (e.target.tagName !== "INPUT") e.preventDefault();
    };
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Switch scene
  async function setScene(id) {
    try {
      const res = await fetch(`${BACKEND}/api/scene/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xfade }),
      });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setActive(id);
      setFaders(scenes.map((s) => (s === id ? 100 : 0)));
      setFadersTouched(false);
      console.log("Scene switched:", data);
    } catch (e) {
      alert("Error switching scene: " + e.message);
    }
  }

  // Fader control
  async function setFader(id, value) {
    try {
      const res = await fetch(`${BACKEND}/api/fader/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Network response not ok");
      await res.json();

      const updated = [...faders];
      updated[id - 1] = value;
      setFaders(updated);

      if (!fadersTouched) {
        setActive(null);
        setFadersTouched(true);
      }
    } catch (e) {
      alert("Error setting fader: " + e.message);
    }
  }

  // Load configuration
  async function getConfig() {
    try {
      const res = await fetch(`${BACKEND}/api/config`);
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setConfig(data);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  useEffect(() => {
    getConfig();
  }, []);

  // Mode switch
  function switchMode(newMode) {
    setMode(newMode);
    if (newMode === "buttons" && fadersTouched) {
      setActive(null);
    }
  }

  return (
    <div
      style={{
        fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        display: "flex",
        justifyContent: "center",
        color: "#f1f5f9",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          padding:10,
          borderRadius: 16,
          width: "90%",
          maxWidth: 460,
          boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: 5, fontWeight: "600", color: "#e2e8f0" }}>
          grandMA3 Remote
        </h2>

        {/* Mode switch */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => switchMode("buttons")}
            style={{
              background: mode === "buttons" ? "#38bdf8" : "rgba(255,255,255,0.1)",
              color: mode === "buttons" ? "#0f172a" : "#f1f5f9",
              border: "none",
              borderRadius: "8px 0 0 8px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Button Mode
          </button>
          <button
            onClick={() => switchMode("faders")}
            style={{
              background: mode === "faders" ? "#38bdf8" : "rgba(255,255,255,0.1)",
              color: mode === "faders" ? "#0f172a" : "#f1f5f9",
              border: "none",
              borderRadius: "0 8px 8px 0",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Fader Mode
          </button>
        </div>

        {/* XFade */}
        {mode === "buttons" && (
          <div
            style={{
              marginBottom: 20,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 10,
              padding: "10px 14px",
              textAlign: "center",
            }}
          >
            <label style={{ fontSize: 14, color: "#94a3b8" }}>
              Crossfade Duration: <strong style={{ color: "#38bdf8" }}>{xfade} ms</strong>
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={xfade}
              onChange={(e) => setXfade(parseInt(e.target.value, 10))}
              style={{
                width: "100%",
                marginTop: 8,
                cursor: "pointer",
                accentColor: "#38bdf8",
              }}
            />
          </div>
        )}

        {/* Scenes */}
        {mode === "buttons" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {scenes.map((s) => (
              <button
                key={s}
                onClick={() => setScene(s)}
                style={{
                  padding: "30px 20px",
                  fontSize: 18,
                  fontWeight: 600,
                  borderRadius: 12,
                  border: "none",
                  color: active === s ? "#0f172a" : "#f1f5f9",
                  background:
                    active === s ? "#38bdf8" : "rgba(255,255,255,0.1)",
                  opacity: active === null ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                Scene {s}
              </button>
            ))}
          </div>
        )}

        {/* Faders */}
        {mode === "faders" && (
          <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            {scenes.map((s) => (
              <div key={s} style={{ textAlign: "center" }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faders[s - 1]}
                  onChange={(e) => setFader(s, parseInt(e.target.value, 10))}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  style={{
                    writingMode: "bt-lr",
                    WebkitAppearance: "slider-vertical",
                    height: 150,
                    width: 20,
                    cursor: "pointer",
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 14 }}>Fader {s}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {faders[s - 1]}%
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 14, color: "#94a3b8" }}>
          Active Scene:{" "}
          <strong style={{ color: "#38bdf8" }}>
            {active === null ? "—" : active}
          </strong>
        </p>

        <p style={{ marginTop: 4, fontSize: 13, color: "#94a3b8" }}>
          Current Mode: <strong style={{ color: "#38bdf8" }}>{mode}</strong>
        </p>

        {/* Configuration */}
        {showConfig && config && (
          <div
            style={{
              marginTop: 24,
              background: "rgba(255, 255, 255, 0.05)",
              padding: 12,
              borderRadius: 10,
              textAlign: "left",
              fontSize: 13,
              color: "#cbd5e1",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ fontWeight: 600, color: "#f1f5f9" }}>Configuration</h4>
              <button
                onClick={getConfig}
                style={{
                  background: "#38bdf8",
                  border: "none",
                  borderRadius: 6,
                  color: "#0f172a",
                  fontSize: 12,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Reload
              </button>
            </div>
            <pre
              style={{
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
