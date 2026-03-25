import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftOutlined, ReloadOutlined, ThunderboltOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Chatbox from "../../../components/chatbox";

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

    return client_id;
  };

  const loadPaypalScript = async (client_id: string, curr: string) => {
    if (window.paypal) return;

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
        style: {
          layout: "vertical",
          label: "paypal",
          shape: "rect",
          color: "gold"
        },

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

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;
    handleLoadPaypal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    if (!window.paypal) return;
    renderButtons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountFixed, currency]);

  return (
    <div className='min-h-screen bg-[#0b1220] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden'>
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden'
      >
        <div className='p-8 sm:p-10'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-black text-white tracking-tight flex items-center gap-2'>
                <ThunderboltOutlined className="text-yellow-400" />
                Thanh Toán
              </h1>
              <p className='text-white/50 text-sm mt-1'>Hoàn tất đơn hàng với PayPal</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-2 border border-white/5">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3 mb-8'>
            <button
              onClick={() => navigate(-1)}
              className='flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all border border-white/5 flex items-center justify-center gap-2 group'
            >
              <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>

            <button
              onClick={handleLoadPaypal}
              disabled={status === "loading"}
              className='flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50'
            >
              <ReloadOutlined className={status === "loading" ? "animate-spin" : ""} />
              {status === "loading" ? "Đang tải..." : "Refresh PayPal"}
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
            <div className='space-y-2'>
              <label className='text-xs font-bold text-white/40 uppercase tracking-widest px-1 ml-1'>
                Số tiền (USD)
              </label>
              <input
                className='w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                inputMode='decimal'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-bold text-white/40 uppercase tracking-widest px-1 ml-1'>
                Tiền tệ
              </label>
              <select
                className='w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer'
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value='USD' className="bg-[#1a2130]">USD - US Dollar</option>
                <option value='EUR' className="bg-[#1a2130]">EUR - Euro</option>
              </select>
            </div>
          </div>

          {totalAmountVND > 0 && (
            <div className='bg-white/5 rounded-2xl p-4 border border-white/5 mb-8 flex items-center gap-4'>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <ThunderboltOutlined />
              </div>
              <div>
                <div className="text-white/40 text-[10px] font-black uppercase tracking-tighter">Tổng đơn hàng quy đổi</div>
                <div className="text-xl font-bold text-white">
                  {Number(totalAmountVND).toLocaleString()}₫
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className='bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm font-medium mb-8 flex items-center gap-3'
              >
                <span className="text-lg">⚠️</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className='relative mb-8'>
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
            <span className="relative z-10 bg-[#1a2130]/0 px-4 text-white/20 text-[10px] uppercase font-black tracking-[0.2em] flex justify-center">
              Cổng thanh toán
            </span>
          </div>

          <div className='bg-white/5 rounded-3xl p-6 border border-white/10 min-h-[140px] flex flex-col justify-center relative overflow-hidden'>
            {status !== "ready" && (
              <div className='flex flex-col items-center justify-center gap-3 text-white/30 italic text-sm'>
                {status === "loading" ? (
                  <>
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                    <span>Đang chuẩn bị PayPal SDK...</span>
                  </>
                ) : (
                  <span>Nút thanh toán sẽ hiển thị tại đây</span>
                )}
              </div>
            )}

            <div ref={paypalRef} className={status === "ready" ? "block" : "hidden"} />
          </div>

          <div className='mt-8 pt-8 border-t border-white/5 flex flex-col gap-3'>
            <div className='flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold tracking-widest'>
              <InfoCircleOutlined /> Thông tin kỹ thuật
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/30">API Base</span>
                <span className="text-white/60 font-mono">{API_BASE}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/30">Endpoint</span>
                <span className="text-white/60 font-mono">{CONFIG_ENDPOINT}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Chatbox />

      <style>{`
        body {
            background: #0b1220;
        }
        select {
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1.5em;
        }
      `}</style>
    </div>
  );
}
