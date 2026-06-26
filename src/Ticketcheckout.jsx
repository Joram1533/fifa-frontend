// src/TicketCheckout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TIERS = [
  { id: "cat1", label: "Category 1", desc: "Best seats — behind goals, lower tier", price: 850, available: 12 },
  { id: "cat2", label: "Category 2", desc: "Side stands, mid-tier", price: 520, available: 28 },
  { id: "cat3", label: "Category 3", desc: "Upper tier, full pitch view", price: 290, available: 47 },
  { id: "hospitality", label: "Hospitality", desc: "VIP lounge, catering included", price: 2200, available: 4 },
];

const FEES = { service: 0.12, booking: 4.99 };
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

// ── Single shared keyframes injection (was duplicated in Step3 & Step4) ───────
const SHARED_STYLES = `@keyframes spin { to { transform: rotate(360deg); } }`;

function useCountdown(targetSeconds) {
  const [secs, setSecs] = useState(targetSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function StepIndicator({ step }) {
  const steps = ["Select tickets", "Your details", "Payment", "Confirm"];
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={num} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? "#1a003d" : active ? "#7ec23a" : "#e0e0e0",
                color: done || active ? "#fff" : "#888",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}>
                {done ? <i className="ti ti-check" style={{ fontSize: 13 }} /> : num}
              </div>
              <span style={{ fontSize: 10, color: active ? "#1a003d" : "#888", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: done ? "#1a003d" : "#e0e0e0", margin: "0 6px", marginBottom: 18 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function MatchHeader({ match }) {
  if (!match) return null;
  return (
    <div style={{ background: "#1a003d", borderRadius: 10, padding: "14px 18px", marginBottom: 20, color: "#fff" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
        {match.date} · {match.venue}, {match.city}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600 }}>
        <span>{match.t1}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>vs</span>
        <span>{match.t2}</span>
      </div>
    </div>
  );
}

function TierCard({ tier, qty, onQty, selected, onSelect }) {
  const urgency = tier.available <= 5;
  const soldOut = tier.available === 0;
  return (
    <div
      onClick={() => !soldOut && onSelect(tier.id)}
      style={{
        border: selected ? "2px solid #7ec23a" : "1px solid #e0e0e0",
        borderRadius: 10, padding: "14px 16px", marginBottom: 10,
        cursor: soldOut ? "not-allowed" : "pointer",
        opacity: soldOut ? 0.5 : 1,
        background: selected ? "rgba(126,194,58,0.05)" : "#fff",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>{tier.label}</span>
            {urgency && !soldOut && (
              <span style={{ fontSize: 10, background: "#fdecea", color: "#9b2626", borderRadius: 6, padding: "1px 6px", fontWeight: 600 }}>
                Only {tier.available} left
              </span>
            )}
            {soldOut && (
              <span style={{ fontSize: 10, background: "#f0f0f0", color: "#888", borderRadius: 6, padding: "1px 6px", fontWeight: 600 }}>
                Sold out
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{tier.desc}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1a003d" }}>{fmt(tier.price)}<span style={{ fontSize: 11, fontWeight: 400, color: "#888" }}> / ticket</span></div>
        </div>
        {selected && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => onQty(Math.max(1, qty - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>{qty}</span>
            <button onClick={() => onQty(Math.min(tier.available, qty + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderSummary({ tier, qty, compact }) {
  if (!tier) return null;
  const subtotal = tier.price * qty;
  const service = subtotal * FEES.service;
  const total = subtotal + service + FEES.booking;
  return (
    <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "14px 16px", fontSize: 13 }}>
      {!compact && <div style={{ fontWeight: 600, marginBottom: 10, color: "#121212" }}>Order summary</div>}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#555" }}>{tier.label} × {qty}</span>
        <span style={{ fontWeight: 500 }}>{fmt(subtotal)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#555" }}>Service fee (12%)</span>
        <span>{fmt(service)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ color: "#555" }}>Booking fee</span>
        <span>{fmt(FEES.booking)}</span>
      </div>
      <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, color: "#121212" }}>Total</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#1a003d" }}>{fmt(total)}</span>
      </div>
    </div>
  );
}

// ── Step 1: Pick tickets ─────────────────────────────────────────────────────
function Step1({ match, onNext }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [qty, setQty] = useState(1);
  const tier = TIERS.find(t => t.id === selectedTier);
  const timer = useCountdown(600);

  return (
    <div>
      <MatchHeader match={match} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#121212" }}>Choose ticket category</span>
        <span style={{ fontSize: 12, color: "#9b2626", background: "#fdecea", borderRadius: 8, padding: "3px 9px", fontWeight: 600 }}>
          <i className="ti ti-clock" style={{ fontSize: 12, marginRight: 4 }} />{timer} hold time
        </span>
      </div>
      {TIERS.map(t => (
        <TierCard key={t.id} tier={t} selected={selectedTier === t.id} qty={qty}
          onSelect={setSelectedTier} onQty={setQty} />
      ))}
      {tier && (
        <div style={{ marginTop: 16 }}>
          <OrderSummary tier={tier} qty={qty} />
          <button
            onClick={() => onNext({ tier, qty, match })}
            style={{ width: "100%", marginTop: 12, padding: "13px 0", background: "#1a003d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Continue to details →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Buyer details ────────────────────────────────────────────────────
function Step2({ data, onNext, onBack }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", country: "Kenya" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.phone.length < 6) e.phone = "Valid phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${errors[key] ? "#e24b4a" : "#e0e0e0"}`, borderRadius: 7, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#121212", background: "#fff" }} />
      {errors[key] && <span style={{ fontSize: 11, color: "#e24b4a" }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#121212" }}>Your details</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        {field("First name", "firstName", "text", "John")}
        {field("Last name", "lastName", "text", "Doe")}
      </div>
      {field("Email address", "email", "email", "john@example.com")}
      {field("Phone number", "phone", "tel", "+254 700 000 000")}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Country</label>
        <select value={form.country} onChange={e => set("country", e.target.value)}
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 7, fontSize: 14, background: "#fff", color: "#121212", fontFamily: "inherit" }}>
          {["Kenya","United States","Canada","United Kingdom","Germany","Brazil","France","Argentina","Japan","Australia","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ background: "#f0f8e8", border: "1px solid #c8e6a0", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#3b6d11", marginBottom: 16 }}>
        <i className="ti ti-shield-check" style={{ marginRight: 6 }} />
        Your data is encrypted and used solely for ticket delivery
      </div>
      <OrderSummary tier={data.tier} qty={data.qty} compact />
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "11px 0", background: "#fff", color: "#555", border: "1px solid #e0e0e0", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
        <button onClick={() => validate() && onNext({ ...data, buyer: form })}
          style={{ flex: 2, padding: "11px 0", background: "#1a003d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Continue to payment →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: PayPal payment ───────────────────────────────────────────────────
function Step3({ data, onNext, onBack }) {
  console.log("STEP3 data.match:", data.match);
  console.log("STEP3 data.match?.t1:", data.match?.t1);
  const [loading, setLoading] = useState(false);

  const subtotal = data.tier.price * data.qty;
  const service = subtotal * FEES.service;
  const total = subtotal + service + FEES.booking;

  const handlePayPal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: data.tier.id,
          qty: data.qty,
          buyer: data.buyer,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      localStorage.setItem("pendingTicketData", JSON.stringify({
        team1: data.match?.t1,
        team2: data.match?.t2,
        date: data.match?.date,
        venue: data.match?.venue,
        city: data.match?.city,
        quantity: data.qty,
        tierLabel: data.tier.label,
        tierId: data.tier.id,
        buyer: data.buyer,
        internalOrderId: json.orderId,
      }));

      window.location.href = json.approvalUrl;
    } catch (err) {
      alert("Payment error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#121212" }}>Payment</div>
      <div style={{ background: "#fafafa", border: "1px solid #e0e0e0", borderRadius: 12, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#003087", fontFamily: "Arial, sans-serif" }}>Pay</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#009cde", fontFamily: "Arial, sans-serif" }}>Pal</span>
        </div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>
          You'll be redirected to PayPal to securely complete your payment.
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1a003d", marginBottom: 4 }}>{fmt(total)}</div>
        <div style={{ fontSize: 11, color: "#888" }}>{data.tier.label} × {data.qty} + fees</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { icon: "ti-shield-check", text: "Buyer protection" },
          { icon: "ti-lock",         text: "256-bit encryption" },
          { icon: "ti-refresh",      text: "Easy refunds" },
        ].map(b => (
          <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555", background: "#f0f0f0", borderRadius: 8, padding: "5px 10px" }}>
            <i className={`ti ${b.icon}`} style={{ fontSize: 13, color: "#3b6d11" }} />
            {b.text}
          </div>
        ))}
      </div>
      <OrderSummary tier={data.tier} qty={data.qty} compact />
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "11px 0", background: "#fff", color: "#555", border: "1px solid #e0e0e0", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          ← Back
        </button>
        <button onClick={handlePayPal} disabled={loading}
          style={{ flex: 2, padding: "11px 0", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", background: loading ? "#aaa" : "#ffc439", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading
            ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: 16 }} />Redirecting…</>
            : <><span style={{ fontWeight: 800 }}>Pay</span><span style={{ fontWeight: 800, color: "#009cde" }}>Pal</span> — {fmt(total)}</>}
        </button>
      </div>
      {/* spin keyframe now lives in CheckoutModal — removed from here */}
    </div>
  );
}

// ── Step 4: Confirmation ─────────────────────────────────────────────────────
function Step4({ data }) {
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // FIX: useMemo instead of IIFE so this only runs once, not on every render
  const orderId = useMemo(() => {
    if (data.orderId) return data.orderId;
    try {
      const pending = JSON.parse(localStorage.getItem("pendingTicketData") || "{}");
      return pending.internalOrderId;
    } catch {
      return undefined;
    }
  }, [data.orderId]);

  // Opens /my-tickets in a new tab (intentional — keeps confirmation page open)
  const handleDownload = () => {
    window.open("/my-tickets", "_blank");
  };

  const handleEmailReceipt = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/send-receipt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email: data.buyer?.email }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setEmailSent(true);
    } catch (err) {
      alert("Failed to send receipt: " + err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, background: "#7ec23a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <i className="ti ti-check" style={{ fontSize: 32, color: "#fff" }} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#121212", marginBottom: 6 }}>Booking confirmed!</h2>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Tickets will be emailed to <strong>{data.buyer?.email}</strong></p>

      <div style={{ background: "#1a003d", borderRadius: 12, padding: "20px", marginBottom: 20, color: "#fff", textAlign: "left" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Booking reference</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, fontFamily: "monospace", marginBottom: 12 }}>{orderId ?? "—"}</div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
          <div><div style={{ color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Category</div><div style={{ fontWeight: 600 }}>{data.tier.label}</div></div>
          <div><div style={{ color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Quantity</div><div style={{ fontWeight: 600 }}>{data.qty} ticket{data.qty > 1 ? "s" : ""}</div></div>
          <div><div style={{ color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Match</div><div style={{ fontWeight: 600 }}>{data.match?.t1} vs {data.match?.t2}</div></div>
          <div><div style={{ color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>Venue</div><div style={{ fontWeight: 600 }}>{data.match?.city}</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleDownload}
          style={{ flex: 1, padding: "11px 0", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#121212" }}>
          <i className="ti ti-download" />Download tickets
        </button>
        <button onClick={handleEmailReceipt} disabled={emailLoading || emailSent}
          style={{ flex: 1, padding: "11px 0", background: emailSent ? "#f0f8e8" : "#fff", border: `1px solid ${emailSent ? "#c8e6a0" : "#e0e0e0"}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: emailLoading || emailSent ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: emailSent ? "#3b6d11" : "#121212" }}>
          <i className={`ti ${emailSent ? "ti-circle-check" : emailLoading ? "ti-loader-2" : "ti-mail"}`}
            style={emailLoading ? { animation: "spin 1s linear infinite" } : {}} />
          {emailSent ? "Receipt sent!" : emailLoading ? "Sending…" : "Email receipt"}
        </button>
      </div>
      {/* spin keyframe now lives in CheckoutModal — removed from here */}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function CheckoutModal({ match, onClose }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ match });

  const next = (update) => { setData(d => ({ ...d, ...update })); setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Single shared keyframes definition for the entire modal */}
      <style>{SHARED_STYLES}</style>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: "24px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#121212" }}>Buy tickets</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1 }}>×</button>
        </div>
        <StepIndicator step={step} />
        {step === 1 && <Step1 match={match} onNext={next} />}
        {step === 2 && <Step2 data={data} onNext={next} onBack={back} />}
        {step === 3 && <Step3 data={data} onNext={next} onBack={back} />}
        {step === 4 && <Step4 data={data} />}
      </div>
    </div>,
    document.body
  );
}

export { CheckoutModal };
export default CheckoutModal;