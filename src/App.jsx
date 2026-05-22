import { useState, useRef } from "react";

// ── Configura tu URL de Vercel aquí ──────────────────────────────────────────
const BACKEND_URL = "TU_BACKEND_URL"; // ej: https://splitcl-backend-xyz.vercel.app

// ── Compresión de imagen ──────────────────────────────────────────────────────
function compressImage(file, maxPx = 800, quality = 0.65) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve({ base64: dataUrl.split(",")[1], dataUrl });
    };
    img.src = url;
  });
}

const SCAN_STEPS = ["Comprimiendo imagen...", "Enviando boleta...", "Extrayendo ítems...", "¡Listo!"];

const fmt = (n) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const uid = () => Math.random().toString(36).slice(2, 8);
const COLORS = ["#A78BFA","#34D399","#F472B6","#60A5FA","#FBBF24","#F87171","#38BDF8","#FB923C"];

// ── UI Atoms ─────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}33`, border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 800, color, flexShrink: 0
    }}>{name.charAt(0).toUpperCase()}</div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.08)", padding: 20,
      backdropFilter: "blur(10px)", ...style
    }}>{children}</div>
  );
}

function GradBtn({ children, onClick, style = {}, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "16px", borderRadius: 16, border: "none",
      background: disabled ? "#333" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
      color: disabled ? "#666" : "#fff", fontSize: 16, fontWeight: 800,
      cursor: disabled ? "not-allowed" : "pointer", letterSpacing: -0.3,
      boxShadow: disabled ? "none" : "0 4px 24px #7C3AED55", ...style
    }}>{children}</button>
  );
}

// ── SCREEN: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onNew }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#A78BFA", fontSize: 13, fontWeight: 600, margin: 0, letterSpacing: 1 }}>SPLITCL</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "4px 0 0", letterSpacing: -1.5, lineHeight: 1.1 }}>
          Divide la cuenta<br /><span style={{ color: "#A78BFA" }}>sin drama</span>
        </h1>
      </div>

      {/* Wallet card */}
      <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, #4C1D95, #312e81)", border: "none" }}>
        <p style={{ color: "#C4B5FD", fontSize: 12, fontWeight: 600, margin: "0 0 4px", letterSpacing: 1 }}>WALLET</p>
        <p style={{ color: "#fff", fontSize: 13, margin: 0 }}>Tu saldo pendiente</p>
        <p style={{ fontSize: 38, fontWeight: 900, margin: "8px 0", color: "#A78BFA", letterSpacing: -1 }}>{fmt(0)}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", textAlign: "center", fontSize: 12, color: "#C4B5FD", fontWeight: 600 }}>⇄ Transferir</div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", textAlign: "center", fontSize: 12, color: "#C4B5FD", fontWeight: 600 }}>≡ Historial</div>
        </div>
      </Card>

      <div style={{ flex: 1 }} />

      <GradBtn onClick={onNew}>
        + Nueva división
      </GradBtn>
      <p style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 12 }}>
        Sube la foto al chat → yo extraigo los ítems → pegalos aquí
      </p>
    </div>
  );
}

// ── SCREEN: People ────────────────────────────────────────────────────────────
function PeopleScreen({ people, setPeople, onNext }) {
  const [name, setName] = useState("");
  const add = () => {
    const t = name.trim();
    if (!t || people.find(p => p.name.toLowerCase() === t.toLowerCase())) return;
    setPeople(prev => [...prev, { id: uid(), name: t, color: COLORS[prev.length % COLORS.length] }]);
    setName("");
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 20 }}>
      <div>
        <p style={{ color: "#A78BFA", fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: 1 }}>PASO 1 DE 3</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>¿Quiénes van?</h2>
        <p style={{ color: "#666", margin: "4px 0 0", fontSize: 14 }}>Agrega a todos del grupo</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()} placeholder="Nombre..."
          style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 16px", color: "#fff", fontSize: 15, outline: "none" }}
        />
        <button onClick={add} style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 14, padding: "13px 20px", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {people.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, background: `${p.color}11`, borderRadius: 16, padding: "12px 16px", border: `1px solid ${p.color}33` }}>
            <Avatar name={p.name} color={p.color} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{p.name}</span>
            <button onClick={() => setPeople(prev => prev.filter(x => x.id !== p.id))} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
        ))}
      </div>
      <GradBtn onClick={onNext} disabled={people.length < 2}>
        Continuar con {people.length} {people.length === 1 ? "persona" : "personas"} →
      </GradBtn>
    </div>
  );
}

// ── ScanZone Component ───────────────────────────────────────────────────────
function ScanZone({ people, setItems, setLocalName }) {
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const timerRef = useRef();

  const startSteps = () => {
    let i = 0;
    setStep(0);
    timerRef.current = setInterval(() => {
      i = Math.min(i + 1, SCAN_STEPS.length - 2);
      setStep(i);
    }, 2000);
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setScanning(true);
    startSteps();
    try {
      const { base64, dataUrl } = await compressImage(file);
      setPreview(dataUrl);
      const res = await fetch(`${BACKEND_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });
      clearInterval(timerRef.current);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStep(3);
      if (data.local) setLocalName(data.local);
      if (data.items?.length) {
        setItems(data.items.map(it => ({ id: Math.random().toString(36).slice(2,8), name: it.name, price: Number(it.price) || 0, claimedBy: [] })));
      }
    } catch (e) {
      clearInterval(timerRef.current);
      setError("No pude leer la boleta. Agrega los ítems manualmente.");
    }
    setScanning(false);
  };

  return (
    <div>
      <div onClick={() => !scanning && fileRef.current?.click()} style={{
        border: `2px dashed ${scanning ? "#7C3AED" : "#7C3AED55"}`,
        borderRadius: 16, padding: 20, textAlign: "center", cursor: scanning ? "default" : "pointer",
        background: "rgba(124,58,237,0.06)", position: "relative", minHeight: 90,
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8
      }}>
        {preview && !scanning && (
          <img src={preview} alt="boleta" style={{ maxHeight: 80, borderRadius: 8, objectFit: "contain" }} />
        )}
        {!preview && !scanning && (
          <>
            <span style={{ fontSize: 32 }}>📸</span>
            <span style={{ color: "#A78BFA", fontWeight: 700, fontSize: 14 }}>Fotografiar boleta</span>
            <span style={{ color: "#555", fontSize: 11 }}>Cámara o galería · OCR automático</span>
          </>
        )}
        {scanning && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #7C3AED", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#A78BFA", fontSize: 14, fontWeight: 700 }}>{SCAN_STEPS[step]}</span>
            <div style={{ width: 160, height: 4, background: "#ffffff11", borderRadius: 99 }}>
              <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#7C3AED,#4F46E5)", width: `${((step + 1) / SCAN_STEPS.length) * 100}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      {error && <p style={{ color: "#F87171", fontSize: 12, margin: "8px 0 0" }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── SCREEN: Items + Tip ───────────────────────────────────────────────────────
function ItemsScreen({ people, items, setItems, localName, setLocalName, tip, setTip, onNext }) {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState(null);
  const [showPaste, setShowPaste] = useState(false);

  const TIP_OPTIONS = [0, 10, 15, 20];

  const parseJson = () => {
    try {
      const parsed = JSON.parse(jsonInput.trim());
      if (parsed.local) setLocalName(parsed.local);
      if (parsed.items?.length) {
        setItems(parsed.items.map(it => ({ id: uid(), name: it.name, price: Number(it.price) || 0, claimedBy: [] })));
        setShowPaste(false); setJsonError(null); setJsonInput("");
      }
    } catch { setJsonError("JSON inválido. Copia exactamente lo que te dio Claude."); }
  };

  const addItem = () => setItems(prev => [...prev, { id: uid(), name: "", price: 0, claimedBy: [] }]);
  const update = (id, f, v) => setItems(prev => prev.map(it => it.id === id ? { ...it, [f]: v } : it));

  const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const tipAmount = Math.round(subtotal * tip / 100);
  const total = subtotal + tipAmount;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16, overflowY: "auto" }}>
      <div>
        <p style={{ color: "#A78BFA", fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: 1 }}>PASO 2 DE 3</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>La boleta</h2>
      </div>

      {/* JSON paste */}
      <Card>
        <button onClick={() => setShowPaste(!showPaste)} style={{ background: "none", border: "none", color: "#A78BFA", fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          <span>🤖</span> Pegar JSON de Claude
          <span style={{ marginLeft: "auto", fontSize: 18, color: "#555" }}>{showPaste ? "▴" : "▾"}</span>
        </button>
        {showPaste && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)}
              placeholder='{"local":"Fuente Chilena","items":[{"name":"Coca Cola","price":2450}],"total":17100}'
              rows={3}
              style={{ width: "100%", background: "#0d0d1a", border: "1px solid #333", borderRadius: 10, padding: "10px", color: "#aaa", fontSize: 12, outline: "none", resize: "none", fontFamily: "monospace", boxSizing: "border-box" }}
            />
            {jsonError && <p style={{ color: "#F87171", fontSize: 12, margin: 0 }}>{jsonError}</p>}
            <button onClick={parseJson} style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Cargar ítems →</button>
          </div>
        )}
      </Card>

      {/* Photo scan */}
      {BACKEND_URL !== "TU_BACKEND_URL" ? (
        <ScanZone people={people} setItems={setItems} setLocalName={setLocalName} />
      ) : (
        <div style={{ background: "#FBBF2411", border: "1px solid #FBBF2433", borderRadius: 12, padding: "10px 14px", color: "#FBBF24", fontSize: 12 }}>
          ⚙️ Configura BACKEND_URL en el código para habilitar el escaneo automático
        </div>
      )}

      {/* Local name */}
      <input value={localName} onChange={e => setLocalName(e.target.value)} placeholder="Nombre del local..."
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid #A78BFA44", borderRadius: 12, padding: "11px 14px", color: "#A78BFA", fontSize: 15, fontWeight: 700, outline: "none" }}
      />

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "10px 12px" }}>
            <input value={item.name} onChange={e => update(item.id, "name", e.target.value)} placeholder="Ítem"
              style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 14, outline: "none" }} />
            <input type="number" value={item.price || ""} onChange={e => update(item.id, "price", Number(e.target.value))} placeholder="$"
              style={{ width: 84, background: "none", border: "none", color: "#FBBF24", fontSize: 14, fontWeight: 700, textAlign: "right", outline: "none" }} />
            <button onClick={() => setItems(prev => prev.filter(it => it.id !== item.id))} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={addItem} style={{ background: "none", border: "1px dashed #A78BFA55", borderRadius: 12, padding: "11px", color: "#A78BFA", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Agregar ítem</button>

      {/* Tip selector */}
      {items.length > 0 && (
        <Card>
          <p style={{ color: "#888", fontSize: 12, fontWeight: 700, margin: "0 0 10px", letterSpacing: 1 }}>PROPINA</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {TIP_OPTIONS.map(t => (
              <button key={t} onClick={() => setTip(t)} style={{
                flex: 1, padding: "10px 4px", borderRadius: 12, border: "none",
                background: tip === t ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "rgba(255,255,255,0.07)",
                color: tip === t ? "#fff" : "#888", fontWeight: 800, fontSize: 13, cursor: "pointer"
              }}>{t === 0 ? "Sin propina" : `${t}%`}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginBottom: 4 }}>
            <span>Subtotal</span><span>{fmt(subtotal)}</span>
          </div>
          {tip > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#A78BFA", marginBottom: 4 }}>
              <span>Propina ({tip}%)</span><span>{fmt(tipAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
            <span>Total</span><span style={{ color: "#FBBF24" }}>{fmt(total)}</span>
          </div>
        </Card>
      )}

      <GradBtn onClick={onNext} disabled={items.length === 0}>Asignar ítems →</GradBtn>
    </div>
  );
}

// ── SCREEN: Claim Items ───────────────────────────────────────────────────────
function ClaimScreen({ people, items, setItems, tip, onNext }) {
  const subtotal = items.reduce((s, it) => s + it.price, 0);
  const tipAmount = Math.round(subtotal * tip / 100);

  const toggle = (itemId, personId) => {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const has = it.claimedBy.includes(personId);
      return { ...it, claimedBy: has ? it.claimedBy.filter(id => id !== personId) : [...it.claimedBy, personId] };
    }));
  };

  const claimAll = (personId) => {
    setItems(prev => prev.map(it => ({
      ...it, claimedBy: it.claimedBy.includes(personId) ? it.claimedBy : [...it.claimedBy, personId]
    })));
  };

  const getPersonTotal = (personId) => {
    const share = items.reduce((s, it) => {
      if (!it.claimedBy.includes(personId)) return s;
      return s + it.price / it.claimedBy.length;
    }, 0);
    const tipShare = subtotal > 0 ? (share / subtotal) * tipAmount : 0;
    return Math.round(share + tipShare);
  };

  const unclaimed = items.filter(it => it.claimedBy.length === 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16, overflowY: "auto" }}>
      <div>
        <p style={{ color: "#A78BFA", fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: 1 }}>PASO 3 DE 3</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>¿Quién pidió qué?</h2>
        <p style={{ color: "#666", margin: "4px 0 0", fontSize: 14 }}>Toca tu nombre en cada ítem</p>
      </div>

      {unclaimed.length > 0 && (
        <div style={{ background: "#FBBF2411", border: "1px solid #FBBF2444", borderRadius: 12, padding: "10px 14px", color: "#FBBF24", fontSize: 13, fontWeight: 600 }}>
          ⚠ {unclaimed.length} ítem{unclaimed.length > 1 ? "s" : ""} sin asignar
        </div>
      )}

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => (
          <Card key={item.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{item.name || "Sin nombre"}</span>
              <span style={{ color: "#FBBF24", fontWeight: 800, fontSize: 15 }}>{fmt(item.price)}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {people.map(p => {
                const active = item.claimedBy.includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggle(item.id, p.id)} style={{
                    background: active ? `${p.color}25` : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${active ? p.color : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 99, padding: "5px 12px", color: active ? p.color : "#666",
                    fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}>{p.name.split(" ")[0]}</button>
                );
              })}
            </div>
            {item.claimedBy.length > 1 && (
              <p style={{ color: "#666", fontSize: 11, margin: "8px 0 0" }}>
                {fmt(Math.round(item.price / item.claimedBy.length))} c/u
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Per person preview */}
      <Card>
        <p style={{ color: "#888", fontSize: 12, fontWeight: 700, margin: "0 0 12px", letterSpacing: 1 }}>RESUMEN PRELIMINAR</p>
        {people.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Avatar name={p.name} color={p.color} size={32} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontWeight: 800, color: p.color, fontSize: 15 }}>{fmt(getPersonTotal(p.id))}</span>
          </div>
        ))}
      </Card>

      <GradBtn onClick={onNext} disabled={unclaimed.length > 0}>
        {unclaimed.length > 0 ? `Faltan ${unclaimed.length} ítem${unclaimed.length > 1 ? "s" : ""}` : "Ver resumen final →"}
      </GradBtn>
    </div>
  );
}

// ── SCREEN: Summary ───────────────────────────────────────────────────────────
function SummaryScreen({ people, items, localName, tip, onReset }) {
  const [payerIdx, setPayerIdx] = useState(0);
  const [payerAccount, setPayerAccount] = useState("");

  const subtotal = items.reduce((s, it) => s + it.price, 0);
  const tipAmount = Math.round(subtotal * tip / 100);

  const getOwes = (personId) => {
    const share = items.reduce((s, it) => {
      if (!it.claimedBy.includes(personId)) return s;
      return s + it.price / it.claimedBy.length;
    }, 0);
    const tipShare = subtotal > 0 ? (share / subtotal) * tipAmount : 0;
    return Math.round(share + tipShare);
  };

  const balances = people.map(p => ({ ...p, owes: getOwes(p.id) }));
  const total = subtotal + tipAmount;
  const payer = people[payerIdx];

  const waLink = (person, amount) => {
    const acc = payerAccount.trim();
    const msg = `Hola ${person.name}! 🧾 Me debes ${fmt(amount)} de ${localName || "la cuenta"}.\nTransfiere a ${payer?.name}${acc ? `\nCuenta: ${acc}` : ""}\n\nDetalle:\n${items.filter(it => it.claimedBy.includes(person.id)).map(it => `• ${it.name}: ${fmt(Math.round(it.price / it.claimedBy.length))}`).join("\n")}${tip > 0 ? `\n• Propina (${tip}%): ${fmt(Math.round(getOwes(person.id) - getOwes(person.id) / (1 + tip/100)))}` : ""}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16, overflowY: "auto" }}>
      {/* Header card */}
      <Card style={{ background: "linear-gradient(135deg, #4C1D95, #312e81)", border: "none", textAlign: "center" }}>
        <p style={{ color: "#C4B5FD", fontSize: 12, fontWeight: 700, margin: "0 0 4px", letterSpacing: 1 }}>
          {localName || "RESTAURANTE"} · ✅ DIVIDIDO
        </p>
        <p style={{ fontSize: 42, fontWeight: 900, margin: "8px 0", color: "#fff", letterSpacing: -2 }}>{fmt(total)}</p>
        <p style={{ color: "#7C6FCD", fontSize: 13, margin: 0 }}>
          Subtotal {fmt(subtotal)}{tip > 0 ? ` + propina ${fmt(tipAmount)}` : ""}
        </p>
      </Card>

      {/* Per person */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {balances.map(b => (
          <Card key={b.id} style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={b.name} color={b.color} size={40} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{b.name}</p>
                <p style={{ margin: 0, color: "#555", fontSize: 12 }}>
                  {items.filter(it => it.claimedBy.includes(b.id)).length} ítem{items.filter(it => it.claimedBy.includes(b.id)).length !== 1 ? "s" : ""}
                  {tip > 0 ? ` + propina` : ""}
                </p>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: b.color }}>{fmt(b.owes)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Who paid + account */}
      <Card>
        <p style={{ color: "#888", fontSize: 12, fontWeight: 700, margin: "0 0 10px", letterSpacing: 1 }}>¿QUIÉN PAGÓ?</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {people.map((p, i) => (
            <button key={p.id} onClick={() => setPayerIdx(i)} style={{
              background: payerIdx === i ? `${p.color}22` : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${payerIdx === i ? p.color : "rgba(255,255,255,0.1)"}`,
              borderRadius: 99, padding: "6px 14px",
              color: payerIdx === i ? p.color : "#666", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}>{p.name.split(" ")[0]}</button>
          ))}
        </div>
        <input placeholder="N° cuenta bancaria (opcional)" value={payerAccount} onChange={e => setPayerAccount(e.target.value)}
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </Card>

      {/* WhatsApp links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ color: "#888", fontSize: 12, fontWeight: 700, margin: 0, letterSpacing: 1 }}>COBRAR POR WHATSAPP</p>
        {balances.filter(b => b.id !== payer?.id).map(b => (
          <a key={b.id} href={waLink(b, b.owes)} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 12, background: `${b.color}0d`, borderRadius: 16, padding: "14px 16px", border: `1.5px solid ${b.color}33`, textDecoration: "none" }}>
            <Avatar name={b.name} color={b.color} size={38} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#fff" }}>{b.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>debe {fmt(b.owes)} · con desglose</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>💬</div>
              <div style={{ fontSize: 10, color: "#25D366", fontWeight: 700 }}>Cobrar</div>
            </div>
          </a>
        ))}
      </div>

      <button onClick={onReset} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px", color: "#888", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
        Nueva división
      </button>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
const SCREENS = ["home", "people", "items", "claim", "summary"];

export default function SplitCL() {
  const [screen, setScreen] = useState("home");
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [localName, setLocalName] = useState("");
  const [tip, setTip] = useState(10);

  const reset = () => { setPeople([]); setItems([]); setLocalName(""); setTip(10); setScreen("home"); };
  const idx = SCREENS.indexOf(screen);
  const go = (s) => setScreen(s);

  return (
    <div style={{
      minHeight: "100vh", background: "#080810",
      color: "#fff", fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
      display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto",
      backgroundImage: "radial-gradient(ellipse at 20% 0%, #2e1065 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, #1e1b4b 0%, transparent 50%)"
    }}>
      {/* Top nav */}
      {screen !== "home" && (
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => go(SCREENS[idx - 1] || "home")} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: 12, width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>Split<span style={{ color: "#A78BFA" }}>CL</span></span>
          <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
            {["people","items","claim","summary"].map((s, i) => (
              <div key={s} style={{ width: i <= idx - 1 ? 20 : 8, height: 8, borderRadius: 99, background: i <= idx - 1 ? "linear-gradient(90deg,#7C3AED,#4F46E5)" : "rgba(255,255,255,0.15)", transition: "all 0.3s" }} />
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {screen === "home"    && <HomeScreen onNew={() => go("people")} />}
        {screen === "people"  && <PeopleScreen people={people} setPeople={setPeople} onNext={() => go("items")} />}
        {screen === "items"   && <ItemsScreen people={people} items={items} setItems={setItems} localName={localName} setLocalName={setLocalName} tip={tip} setTip={setTip} onNext={() => go("claim")} />}
        {screen === "claim"   && <ClaimScreen people={people} items={items} setItems={setItems} tip={tip} onNext={() => go("summary")} />}
        {screen === "summary" && <SummaryScreen people={people} items={items} localName={localName} tip={tip} onReset={reset} />}
      </div>
    </div>
  );
}
