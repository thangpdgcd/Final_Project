import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.scss";

const API_BASE =
  (process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") as string) ||
  "http://localhost:8080";

const CONFIG_ENDPOINT = "/payment/config";
const CREATE_ENDPOINT = "/paypal/create";
const CAPTURE_ENDPOINT = "/paypal/capture";

type Status = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy từ OrderPage gửi sang
  const passed = location.state || {};
  const initialAmount = passed?.amount || "10.00";
  const initialCurrency = passed?.currency || "USD";
  const totalAmountVND = passed?.totalAmountVND || 0;

  const [amount, setAmount] = useState<string>(String(initialAmount));
  const [currency, setCurrency] = useState<string>(String(initialCurrency));

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const paypalRef = useRef<HTMLDivElement | null>(null);
  const scriptLoadedRef = useRef(false);

  const amountFixed = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return "0.00";
    return n.toFixed(2);
  }, [amount]);

  const fetchClientId = async (): Promise<string> => {
    const res = await fetch(`${API_BASE}${CONFIG_ENDPOINT}`, { method: "GET" });
    const data = await res.json();

    if (!res.ok)
      throw new Error(data?.message || "Không lấy được PayPal config");

    const client_id = String(data?.data || "").trim();
    if (!client_id) throw new Error("BE không trả PAYPAL_CLIENT_ID");
    if (client_id.includes("${"))
      throw new Error("ClientId bị sai format (${clientId})");

    return client_id;
  };

  const loadPaypalScript = async (client_id: string, curr: string) => {
    // nếu đã có paypal global rồi thì thôi
    if (window.paypal) return;

    // tránh append nhiều lần
    const existed = document.querySelector(`script[data-paypal-sdk="1"]`);
    if (existed) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      client_id
    )}&currency=${encodeURIComponent(curr)}&intent=capture`;
    script.setAttribute("data-paypal-sdk", "1");

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Load PayPal SDK failed"));
      document.body.appendChild(script);
    });
  };

  const renderButtons = () => {
    if (!window.paypal) return;
    if (!paypalRef.current) return;

    paypalRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", label: "paypal" },

        // ✅ tạo order qua BE (khuyến nghị)
        createOrder: async () => {
          const res = await fetch(`${API_BASE}${CREATE_ENDPOINT}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ total: amountFixed, currency }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || "Tạo order thất bại");

          const orderId = data?.id || data?.orderId;
          if (!orderId) throw new Error("BE không trả orderId/id");
          return String(orderId);
        },

        // ✅ approve -> capture qua BE
        onApprove: async (data: any) => {
          try {
            const orderId = data?.orderID;
            if (!orderId) throw new Error("Missing orderID từ PayPal");

            const res = await fetch(`${API_BASE}${CAPTURE_ENDPOINT}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });

            const cap = await res.json();
            if (!res.ok) throw new Error(cap?.message || "Capture thất bại");

            setError("");
            alert("✅ Thanh toán thành công!");
            navigate("/");
          } catch (e: any) {
            console.error(e);
            setError(e?.message || "Capture thất bại!");
          }
        },

        onError: (err: any) => {
          console.error(err);
          setError("PayPal error");
        },
      })
      .render(paypalRef.current);
  };

  const handleLoadPaypal = async () => {
    try {
      setError("");
      setStatus("loading");

      const client_id = await fetchClientId();
      await loadPaypalScript(client_id, currency);

      setStatus("ready");
      renderButtons();
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Có lỗi xảy ra");
    }
  };

  // Auto load lần đầu
  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;
    handleLoadPaypal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi đổi amount/currency -> render lại button (SDK đã load)
  useEffect(() => {
    if (status !== "ready") return;
    if (!window.paypal) return;
    renderButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountFixed, currency]);

  return (
    <div className='pp-wrap'>
      <div className='pp-card'>
        <div className='pp-header'>
          <div className='pp-title'>Payment</div>
          <div className='pp-sub'>
            Trang Payment: FE gọi <b>/payment/config</b> lấy client_id → load
            PayPal SDK → hiển thị PayPal Buttons
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}>
          <button className='pp-button' onClick={() => navigate(-1)}>
            ← Quay lại đơn hàng
          </button>

          <button
            className='pp-button'
            onClick={handleLoadPaypal}
            disabled={status === "loading"}>
            {status === "loading"
              ? "Đang tải PayPal..."
              : "Tải/Refresh PayPal Buttons"}
          </button>
        </div>

        <div className='pp-form'>
          <label className='pp-label'>
            Số tiền (USD)
            <input
              className='pp-input'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='10.00'
              inputMode='decimal'
            />
          </label>

          <label className='pp-label'>
            Tiền tệ
            <select
              className='pp-select'
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <option value='USD'>USD</option>
              <option value='EUR'>EUR</option>
            </select>
          </label>
        </div>

        {!!totalAmountVND && (
          <div className='pp-hint' style={{ marginTop: 8 }}>
            Tổng đơn hàng (VND):{" "}
            <b>{Number(totalAmountVND).toLocaleString()}₫</b>
          </div>
        )}

        {error && <div className='pp-error'>❌ {error}</div>}

        <div className='pp-divider' />

        <div className='pp-paypalBox'>
          {status !== "ready" && (
            <div className='pp-paypalPlaceholder'>
              {status === "loading"
                ? "Đang load PayPal SDK..."
                : "PayPal Buttons sẽ hiển thị ở đây"}
            </div>
          )}

          <div ref={paypalRef} />
        </div>

        <div className='pp-hint'>
          API Base: <b>{API_BASE}</b>
          <br />
          Config endpoint: <b>{CONFIG_ENDPOINT}</b>
        </div>
      </div>
    </div>
  );
}
