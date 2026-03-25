import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-[#1f2933] text-white">
      <div className="w-[min(100%,520px)] px-10 py-10 text-center">
        <div className="mb-3 text-[120px] font-extrabold leading-none text-amber-400">
          404
        </div>

        <div className="mb-2.5 text-[28px]">Trang không tồn tại</div>

        <div className="mb-8 text-base text-white/85">
          Trang bạn đang tìm có thể đã bị xoá hoặc không còn tồn tại.
        </div>

        <button
          type="button"
          className="cursor-pointer rounded-full border-none bg-amber-400 px-8 py-3 font-semibold text-gray-900 transition hover:-translate-y-0.5 hover:bg-amber-500"
          onClick={() => navigate("/")}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFound;
