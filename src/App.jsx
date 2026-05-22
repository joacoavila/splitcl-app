import { useState, useRef, useEffect } from "react";

const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Math.abs(n));
const uid = () => Math.random().toString(36).slice(2, 8);
const COLORS = ["#A78BFA","#34D399","#F472B6","#60A5FA","#FBBF24","#F87171","#38BDF8","#FB923C"];
const BANCOS = ["BancoEstado","Santander","Banco de Chile","BCI","Scotiabank","Itaú","Falabella","BICE","Security","Otro"];
const TIPOS = ["Cuenta Corriente","Cuenta Vista","Cuenta RUT","Cuenta de Ahorro"];
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const purgeContacts = (contacts) => {
  const now = Date.now();
  return contacts.filter(c => c.balance !== 0 || !c.settledAt || (now - c.settledAt) < DAYS_30);
};

function Avatar({ name, color, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}22`, border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function GradBtn({ children, onClick, disabled = false, color = "purple", small = false }) {
  const bgs = { purple: "linear-gradient(135deg,#7C3AED,#4F46E5)", green: "linear-gradient(135deg,#059669,#10b981)", red: "linear-gradient(135deg,#dc2626,#f87171)", amber: "linear-gradient(135deg,#d97706,#fbbf24)" };
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: small ? "10px" : "14px", borderRadius: 12, border: "none", background: disabled ? "#1a1730" : bgs[color], color: disabled ? "#444" : color === "amber" ? "#0d0b1a" : "#fff", fontSize: small ? 13 : 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", padding: 14, ...style }}>{children}</div>;
}

function Label({ children }) {
  return <p style={{ color: "#555", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "0 0 8px", textTransform: "uppercase" }}>{children}</p>;
}

// ── Premium Modal ─────────────────────────────────────────────────────────────
function PremiumModal({ onClose }) {
  const [joined, setJoined] = useState(() => load("splitcl_premium_interest", false));
  const join = () => { save("splitcl_premium_interest", true); setJoined(true); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0f0d1f", borderRadius: 20, padding: 24, width: "100%", maxWidth: 430, border: "1px solid #3d3570" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>📸</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 900, margin: "0 0 8px", letterSpacing: -0.5 }}>Escaneo de boleta</h2>
          <p style={{ color: "#555", fontSize: 14, margin: 0 }}>Feature exclusiva de SplitCL Premium</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {["📷 Fotografía la boleta y la app la lee sola","⚡ Extrae ítems y precios en segundos","🇨🇱 Optimizado para boletas chilenas","✨ Más features premium próximamente"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1a1730", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ fontSize: 16 }}>{f.slice(0,2)}</span>
              <span style={{ color: "#aaa", fontSize: 13 }}>{f.slice(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#1a1730", borderRadius: 12, padding: "12px 16px", textAlign: "center", marginBottom: 16, border: "1px solid #7C3AED44" }}>
          <p style={{ color: "#A78BFA", fontSize: 28, fontWeight: 900, margin: "0 0 2px", letterSpacing: -1 }}>$2.990</p>
          <p style={{ color: "#555", fontSize: 12, margin: 0 }}>al mes · cancela cuando quieras</p>
        </div>
        {joined ? (
          <div style={{ background: "#34D39922", border: "1px solid #34D39944", borderRadius: 12, padding: "12px", textAlign: "center", marginBottom: 10 }}>
            <p style={{ color: "#34D399", fontSize: 14, fontWeight: 700, margin: 0 }}>✓ Te avisamos cuando esté disponible</p>
          </div>
        ) : (
          <GradBtn onClick={join}>Quiero acceso · $2.990/mes</GradBtn>
        )}
        <button onClick={onClose} style={{ width: "100%", background: "none", border: "none", color: "#555", fontSize: 14, padding: "12px", cursor: "pointer", marginTop: 6 }}>Ahora no</button>
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [name, setName] = useState("");
  const ref = useRef();
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>👋</div>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>Hola, ¿cómo te llamas?</h1>
        <p style={{ color: "#555", fontSize: 14, margin: 0 }}>Para reconocerte en cada división</p>
      </div>
      <div style={{ width: "100%" }}>
        <input ref={ref} value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && onDone(name.trim())}
          placeholder="Tu nombre..."
          style={{ width: "100%", background: "#1a1730", border: "1.5px solid #3d3570", borderRadius: 14, padding: "14px 16px", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
        <GradBtn onClick={() => name.trim() && onDone(name.trim())} disabled={!name.trim()}>Listo →</GradBtn>
      </div>
    </div>
  );
}

// ── Contact Autocomplete Input ────────────────────────────────────────────────
function ContactInput({ contacts, value, onChange, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const suggestions = value.length >= 2 ? contacts.filter(c => c.name.toLowerCase().startsWith(value.toLowerCase())) : [];
  return (
    <div style={{ position: "relative" }}>
      <input value={value} onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder || "Nombre..."}
        style={{ width: "100%", background: "#1a1730", border: "1.5px solid #3d3570", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      {open && suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#1f1a3a", border: "0.5px solid #3d3570", borderRadius: "0 0 10px 10px", zIndex: 100, overflow: "hidden" }}>
          {suggestions.map(c => (
            <div key={c.id} onMouseDown={() => { onSelect(c); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", borderBottom: "0.5px solid #2d2650" }}>
              <Avatar name={c.name} color={c.color} size={26} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>{c.name}</p>
                <p style={{ color: c.balance > 0 ? "#34D399" : c.balance < 0 ? "#F87171" : "#555", fontSize: 10, margin: 0 }}>
                  {c.balance > 0 ? `te debe ${fmt(c.balance)}` : c.balance < 0 ? `le debes ${fmt(c.balance)}` : "saldado"}
                </p>
              </div>
              <span style={{ color: "#A78BFA", fontSize: 10 }}>contacto ✓</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Item Form (2-step) ────────────────────────────────────────────────────────
function ItemForm({ onAdd, onCancel, accentColor = "#A78BFA" }) {
  const [step, setStep] = useState("name");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tip, setTip] = useState(0);
  const nameRef = useRef();
  const priceRef = useRef();

  useEffect(() => { if (step === "name") setTimeout(() => nameRef.current?.focus(), 50); }, [step]);
  useEffect(() => { if (step === "price") setTimeout(() => priceRef.current?.focus(), 50); }, [step]);

  const confirmName = () => { if (name.trim()) setStep("price"); };
  const confirmPrice = () => {
    const p = parseInt(String(price).replace(/\./g, "")) || 0;
    if (!p) return;
    onAdd({ id: uid(), name: name.trim(), price: p, tip: 0, total: p });
  };

  if (step === "name") return (
    <div style={{ borderRadius: 14, border: `2px solid #7C3AED`, overflow: "hidden", boxShadow: "0 0 24px #7C3AED22" }}>
      <div style={{ background: "#1f1a3a", padding: "12px 14px", borderBottom: "0.5px solid #3d3570" }}>
        <p style={{ color: "#A78BFA", fontSize: 10, fontWeight: 700, margin: "0 0 6px", letterSpacing: 1 }}>PASO 1 DE 2 · NOMBRE</p>
        <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && confirmName()}
          placeholder="Ej: Coca Cola, Galletas..."
          style={{ width: "100%", background: "none", border: "none", color: "#fff", fontSize: 17, fontWeight: 600, outline: "none", padding: 0 }} />
      </div>
      <div style={{ background: "#17132e", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={onCancel} style={{ background: "#F8717122", border: "1px solid #F8717144", borderRadius: 8, padding: "5px 14px", color: "#F87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✕ Cancelar</button>
        <button onClick={confirmName} disabled={!name.trim()} style={{ background: name.trim() ? "#7C3AED" : "#2d2650", border: "none", borderRadius: 8, padding: "5px 16px", color: name.trim() ? "#fff" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Siguiente →</button>
      </div>
    </div>
  );

  return (
    <div style={{ borderRadius: 14, border: "2px solid #FBBF24", overflow: "hidden", boxShadow: "0 0 24px #FBBF2422" }}>
      <div style={{ background: "#1f1c10", padding: "12px 14px", borderBottom: "0.5px solid #3d3000" }}>
        <p style={{ color: "#D97706", fontSize: 10, fontWeight: 700, margin: "0 0 4px", letterSpacing: 1 }}>PASO 2 DE 2 · PRECIO</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#FBBF24", fontSize: 22, fontWeight: 900 }}>$</span>
          <input ref={priceRef} value={price} onChange={e => setPrice(e.target.value)}
            onKeyDown={e => e.key === "Enter" && confirmPrice()}
            placeholder="0" type="number"
            style={{ flex: 1, background: "none", border: "none", color: "#FBBF24", fontSize: 26, fontWeight: 900, outline: "none", padding: 0 }} />
        </div>
        <p style={{ color: "#555", fontSize: 12, margin: "4px 0 0" }}>{name}</p>
      </div>
      <div style={{ background: "#191500", padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => setStep("name")} style={{ background: "#ffffff11", border: "1px solid #ffffff22", borderRadius: 8, padding: "5px 14px", color: "#aaa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>← Nombre</button>
        <button onClick={confirmPrice} disabled={!price} style={{ background: price ? "#FBBF24" : "#2d2a00", border: "none", borderRadius: 8, padding: "5px 16px", color: price ? "#0d0b1a" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Listo ✓</button>
      </div>
    </div>
  );
}

// ── Quick Record Screen ───────────────────────────────────────────────────────
function QuickScreen({ type, contacts, cuentas, setCuentas, onSave, onBack }) {
  const [personName, setPersonName] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAddCuenta, setShowAddCuenta] = useState(false);
  const [cuentaIdx, setCuentaIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ banco: "BancoEstado", tipo: "Cuenta Corriente", numero: "", rut: "", nombre: "", email: "" });

  const isDebt = type === "debt";
  const accentColor = isDebt ? "#F87171" : "#34D399";
  const accentBg = isDebt ? "#F8717122" : "#34D39922";
  const total = items.reduce((s, it) => s + it.total, 0);
  const displayName = selectedContact?.name || personName.trim();
  const cuenta = cuentas[cuentaIdx];

  const handleSelectContact = (c) => { setSelectedContact(c); setPersonName(c.name); };

  const waMsg = () => {
    const detail = items.map(it => `• ${it.name}${it.tip > 0 ? ` (+${it.tip}% propina)` : ""}: ${fmt(it.total)}`).join("\n");
    if (isDebt) return `Hola ${displayName}! Te debo ${fmt(total)} 🧾\n${detail}`;
    const cuentaTxt = cuenta ? `\n\nTransfiere a:\n${cuenta.banco} · ${cuenta.tipo}\nN°: ${cuenta.numero}\nRUT: ${cuenta.rut}` : "";
    return `Hola ${displayName}! Me debes ${fmt(total)} 🧾\n${detail}${cuentaTxt}`;
  };

  const guardarCuenta = () => {
    if (!nuevaCuenta.numero || !nuevaCuenta.rut || !nuevaCuenta.nombre) return;
    const updated = [...cuentas, nuevaCuenta];
    setCuentas(updated); save("splitcl_cuentas", updated);
    setCuentaIdx(updated.length - 1); setShowAddCuenta(false);
    setNuevaCuenta({ banco: "BancoEstado", tipo: "Cuenta Corriente", numero: "", rut: "", nombre: "", email: "" });
  };

  const canSave = displayName && items.length > 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 14, overflowY: "auto" }}>
      <div>
        <p style={{ color: accentColor, fontSize: 11, fontWeight: 700, margin: "0 0 2px", letterSpacing: 1 }}>{isDebt ? "YO LE DEBO A..." : "ME DEBE..."}</p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{isDebt ? "Registrar deuda" : "Registrar cobro"}</h2>
      </div>

      {/* Person */}
      <div>
        <Label>¿Quién?</Label>
        <ContactInput contacts={contacts} value={personName} onChange={v => { setPersonName(v); setSelectedContact(null); }} onSelect={handleSelectContact} placeholder={isDebt ? "¿A quién le debes?" : "¿Quién te debe?"} />
        {selectedContact && (
          <p style={{ color: accentColor, fontSize: 11, margin: "6px 0 0" }}>
            ✓ Contacto guardado · balance actual: {selectedContact.balance > 0 ? `te debe ${fmt(selectedContact.balance)}` : selectedContact.balance < 0 ? `le debes ${fmt(Math.abs(selectedContact.balance))}` : "saldado"}
          </p>
        )}
      </div>

      {/* Items */}
      <div>
        <Label>¿Qué?</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(it => (
            <div key={it.id} style={{ background: it.tip > 0 ? "#F59E0B11" : "#1a1730", borderRadius: 12, border: `0.5px solid ${it.tip > 0 ? "#F59E0B44" : "#2d2650"}`, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: it.tip > 0 ? "#F59E0B" : accentColor, flexShrink: 0 }} />
                  <span style={{ color: it.tip > 0 ? "#F59E0B" : "#fff", fontSize: 13, fontWeight: 600 }}>{it.name}</span>
                  {it.tip > 0 && <span style={{ background: "#F59E0B22", color: "#F59E0B", fontSize: 9, borderRadius: 99, padding: "1px 6px", border: "0.5px solid #F59E0B44" }}>+{it.tip}%</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: it.tip > 0 ? "#F59E0B" : accentColor, fontSize: 13, fontWeight: 700 }}>{fmt(it.total)}</span>
                  <button onClick={() => setItems(prev => prev.filter(x => x.id !== it.id))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              </div>
            </div>
          ))}
          {showForm ? (
            <ItemForm onAdd={it => { setItems(prev => [...prev, it]); setShowForm(false); }} onCancel={() => setShowForm(false)} accentColor={accentColor} />
          ) : (
            <button onClick={() => setShowForm(true)} style={{ background: "none", border: "1px dashed #3d3570", borderRadius: 12, padding: "11px", color: "#7C6FCD", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar ítem</button>
          )}
        </div>
      </div>

      {/* Total */}
      {items.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderTop: "0.5px solid #2d2650" }}>
          <span style={{ color: "#666", fontSize: 13 }}>Total</span>
          <span style={{ color: accentColor, fontSize: 22, fontWeight: 900 }}>{fmt(total)}</span>
        </div>
      )}

      {/* Cuenta (solo si me deben) */}
      {!isDebt && canSave && (
        <div>
          <Label>Cobrar con cuenta</Label>
          {cuentas.length === 0 ? (
            <button onClick={() => setShowAddCuenta(true)} style={{ width: "100%", background: "#1a1730", border: "1px dashed #3d3570", borderRadius: 12, padding: "11px", color: "#7C6FCD", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar cuenta bancaria</button>
          ) : (
            <div>
              <div style={{ background: "#1a1730", borderRadius: 12, padding: "11px 14px", border: "1.5px solid #7C3AED", marginBottom: 6 }}>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{cuenta?.banco} · {cuenta?.tipo}</p>
                <p style={{ color: "#666", fontSize: 11, margin: 0 }}>N°: {cuenta?.numero} · RUT: {cuenta?.rut}</p>
              </div>
              <div style={{ background: "#1a1730", borderRadius: 12, border: "0.5px solid #2d2650", overflow: "hidden" }}>
                <div onClick={() => setShowDropdown(!showDropdown)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", cursor: "pointer" }}>
                  <span style={{ color: "#7C6FCD", fontSize: 12 }}>Usar otra cuenta</span>
                  <span style={{ color: "#555", fontSize: 12 }}>{showDropdown ? "▴" : "▾"}</span>
                </div>
                {showDropdown && (
                  <div style={{ borderTop: "0.5px solid #2d2650" }}>
                    {cuentas.map((c, i) => i !== cuentaIdx && (
                      <div key={i} onClick={() => { setCuentaIdx(i); setShowDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", cursor: "pointer", borderBottom: "0.5px solid #2d2650" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#A78BFA22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#A78BFA", fontWeight: 700 }}>{c.banco.charAt(0)}</div>
                        <div><p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>{c.banco} · {c.tipo}</p><p style={{ color: "#555", fontSize: 11, margin: 0 }}>N°: {c.numero}</p></div>
                      </div>
                    ))}
                    <div onClick={() => { setShowAddCuenta(true); setShowDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", cursor: "pointer" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#7C3AED22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#A78BFA" }}>+</div>
                      <span style={{ color: "#7C6FCD", fontSize: 12 }}>Agregar nueva cuenta</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {showAddCuenta && (
            <div style={{ marginTop: 10 }}>
              <Card>
                <Label>Nueva cuenta bancaria</Label>
                {[{ label: "Nombre completo", key: "nombre", placeholder: "Felipe Andrés Acuña Aller" }, { label: "RUT", key: "rut", placeholder: "20.072.830-0" }, { label: "Tipo de cuenta", key: "tipo", type: "select", options: TIPOS }, { label: "N° cuenta", key: "numero", placeholder: "0 070 31 42664 7" }, { label: "Banco", key: "banco", type: "select", options: BANCOS }, { label: "Email (opcional)", key: "email", placeholder: "nombre@correo.cl" }].map(f => (
                  <div key={f.key} style={{ marginBottom: 8 }}>
                    <p style={{ color: "#666", fontSize: 11, margin: "0 0 4px" }}>{f.label}</p>
                    {f.type === "select" ? (
                      <select value={nuevaCuenta[f.key]} onChange={e => setNuevaCuenta(n => ({ ...n, [f.key]: e.target.value }))} style={{ width: "100%", background: "#0d0b1a", border: "0.5px solid #3d3570", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={nuevaCuenta[f.key]} onChange={e => setNuevaCuenta(n => ({ ...n, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: "#0d0b1a", border: "0.5px solid #3d3570", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowAddCuenta(false)} style={{ flex: 1, background: "#1a1730", border: "0.5px solid #3d3570", borderRadius: 10, padding: "9px", color: "#666", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                  <button onClick={guardarCuenta} style={{ flex: 2, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: 10, padding: "9px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Guardar →</button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {canSave && !showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "sticky", bottom: 0, paddingTop: 8, paddingBottom: 8, background: "linear-gradient(to top,#080810 70%,transparent)" }}>
          {!isDebt && cuenta && (
            <a href={`https://wa.me/?text=${encodeURIComponent(waMsg())}`} target="_blank" rel="noreferrer"
              style={{ display: "block", width: "100%", background: "#25D366", borderRadius: 12, padding: "13px", color: "#fff", fontSize: 14, fontWeight: 700, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
              💬 Cobrar por WhatsApp · {fmt(total)}
            </a>
          )}
          <GradBtn onClick={() => onSave({ type, personName: displayName, selectedContact, items, total })} color={isDebt ? "red" : "green"}>
            {isDebt ? `✓ Registrar · debo ${fmt(total)}` : `✓ Guardar cobro · ${fmt(total)}`}
          </GradBtn>
        </div>
      )}
    </div>
  );
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ userName, contacts, onNew, onQuick, onContactTap }) {
  const totalOwedToMe = contacts.filter(c => c.balance > 0).reduce((s, c) => s + c.balance, 0);
  const totalIOwe = contacts.filter(c => c.balance < 0).reduce((s, c) => s + Math.abs(c.balance), 0);
  const netBalance = totalOwedToMe - totalIOwe;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16, overflowY: "auto" }}>
      <div>
        <p style={{ color: "#A78BFA", fontSize: 11, fontWeight: 700, margin: "0 0 2px", letterSpacing: 1 }}>SPLITCL</p>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Hola, {userName} 👋</h1>
      </div>

      {/* Balance card */}
      <div style={{ background: netBalance >= 0 ? "linear-gradient(135deg,#0f2a1a,#0a1f14)" : "linear-gradient(135deg,#2a0f0f,#1f0a0a)", borderRadius: 16, padding: 18, border: `1px solid ${netBalance >= 0 ? "#34D39933" : "#F8717133"}` }}>
        <p style={{ color: netBalance >= 0 ? "#34D399" : "#F87171", fontSize: 10, fontWeight: 700, margin: "0 0 4px", letterSpacing: 1 }}>BALANCE NETO</p>
        <p style={{ color: netBalance >= 0 ? "#34D399" : "#F87171", fontSize: 36, fontWeight: 900, margin: "0 0 2px", letterSpacing: -1.5 }}>
          {netBalance >= 0 ? "+" : "-"}{fmt(netBalance)}
        </p>
        <p style={{ color: netBalance >= 0 ? "#1a6b46" : "#6b1a1a", fontSize: 12, margin: "0 0 12px" }}>
          {netBalance >= 0 ? "Te deben más de lo que debes" : "Debes más de lo que te deben"}
        </p>
        <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: `0.5px solid ${netBalance >= 0 ? "#34D39922" : "#F8717122"}` }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ color: "#34D399", fontSize: 15, fontWeight: 700, margin: 0 }}>{fmt(totalOwedToMe)}</p>
            <p style={{ color: "#1a6b46", fontSize: 10, margin: "2px 0 0" }}>te deben</p>
          </div>
          <div style={{ width: 0.5, background: "#ffffff11" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <p style={{ color: "#F87171", fontSize: 15, fontWeight: 700, margin: 0 }}>{fmt(totalIOwe)}</p>
            <p style={{ color: "#6b1a1a", fontSize: 10, margin: "2px 0 0" }}>debes tú</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onNew} style={{ flex: 1, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🧾 Dividir cuenta</button>
        <button onClick={() => onQuick("credit")} style={{ flex: 1, background: "#34D39922", color: "#34D399", border: "1px solid #34D39944", borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⚡ Me deben</button>
        <button onClick={() => onQuick("debt")} style={{ flex: 1, background: "#F8717122", color: "#F87171", border: "1px solid #F8717144", borderRadius: 12, padding: "12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>⚡ Yo debo</button>
      </div>

      {/* Contacts */}
      {contacts.length > 0 && (
        <div>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1 }}>CONTACTOS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {contacts.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).map(c => (
              <div key={c.id} onClick={() => onContactTap(c)} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1a1730", borderRadius: 12, padding: "11px 14px", border: `0.5px solid ${c.balance > 0 ? "#34D39933" : c.balance < 0 ? "#F8717133" : "#2d2650"}`, cursor: "pointer", opacity: c.balance === 0 ? 0.5 : 1 }}>
                <Avatar name={c.name} color={c.color} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: c.balance === 0 ? "#666" : "#fff", fontSize: 13, fontWeight: 700, margin: 0 }}>{c.name}</p>
                  <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0" }}>
                    {c.balance === 0 ? "todo saldado ✓" : c.balance > 0 ? `${c.pendingCount || 1} cobro${c.pendingCount > 1 ? "s" : ""} pendiente${c.pendingCount > 1 ? "s" : ""}` : "le debes · pendiente"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: c.balance > 0 ? "#34D399" : c.balance < 0 ? "#F87171" : "#555", fontSize: 15, fontWeight: 900, margin: 0 }}>
                    {c.balance > 0 ? "+" : c.balance < 0 ? "-" : ""}{fmt(c.balance)}
                  </p>
                  <p style={{ color: c.balance > 0 ? "#1a6b46" : c.balance < 0 ? "#6b1a1a" : "#444", fontSize: 10, margin: "2px 0 0" }}>
                    {c.balance > 0 ? "te debe" : c.balance < 0 ? "debes tú" : "saldado"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contacts.length === 0 && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, opacity: 0.4 }}>
          <span style={{ fontSize: 40 }}>💸</span>
          <p style={{ color: "#555", fontSize: 14, margin: 0 }}>Sin deudas registradas</p>
        </div>
      )}
    </div>
  );
}

// ── Division Flow ─────────────────────────────────────────────────────────────
function DivisionFlow({ userName, contacts, cuentas, setCuentas, onDone, onBack }) {
  const [step, setStep] = useState("people");
  const [people, setPeople] = useState(() => {
    const me = { id: uid(), name: userName, color: COLORS[0], isMe: true };
    return [me];
  });
  const [personInput, setPersonInput] = useState("");
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [localName, setLocalName] = useState("");
  const [showPremium, setShowPremium] = useState(false);
  const [cuentaIdx, setCuentaIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddCuenta, setShowAddCuenta] = useState(false);
  const [nuevaCuenta, setNuevaCuenta] = useState({ banco: "BancoEstado", tipo: "Cuenta Corriente", numero: "", rut: "", nombre: "", email: "" });
  const personRef = useRef();

  const addPerson = () => {
    const t = personInput.trim();
    if (!t || people.find(p => p.name.toLowerCase() === t.toLowerCase())) return;
    setPeople(prev => [...prev, { id: uid(), name: t, color: COLORS[prev.length % COLORS.length], isMe: false }]);
    setPersonInput("");
    personRef.current?.focus();
  };

  const toggleItemPerson = (itemId, personId) => {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it;
      const has = it.claimedBy.includes(personId);
      return { ...it, claimedBy: has ? it.claimedBy.filter(id => id !== personId) : [...it.claimedBy, personId] };
    }));
  };

  const addItem = (item) => {
    const me = people.find(p => p.isMe);
    setItems(prev => [...prev, { ...item, claimedBy: me ? [me.id] : [] }]);
    setShowItemForm(false);
  };

  const getOwes = (personId) => {
    return items.reduce((s, it) => {
      if (!it.claimedBy.includes(personId)) return s;
      return s + it.total / it.claimedBy.length;
    }, 0);
  };

  const cuenta = cuentas[cuentaIdx];

  const guardarCuenta = () => {
    if (!nuevaCuenta.numero || !nuevaCuenta.rut || !nuevaCuenta.nombre) return;
    const updated = [...cuentas, nuevaCuenta];
    setCuentas(updated); save("splitcl_cuentas", updated);
    setCuentaIdx(updated.length - 1); setShowAddCuenta(false);
  };

  const waLink = (person) => {
    const owes = Math.round(getOwes(person.id));
    const detail = items.filter(it => it.claimedBy.includes(person.id)).map(it => {
      const splitCount = it.claimedBy.length;
      const splitTxt = splitCount > 1 ? ` (÷${splitCount})` : "";
      const tipTxt = it.tip > 0 ? ` (+${it.tip}% prop.)` : "";
      return `* ${it.name}${tipTxt}${splitTxt}: ${fmt(Math.round(it.total / splitCount))}`;
    }).join("\n");
    const cuentaTxt = cuenta
      ? `\n\nDatos para transferencia:\n${cuenta.nombre}\n${cuenta.rut}\n${cuenta.tipo}\n${cuenta.numero}\n${cuenta.banco}${cuenta.email ? "\n" + cuenta.email : ""}`
      : "";
    return `https://wa.me/?text=${encodeURIComponent(`Hola ${person.name}! Me debes ${fmt(owes)} de ${localName || "la cuenta"} 🧾\n${detail}${cuentaTxt}`)}`;
  };

  const totalItems = items.reduce((s, it) => s + it.total, 0);

  if (step === "people") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16 }}>
      <div>
        <p style={{ color: "#A78BFA", fontSize: 11, fontWeight: 700, margin: "0 0 2px", letterSpacing: 1 }}>PASO 1 DE 2</p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0 }}>¿Quiénes van?</h2>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input ref={personRef} value={personInput} onChange={e => setPersonInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addPerson()} placeholder="Agregar persona..."
          style={{ flex: 1, background: "#1a1730", border: "0.5px solid #3d3570", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
        <button onClick={addPerson} style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 900, fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {people.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: `${p.color}11`, borderRadius: 12, padding: "10px 14px", border: `0.5px solid ${p.color}33` }}>
            <Avatar name={p.name} color={p.color} size={34} />
            <span style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: 600 }}>{p.name}{p.isMe ? <span style={{ color: p.color, fontSize: 11, marginLeft: 6 }}>· tú</span> : ""}</span>
            {!p.isMe ? <button onClick={() => setPeople(prev => prev.filter(x => x.id !== p.id))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16 }}>✕</button>
              : <button onClick={() => setPeople(prev => prev.filter(x => x.id !== p.id))} style={{ background: "none", border: "none", color: "#3d3570", cursor: "pointer", fontSize: 11 }}>quitar</button>}
          </div>
        ))}
      </div>
      <GradBtn onClick={() => setStep("items")} disabled={people.length < 2}>Continuar →</GradBtn>
    </div>
  );

  if (step === "items") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 14, overflowY: "auto" }}>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
      <div>
        <p style={{ color: "#A78BFA", fontSize: 11, fontWeight: 700, margin: "0 0 2px", letterSpacing: 1 }}>PASO 2 DE 2</p>
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0 }}>La boleta</h2>
      </div>

      {/* Premium scan button */}
      <button onClick={() => setShowPremium(true)} style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#1c1040,#2d1b69)", border: "1px solid #7C3AED55", borderRadius: 14, padding: "13px 16px", cursor: "pointer", width: "100%", textAlign: "left" }}>
        <span style={{ fontSize: 22 }}>📸</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#A78BFA", fontSize: 13, fontWeight: 700, margin: 0 }}>Escanear boleta</p>
          <p style={{ color: "#7C3AED", fontSize: 11, margin: 0 }}>Extrae ítems automáticamente</p>
        </div>
        <span style={{ background: "#7C3AED22", color: "#A78BFA", fontSize: 10, borderRadius: 99, padding: "3px 10px", border: "0.5px solid #7C3AED44", fontWeight: 700 }}>Premium · $2.990</span>
      </button>

      {/* Local name */}
      <input value={localName} onChange={e => setLocalName(e.target.value)} placeholder="Nombre del local..."
        style={{ background: "#1a1730", border: "0.5px solid #7C3AED44", borderRadius: 10, padding: "10px 14px", color: "#A78BFA", fontSize: 14, fontWeight: 700, outline: "none" }} />

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(it => {
          const hasTip = it.tip > 0;
          const tipAmt = Math.round(it.price * it.tip / 100);
          const perPerson = it.claimedBy.length > 1 ? Math.round(it.total / it.claimedBy.length) : 0;
          return (
            <div key={it.id} style={{ background: hasTip ? "#F59E0B11" : "#1a1730", borderRadius: 12, border: `0.5px solid ${hasTip ? "#F59E0B55" : "#2d2650"}`, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", borderBottom: "0.5px solid #1f1c35" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasTip ? "#F59E0B" : "#A78BFA", flexShrink: 0, marginLeft: 12 }} />
                <input
                  value={it.name}
                  onChange={e => setItems(prev => prev.map(x => x.id === it.id ? { ...x, name: e.target.value } : x))}
                  style={{ flex: 1, background: "none", border: "none", color: hasTip ? "#F59E0B" : "#fff", fontSize: 13, fontWeight: 600, padding: "10px 8px", outline: "none" }}
                />
                {hasTip && <span style={{ background: "#F59E0B22", color: "#F59E0B", fontSize: 9, borderRadius: 99, padding: "1px 6px", border: "0.5px solid #F59E0B44", marginRight: 6, whiteSpace: "nowrap" }}>+{it.tip}%</span>}
                <input
                  type="number"
                  value={it.price}
                  onChange={e => {
                    const p = parseInt(e.target.value) || 0;
                    const t = Math.round(p * it.tip / 100);
                    setItems(prev => prev.map(x => x.id === it.id ? { ...x, price: p, total: p + t } : x));
                  }}
                  style={{ width: 76, background: "none", border: "none", color: hasTip ? "#F59E0B" : "#FBBF24", fontSize: 13, fontWeight: 700, padding: "10px 8px", outline: "none", textAlign: "right" }}
                />
                <button onClick={() => setItems(prev => prev.filter(x => x.id !== it.id))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: "0 12px 0 4px" }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 5, padding: "7px 10px", flexWrap: "wrap", alignItems: "center" }}>
                {people.map(p => {
                  const active = it.claimedBy.includes(p.id);
                  return <button key={p.id} onClick={() => toggleItemPerson(it.id, p.id)} style={{ background: active ? p.color + "22" : "none", border: (active ? 1.5 : 0.5) + "px solid " + (active ? p.color : "#333"), borderRadius: 99, padding: "3px 10px", color: active ? p.color : "#555", fontSize: 11, fontWeight: active ? 700 : 400, cursor: "pointer" }}>{p.name.split(" ")[0]}</button>;
                })}
                {perPerson > 0 && <span style={{ color: "#555", fontSize: 10, marginLeft: "auto" }}>{fmt(perPerson)} c/u</span>}
              </div>
            </div>
          );
        })}
        {showItemForm ? <ItemForm onAdd={addItem} onCancel={() => setShowItemForm(false)} /> : (
          <button onClick={() => setShowItemForm(true)} style={{ background: "none", border: "1px dashed #3d3570", borderRadius: 12, padding: "12px", color: "#7C6FCD", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar ítem</button>
        )}
      </div>

      {/* Tip selector at bottom */}
      {items.length > 0 && !showItemForm && (
        <div style={{ background: "#1a1730", borderRadius: 14, padding: 14, border: "0.5px solid #2d2650" }}>
          <p style={{ color: "#555", fontSize: 10, fontWeight: 700, margin: "0 0 8px", letterSpacing: 1 }}>PROPINA — selecciona % y marca los ítems que la llevan</p>
          <div style={{ display: "flex", gap: 6, marginBottom: items.some(it => it.tip > 0) ? 10 : 0 }}>
            {[0, 10, 15, 20].map(t => (
              <button key={t} onClick={() => {
                setItems(prev => prev.map(it => {
                  if (it.tip === t) return it;
                  const tipAmt = Math.round(it.price * t / 100);
                  return { ...it, tip: t, total: it.price + tipAmt };
                }));
              }} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", background: items.every(it => it.tip === t) ? (t === 0 ? "#333" : "#F59E0B") : "rgba(255,255,255,0.06)", color: items.every(it => it.tip === t) ? (t === 0 ? "#aaa" : "#0d0b1a") : "#666", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {t === 0 ? "Sin" : t + "%"}
              </button>
            ))}
          </div>
          {items.some(it => it.tip > 0) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              <p style={{ color: "#666", fontSize: 11, width: "100%", margin: "0 0 4px" }}>¿Qué ítems llevan propina?</p>
              {items.map(it => (
                <button key={it.id} onClick={() => {
                  setItems(prev => prev.map(x => {
                    if (x.id !== it.id) return x;
                    const newTip = x.tip > 0 ? 0 : (items.find(i => i.tip > 0)?.tip || 10);
                    return { ...x, tip: newTip, total: x.price + Math.round(x.price * newTip / 100) };
                  }));
                }} style={{ background: it.tip > 0 ? "#F59E0B22" : "none", border: it.tip > 0 ? "1.5px solid #F59E0B" : "0.5px solid #333", borderRadius: 99, padding: "4px 12px", color: it.tip > 0 ? "#F59E0B" : "#555", fontSize: 12, fontWeight: it.tip > 0 ? 700 : 400, cursor: "pointer" }}>
                  {it.name.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Total */}
      {items.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderTop: "0.5px solid #2d2650" }}>
          <span style={{ color: "#666", fontSize: 13 }}>Total</span>
          <span style={{ color: "#FBBF24", fontSize: 20, fontWeight: 900 }}>{fmt(totalItems)}</span>
        </div>
      )}

      {/* Cuenta */}
      {items.length > 0 && localName.trim() && (
        <div>
          <Label>Cobrar con</Label>
          {cuentas.length === 0 ? (
            <button onClick={() => setShowAddCuenta(true)} style={{ width: "100%", background: "#1a1730", border: "1px dashed #3d3570", borderRadius: 12, padding: "11px", color: "#7C6FCD", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Agregar cuenta bancaria</button>
          ) : (
            <div>
              <div style={{ background: "#1a1730", borderRadius: 12, padding: "11px 14px", border: "1.5px solid #7C3AED", marginBottom: 6 }}>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{cuenta?.banco} · {cuenta?.tipo}</p>
                <p style={{ color: "#666", fontSize: 11, margin: 0 }}>N°: {cuenta?.numero} · RUT: {cuenta?.rut}</p>
              </div>
              <div style={{ background: "#1a1730", borderRadius: 12, border: "0.5px solid #2d2650", overflow: "hidden" }}>
                <div onClick={() => setShowDropdown(!showDropdown)} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer" }}>
                  <span style={{ color: "#7C6FCD", fontSize: 12 }}>Usar otra cuenta</span>
                  <span style={{ color: "#555" }}>{showDropdown ? "▴" : "▾"}</span>
                </div>
                {showDropdown && (
                  <div style={{ borderTop: "0.5px solid #2d2650" }}>
                    {cuentas.map((c, i) => i !== cuentaIdx && (
                      <div key={i} onClick={() => { setCuentaIdx(i); setShowDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", cursor: "pointer", borderBottom: "0.5px solid #2d2650" }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#A78BFA22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#A78BFA", fontWeight: 700 }}>{c.banco.charAt(0)}</div>
                        <div><p style={{ color: "#fff", fontSize: 12, fontWeight: 600, margin: 0 }}>{c.banco} · {c.tipo}</p><p style={{ color: "#555", fontSize: 11, margin: 0 }}>N°: {c.numero}</p></div>
                      </div>
                    ))}
                    <div onClick={() => { setShowAddCuenta(true); setShowDropdown(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", cursor: "pointer" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#7C3AED22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#A78BFA" }}>+</div>
                      <span style={{ color: "#7C6FCD", fontSize: 12 }}>Agregar nueva cuenta</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {showAddCuenta && (
            <Card style={{ marginTop: 10 }}>
              <Label>Nueva cuenta</Label>
              {[{ label: "Nombre completo", key: "nombre", placeholder: "Felipe Andrés Acuña Aller" }, { label: "RUT", key: "rut", placeholder: "20.072.830-0" }, { label: "Tipo de cuenta", key: "tipo", type: "select", options: TIPOS }, { label: "N° cuenta", key: "numero", placeholder: "0 070 31 42664 7" }, { label: "Banco", key: "banco", type: "select", options: BANCOS }, { label: "Email (opcional)", key: "email", placeholder: "nombre@correo.cl" }].map(f => (
                <div key={f.key} style={{ marginBottom: 8 }}>
                  <p style={{ color: "#666", fontSize: 11, margin: "0 0 4px" }}>{f.label}</p>
                  {f.type === "select" ? (
                    <select value={nuevaCuenta[f.key]} onChange={e => setNuevaCuenta(n => ({ ...n, [f.key]: e.target.value }))} style={{ width: "100%", background: "#0d0b1a", border: "0.5px solid #3d3570", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={nuevaCuenta[f.key]} onChange={e => setNuevaCuenta(n => ({ ...n, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", background: "#0d0b1a", border: "0.5px solid #3d3570", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAddCuenta(false)} style={{ flex: 1, background: "#1a1730", border: "0.5px solid #3d3570", borderRadius: 10, padding: "9px", color: "#666", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
                <button onClick={guardarCuenta} style={{ flex: 2, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: 10, padding: "9px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Guardar →</button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* WhatsApp cobrar + guardar */}
      {items.length > 0 && localName.trim() && !showItemForm && (
        <div style={{ position: "sticky", bottom: 0, paddingTop: 8, paddingBottom: 8, background: "linear-gradient(to top,#080810 70%,transparent)", display: "flex", flexDirection: "column", gap: 8 }}>
          {cuenta && people.filter(p => !p.isMe).map(p => (
            <a key={p.id} href={waLink(p)} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#25D36622", border: "0.5px solid #25D36644", borderRadius: 12, padding: "11px 16px", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>💬</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Cobrar a {p.name}</span>
              </div>
              <span style={{ color: "#34D399", fontSize: 13, fontWeight: 700 }}>{fmt(Math.round(getOwes(p.id)))}</span>
            </a>
          ))}
          <GradBtn onClick={() => onDone({ people, items, localName, total: totalItems })}>✓ Guardar división</GradBtn>
        </div>
      )}
    </div>
  );
}


// ── Contact Screen ────────────────────────────────────────────────────────────
function ContactScreen({ contact, records, cuentas, onMarkPaid, onBack }) {
  const pendingRecords = records.filter(r => r.contactId === contact.id && !r.paid);
  const paidRecords = records.filter(r => r.contactId === contact.id && r.paid);
  const balance = pendingRecords.reduce((s, r) => s + r.amount, 0);
  const isCredit = balance >= 0;
  const accentColor = isCredit ? "#34D399" : "#F87171";
  const cuenta = cuentas[0];

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "hoy";
    if (days === 1) return "ayer";
    return `hace ${days} días`;
  };

  const waMsg = (r) => {
    const detail = r.items.map(it => `• ${it.name}${it.tip > 0 ? ` (+${it.tip}% prop.)` : ""}: ${fmt(it.total)}`).join("\n");
    const cuentaTxt = cuenta ? `\n\nTransfiere a:\n${cuenta.banco} · ${cuenta.tipo}\nN°: ${cuenta.numero}\nRUT: ${cuenta.rut}` : "";
    const verb = r.type === "debt" ? "Te debo" : "Me debes";
    return `https://wa.me/?text=${encodeURIComponent(`Hola ${contact.name}! ${verb} ${fmt(Math.abs(r.amount))} 🧾\n${detail}${cuentaTxt}`)}`;
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ background: isCredit ? "linear-gradient(135deg,#0f2a1a,#0a1f14)" : "linear-gradient(135deg,#2a0f0f,#1f0a0a)", padding: "20px 24px", borderBottom: `0.5px solid ${accentColor}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <Avatar name={contact.name} color={contact.color} size={48} />
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{contact.name}</p>
            <p style={{ color: "#555", fontSize: 12, margin: "2px 0 0" }}>{pendingRecords.length} cobro{pendingRecords.length !== 1 ? "s" : ""} pendiente{pendingRecords.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
          <p style={{ color: accentColor, fontSize: 28, fontWeight: 900, margin: "0 0 2px", letterSpacing: -1 }}>
            {balance > 0 ? "+" : ""}{fmt(balance)}
          </p>
          <p style={{ color: isCredit ? "#1a6b46" : "#6b1a1a", fontSize: 12, margin: 0 }}>
            {balance > 0 ? "te debe en total" : balance < 0 ? "le debes en total" : "saldado ✓"}
          </p>
        </div>
      </div>

      {/* Records */}
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {pendingRecords.length === 0 && paidRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.4 }}>
            <p style={{ fontSize: 32 }}>💸</p>
            <p style={{ color: "#555", fontSize: 14 }}>Sin registros aún</p>
          </div>
        )}

        {pendingRecords.map(r => (
          <div key={r.id} style={{ background: "#1a1730", borderRadius: 14, border: `0.5px solid ${r.amount > 0 ? "#34D39933" : "#F8717133"}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "0.5px solid #1f1c35" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, margin: 0 }}>{r.label || "Cobro"}</p>
                  <p style={{ color: "#555", fontSize: 11, margin: "3px 0 0" }}>{timeAgo(r.createdAt)} · {r.items.length} ítem{r.items.length !== 1 ? "s" : ""}</p>
                </div>
                <span style={{ color: r.amount > 0 ? "#34D399" : "#F87171", fontSize: 16, fontWeight: 900 }}>{r.amount > 0 ? "+" : ""}{fmt(r.amount)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {r.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: it.tip > 0 ? "#F59E0B" : "#666", fontSize: 11 }}>
                      • {it.name}{it.tip > 0 ? <span style={{ background: "#F59E0B22", borderRadius: 99, padding: "0 5px", fontSize: 9, marginLeft: 4 }}>+{it.tip}%</span> : ""}
                    </span>
                    <span style={{ color: it.tip > 0 ? "#F59E0B" : "#666", fontSize: 11 }}>{fmt(it.total)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <a href={waMsg(r)} target="_blank" rel="noreferrer"
                style={{ flex: 1, background: "none", border: "none", borderRight: "0.5px solid #2d2650", padding: "10px", color: "#A78BFA", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                💬 Reenviar
              </a>
              <button onClick={() => onMarkPaid(r.id)}
                style={{ flex: 1, background: "none", border: "none", padding: "10px", color: "#34D399", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ✓ Pagado
              </button>
            </div>
          </div>
        ))}

        {/* Paid records */}
        {paidRecords.length > 0 && (
          <>
            <p style={{ color: "#444", fontSize: 10, fontWeight: 700, letterSpacing: 1, margin: "6px 0 0" }}>PAGADOS</p>
            {paidRecords.map(r => (
              <div key={r.id} style={{ background: "#15152a", borderRadius: 12, border: "0.5px solid #2d2650", padding: "11px 14px", opacity: 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ color: "#666", fontSize: 13, fontWeight: 700, margin: 0 }}>{r.label || "Cobro"}</p>
                    <p style={{ color: "#444", fontSize: 11, margin: "2px 0 0" }}>{timeAgo(r.createdAt)} · pagado ✓</p>
                  </div>
                  <span style={{ color: "#555", fontSize: 14, fontWeight: 700, textDecoration: "line-through" }}>{fmt(Math.abs(r.amount))}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function SplitCL() {
  const [userName, setUserName] = useState(() => load("splitcl_name", ""));
  const [contacts, setContacts] = useState(() => purgeContacts(load("splitcl_contacts", [])));
  const [records, setRecords] = useState(() => load("splitcl_records", []));
  const [cuentas, setCuentas] = useState(() => load("splitcl_cuentas", []));
  const [screen, setScreen] = useState("home");
  const [quickType, setQuickType] = useState("credit");
  const [activeContact, setActiveContact] = useState(null);

  const saveContacts = (c) => { setContacts(c); save("splitcl_contacts", c); };

  const upsertContact = (name, colorFallback, balanceDelta, recordData) => {
    let contactId = null;
    setContacts(prev => {
      const existing = prev.find(c => c.name.toLowerCase() === name.toLowerCase());
      let updated;
      if (existing) {
        contactId = existing.id;
        updated = prev.map(c => {
          if (c.name.toLowerCase() !== name.toLowerCase()) return c;
          const newBalance = c.balance + balanceDelta;
          return { ...c, balance: newBalance, settledAt: newBalance === 0 ? Date.now() : null, pendingCount: (c.pendingCount || 0) + 1 };
        });
      } else {
        contactId = uid();
        updated = [...prev, { id: contactId, name, color: colorFallback || COLORS[prev.length % COLORS.length], balance: balanceDelta, settledAt: balanceDelta === 0 ? Date.now() : null, pendingCount: 1 }];
      }
      save("splitcl_contacts", updated);
      return updated;
    });
    if (recordData) {
      const newRecord = { id: uid(), contactId: contactId || uid(), amount: balanceDelta, paid: false, createdAt: Date.now(), ...recordData };
      setRecords(prev => { const updated = [...prev, newRecord]; save("splitcl_records", updated); return updated; });
    }
  };

  const markPaid = (recordId) => {
    setRecords(prev => {
      const updated = prev.map(r => r.id === recordId ? { ...r, paid: true, paidAt: Date.now() } : r);
      save("splitcl_records", updated);
      return updated;
    });
    const record = records.find(r => r.id === recordId);
    if (record) {
      setContacts(prev => {
        const updated = prev.map(c => {
          if (c.id !== record.contactId) return c;
          const newBalance = c.balance - record.amount;
          return { ...c, balance: newBalance, settledAt: newBalance === 0 ? Date.now() : null };
        });
        save("splitcl_contacts", updated);
        return updated;
      });
    }
  };

  const handleDivisionDone = ({ people, items, localName, total }) => {
    people.filter(p => !p.isMe).forEach(p => {
      const personItems = items.filter(it => it.claimedBy.includes(p.id)).map(it => ({ ...it, total: Math.round(it.total / it.claimedBy.length), splitOf: it.claimedBy.length }));
      const owes = personItems.reduce((s, it) => s + it.total, 0);
      if (owes > 0) upsertContact(p.name, p.color, owes, { type: "credit", label: localName || "División", items: personItems });
    });
    setScreen("home");
  };

  const handleQuickSave = ({ type, personName, selectedContact, items, total }) => {
    const delta = type === "debt" ? -total : total;
    const label = items.length > 0 ? items[0].name : (type === "debt" ? "Deuda" : "Cobro");
    upsertContact(personName, selectedContact?.color || null, delta, { type, label, items });
    setScreen("home");
  };

  const handleOnboarding = (name) => { setUserName(name); save("splitcl_name", name); };

  if (!userName) return (
    <Wrapper><OnboardingScreen onDone={handleOnboarding} /></Wrapper>
  );

  return (
    <Wrapper>
      {screen !== "home" && (
        <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setScreen("home")} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "#fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <span style={{ fontWeight: 900, fontSize: 16 }}>Split<span style={{ color: "#A78BFA" }}>CL</span></span>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {screen === "home" && <HomeScreen userName={userName} contacts={contacts} onNew={() => setScreen("division")} onQuick={(t) => { setQuickType(t); setScreen("quick"); }} onContactTap={(c) => { setActiveContact(c); setScreen("contact"); }} />}
        {screen === "division" && <DivisionFlow userName={userName} contacts={contacts} cuentas={cuentas} setCuentas={setCuentas} onDone={handleDivisionDone} onBack={() => setScreen("home")} />}
        {screen === "quick" && <QuickScreen type={quickType} contacts={contacts} cuentas={cuentas} setCuentas={setCuentas} onSave={handleQuickSave} onBack={() => setScreen("home")} />}
        {screen === "contact" && activeContact && <ContactScreen contact={contacts.find(c => c.id === activeContact.id) || activeContact} records={records} cuentas={cuentas} onMarkPaid={markPaid} onBack={() => setScreen("home")} />}
      </div>
    </Wrapper>
  );
}

function Wrapper({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "'DM Sans',system-ui,sans-serif", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto", backgroundImage: "radial-gradient(ellipse at 20% 0%,#2e1065 0%,transparent 50%),radial-gradient(ellipse at 80% 100%,#1e1b4b 0%,transparent 50%)" }}>
      {children}
    </div>
  );
}
