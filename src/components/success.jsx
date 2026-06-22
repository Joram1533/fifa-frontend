// src/components/Success.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing your payment...");

  useEffect(() => {
    // PayPal attaches ?token=XXXX to the URL when it sends them back
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid payment session.");
      return;
    }

    const capturePayment = async () => {
      try {
        // 🔥 THIS is the call that wakes up your backend terminal!
        const res = await fetch("http://localhost:4000/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: token })
        });

        const data = await res.json();

        if (data.success) {
           // 1. Grab what they wanted to buy from memory
           const pendingRaw = sessionStorage.getItem("pendingTicketData");
           if (pendingRaw) {
             const pending = JSON.parse(pendingRaw);
             
             // 2. Generate the final tickets
             const purchaseData = {
                ...pending,
                ticketIds: Array.from({ length: pending.quantity }, () => Math.floor(Math.random() * 10000000000))
             };
             
             // 3. Save it for the Ticket Portal
             localStorage.setItem("recentPurchase", JSON.stringify(purchaseData));
           }

           setStatus("Payment successful! Generating your tickets...");
           
           // 4. Send them to their tickets after 1.5 seconds!
           setTimeout(() => navigate("/my-tickets"), 1500);
        } else {
           setStatus("Payment failed: " + data.error);
        }
      } catch (err) {
        setStatus("System Error: " + err.message);
      }
    };

    capturePayment();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: "100px", textAlign: "center", color: "white", fontFamily: "sans-serif" }}>
      <h2>{status}</h2>
    </div>
  );
}