// src/components/Success.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TIER_PRICES = { cat1: 850, cat2: 520, cat3: 290, hospitality: 2200 };
const FEES = { service: 0.12, booking: 4.99 };

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing your payment...");
  const [isLoading, setIsLoading] = useState(true);
  const hasCaptured = useRef(false);

  useEffect(() => {
    if (hasCaptured.current) return;
    hasCaptured.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid payment session.");
      setIsLoading(false);
      return;
    }

    const capturePayment = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: token }),
        });

        const data = await res.json();

        if (data.success) {
          // ── Read pendingTicketData saved before PayPal redirect ──────
          const pendingRaw = localStorage.getItem("pendingTicketData");
          let pending = null;

          if (pendingRaw) {
            try { pending = JSON.parse(pendingRaw); } catch (e) { console.error("Parse error:", e); }
          }

          // ── Build the full purchase record ───────────────────────────
          const quantity = pending?.quantity || 1;
          const tierId   = pending?.tierId   || "cat1";

          const purchaseData = {
            // Match info — pulled directly from pending (set in TicketCheckout before redirect)
            team1:           pending?.t1    || pending?.team1 || "TBD",
            team2:           pending?.t2    || pending?.team2 || "TBD",
            date:            pending?.date    || "Unknown date",
            venue:           pending?.venue   || "Unknown venue",
            city:            pending?.city    || "Unknown city",

            // Ticket info
            tierId,
            tierLabel:       pending?.tierLabel || "Category 1",
            quantity,
            ticketIds: Array.from({ length: quantity }, (_, i) =>
              String(Math.floor(Math.random() * 1_000_000_000) + 6_000_000_000 + i)
            ),

            // Buyer info
            buyer: pending?.buyer || {},

            // Order IDs
            internalOrderId: pending?.internalOrderId || data.orderId || token,
            paypalOrderId:   token,
          };

          // ── Save to localStorage so MyTickets can read it ────────────
          localStorage.setItem("recentPurchase", JSON.stringify(purchaseData));
          localStorage.removeItem("pendingTicketData");

          // ── Save to Firestore so Sell/Transfer modal can query it ─────
          try {
            const user     = auth.currentUser;
            const basePrice = TIER_PRICES[tierId] || 520;
            const subtotal  = basePrice * quantity;
            const total     = subtotal + subtotal * FEES.service + FEES.booking;

            await addDoc(collection(db, "orders"), {
              // Identity
              internalOrderId: purchaseData.internalOrderId,
              paypalOrderId:   token,
              status:          "paid",

              // Ticket
              tierId:     purchaseData.tierId,
              tierLabel:  purchaseData.tierLabel,
              qty:        quantity,
              ticketIds:  purchaseData.ticketIds,
              total,

              // Match — these are the fields that were showing as TBD before
              team1:  purchaseData.team1,
              team2:  purchaseData.team2,
              date:   purchaseData.date,
              venue:  purchaseData.venue,
              city:   purchaseData.city,

              // Match label for Navbar TransferModal display
              matchLabel: `${purchaseData.team1} vs ${purchaseData.team2}`,

              // Buyer nested so Navbar TransferModal query works
              buyer: {
                email:     user?.email                    || purchaseData.buyer?.email     || "",
                firstName: purchaseData.buyer?.firstName  || "",
                lastName:  purchaseData.buyer?.lastName   || "",
                phone:     purchaseData.buyer?.phone      || "",
                country:   purchaseData.buyer?.country    || "",
                uid:       user?.uid                      || "",
              },

              createdAt: serverTimestamp(),
            });

            console.log("✅ Order saved to Firestore with full match data");
          } catch (firestoreErr) {
            // Don't block the user — localStorage already has the data
            console.error("Firestore save failed:", firestoreErr);
          }

          setStatus("Payment successful! Redirecting to your tickets...");
          setIsLoading(false);
          setTimeout(() => navigate("/my-tickets"), 1500);

        } else {
          setStatus("Payment failed: " + (data.error || "Unknown error"));
          setIsLoading(false);
        }
      } catch (err) {
        setStatus("System Error: " + err.message);
        setIsLoading(false);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: "#0a0b10", fontFamily: "sans-serif",
    }}>
      <div style={{
        background: "#141622", border: "1px solid #23263b",
        borderRadius: 12, padding: "60px 80px", textAlign: "center",
      }}>
        {isLoading && (
          <div style={{
            width: 48, height: 48, border: "4px solid #23263b",
            borderTop: "4px solid #4a00e0", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 1.5rem",
          }} />
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ color: "white", margin: 0, fontWeight: 700 }}>{status}</h2>
        {isLoading && (
          <p style={{ color: "#8b8e9f", marginTop: 10 }}>
            Please do not close or refresh this window.
          </p>
        )}
      </div>
    </div>
  );
}