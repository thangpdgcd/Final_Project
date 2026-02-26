import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Khởi tạo từ localStorage hoặc system preference
  const [dark, setDarkState] = useState<boolean>(() => {
    // Kiểm tra localStorage trước
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      return saved === "dark";
    }

    // Nếu không có trong localStorage, kiểm tra system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return true;
    }

    // Mặc định là light
    return false;
  });

  // Áp dụng dark mode vào DOM ngay khi state thay đổi
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Khởi tạo dark mode khi component mount
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      setDarkState(true);
    } else {
      root.classList.remove("dark");
      setDarkState(false);
    }
  }, []);

  const toggleDark = () => {
    setDarkState((prev) => !prev);
  };

  const setDark = (value: boolean) => {
    setDarkState(value);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
