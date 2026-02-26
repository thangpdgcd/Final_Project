import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__code">404</div>

        <div className="not-found__title">
          Trang không tồn tại
        </div>

        <div className="not-found__desc">
          Trang bạn đang tìm có thể đã bị xoá hoặc không còn tồn tại.
        </div>

        <button
          className="not-found__btn"
          onClick={() => navigate("/")}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default NotFound;
