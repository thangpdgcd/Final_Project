import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "../src/styles/themes.scss";

// Khởi tạo dark mode ngay từ đầu (trước khi React render)
const initializeTheme = () => {
  const saved = localStorage.getItem("theme");
  const root = document.documentElement;
  
  if (saved === "dark") {
    root.classList.add("dark");
  } else if (saved === "light") {
    root.classList.remove("dark");
  } else {
    // Nếu không có trong localStorage, kiểm tra system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }
};

// Khởi tạo theme ngay lập tức
initializeTheme();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
