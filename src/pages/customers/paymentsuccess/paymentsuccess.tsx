import { useEffect, useState } from "react";
import Chatbox from "../../../components/chatbox";

const API_BASE = (
  (import.meta.env.VITE_API_URL as string) || "http://localhost:8080"
).replace(/\/$/, "");
const EXECUTE_ENDPOINT = "/paypal/execute";

type Status = "loading" | "success" | "error";

export default function PaypalSuccessPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");
  const [detail, setDetail] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const paymentId = params.get("paymentId");
        const payerId = params.get("PayerID");

        if (!paymentId || !payerId) {
          setStatus("error");
          setMessage("Thiếu paymentId hoặc PayerID trong URL PayPal.");
          return;
        }

        const res = await fetch(`${API_BASE}${EXECUTE_ENDPOINT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            payerId,
            total: "10.00",
            currency: "USD",
          }),
        });

        const data = await res.json();
        setDetail(data);
        if (!res.ok)
          throw new Error(
            (data as { message?: string })?.message || "Execute payment thất bại",
          );

        setStatus("success");
        setMessage("✅ Thanh toán thành công!");
      } catch (e: unknown) {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Có lỗi xảy ra khi xử lý thanh toán.");
      }
    })();
  }, []);

  const badgeClass =
    status === "success"
      ? "rounded-full border border-green-600/30 bg-green-600/10 px-2.5 py-1.5 text-xs font-black tracking-widest text-green-700"
      : status === "error"
        ? "rounded-full border border-red-600/30 bg-red-600/10 px-2.5 py-1.5 text-xs font-black tracking-widest text-red-700"
        : "rounded-full border border-sky-600/30 bg-sky-600/10 px-2.5 py-1.5 text-xs font-black tracking-widest text-sky-700";

  return (
    <div
      className="grid min-h-screen place-items-center p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% 10%, #e8f0ff 0%, transparent 50%), radial-gradient(900px 500px at 90% 20%, #ffe7f3 0%, transparent 55%), radial-gradient(900px 500px at 30% 90%, #e9fff4 0%, transparent 55%), #0b1220",
      }}
    >
      <div className="w-full max-w-[720px] rounded-[18px] border border-white/10 bg-white/92 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-[10px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-[22px] font-extrabold tracking-tight">PayPal Result</div>
          <div className={badgeClass}>{status.toUpperCase()}</div>
        </div>

        <div className="mb-3 text-sm leading-relaxed text-black/85">{message}</div>

        <div className="mb-3.5 grid gap-2 text-[13px] text-black/80">
          <div>
            <span className="inline-block w-10 opacity-80">API:</span>{" "}
            <b className="font-extrabold">{API_BASE + EXECUTE_ENDPOINT}</b>
          </div>
        </div>

        {detail !== null && (
          <pre className="mt-2.5 h-[420px] overflow-auto rounded-[14px] bg-[#0b1220] p-3.5 text-xs leading-snug text-gray-200">
            {JSON.stringify(detail, null, 2)}
          </pre>
        )}

        <a
          className="mt-3 inline-block text-[13px] font-extrabold text-blue-600 hover:underline"
          href="/paypal"
        >
          ← Quay lại trang thanh toán
        </a>
      </div>
      <Chatbox />
    </div>
  );
}
