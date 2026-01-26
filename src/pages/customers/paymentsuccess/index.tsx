"use client";

import { useEffect, useState } from "react";
import "./index.scss";
import Chatbox from "../../../components/chatbox";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";
const EXECUTE_ENDPOINT = "/paypal/execute";

type Status = "loading" | "success" | "error";

export default function PaypalSuccessPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Đang xác nhận thanh toán...");
  const [detail, setDetail] = useState<any>(null);

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
          throw new Error(data?.message || "Execute payment thất bại");

        setStatus("success");
        setMessage("✅ Thanh toán thành công!");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Có lỗi xảy ra khi xử lý thanh toán.");
      }
    })();
  }, []);

  const badge =
    status === "success"
      ? "pp-badge pp-badgeSuccess"
      : status === "error"
      ? "pp-badge pp-badgeError"
      : "pp-badge pp-badgeLoading";

  return (
    <div className='pp-wrap'>
      <div className='pp-card pp-cardWide'>
        <div className='pp-headerRow'>
          <div className='pp-title'>PayPal Result</div>
          <div className={badge}>{status.toUpperCase()}</div>
        </div>

        <div className='pp-msg'>{message}</div>

        <div className='pp-meta'>
          <div>
            <span>API:</span> <b>{API_BASE + EXECUTE_ENDPOINT}</b>
          </div>
        </div>

        {detail && (
          <pre className='pp-pre'>{JSON.stringify(detail, null, 2)}</pre>
        )}

        <a className='pp-link' href='/paypal'>
          ← Quay lại trang thanh toán
        </a>
      </div>
      <Chatbox />
    </div>
  );
}
