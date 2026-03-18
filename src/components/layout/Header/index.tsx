import React, { useMemo, useRef, useEffect, useState } from "react";
import { Layout, Input } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,

  MenuOutlined 
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getCartByUserId } from "../../../api/cartApi";
import "./index.scss";



const { Header } = Layout;

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "shop", href: "/products" },
  { label: "story", href: "/abouts" },
  { label: "roast", href: "/#home-roast" },
  { label: "contact", href: "/contacts" },
];

const HeaderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [cartCount, setCartCount] = useState(0);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      // keep for future UX; header uses goToProfileOrLogin
      void token;
      void user;
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const shouldBeDark =
      stored === "dark"
        ? true
        : stored === "light"
          ? false
          : document.documentElement.classList.contains("dark");

    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDarkMode(shouldBeDark);
  }, []);

  const isLoggedIn = useMemo(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }, [location.pathname]);

  const userId = useMemo(() => {
    const raw = localStorage.getItem("user_ID");
    const id = Number(raw);
    if (Number.isFinite(id) && id > 0) return id;

    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    try {
      const u = JSON.parse(rawUser);
      const fallback = Number(
        u?.user_ID ??
          u?.data?.user_ID ??
          u?.user?.user_ID ??
          u?.user?.id ??
          u?.id,
      );
      return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
    } catch {
      return null;
    }
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      if (!userId || !isLoggedIn) {
        if (!cancelled) setCartCount(0);
        return;
      }

      try {
        const items = await getCartByUserId(userId);
        const total = Array.isArray(items)
          ? items.reduce((sum, it) => sum + Number(it.quantity || 0), 0)
          : 0;
        if (!cancelled) setCartCount(total);
      } catch {
        if (!cancelled) setCartCount(0);
      }
    };

    void fetchCount();
    return () => {
      cancelled = true;
    };
  }, [userId, isLoggedIn, location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setSubmenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDarkMode(next);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_ID");
    setSubmenuOpen(false);
    navigate("/login");
  };

  const goToProfileOrLogin = () => {
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const storedId = localStorage.getItem("user_ID");
      const userId =
        storedId ||
        user?.user_ID ||
        user?.id ||
        user?.userId ||
        user?.data?.user_ID ||
        user?.user?.user_ID;

      if (userId) {
        navigate(`/profiles/${userId}`);
        return;
      }
    }

    navigate("/login");
  };

  const goToCartOrLogin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", {
        state: { from: { pathname: "/carts" } },
      });
      return;
    }
    navigate("/carts");
  };

  const labels: Record<string, string> = {
    shop: "Cửa hàng",
    story: "Câu chuyện",
    roast: "Rang xay",
    contact: "Liên hệ",
  };

  return (
    <div ref={headerRef} className='header-wrapper'>
      <Header className='user-header'>
        <div className='user-header__inner'>
          <div className='user-header__left'>
            <button className='user-brand' onClick={() => navigate("/")}>
           <img
                 src='https://res.cloudinary.com/dfjecxrnl/image/upload/v1773308731/199bea82-b758-411d-863a-1b7be6ecc8b4.png'
                  alt='Phan Coffee logo'
                />
              <span className='user-brand__name'>Phan Coffee</span>
            </button>
            <nav className='user-nav' aria-label='Điều hướng'>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className='user-nav__item'
                  onClick={() => {
                    if (item.href.startsWith("/#")) {
                      const id = item.href.replace("/#", "");
                      const el = document.getElementById(id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      return;
                    }
                    navigate(item.href);
                  }}>
                  {labels[item.label] || item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Center search bar */}
          <div className='user-header__center'>
            <div className='user-search'>
              <Input
                allowClear={false}
                bordered={false}
                prefix={<SearchOutlined />}
                placeholder={t("nav.searchPlaceholder") || "Tìm kiếm cà phê..."}
                className='user-search__input'
              />
            </div>
          </div>

          <div className='user-header__right'>
            <div className='user-submenu'>
              <button
                type='button'
                className='user-account'
                aria-haspopup='menu'
                aria-expanded={submenuOpen}
                onClick={() => setSubmenuOpen((v) => !v)}>
              
               <MenuOutlined />
              </button>

              {submenuOpen && (
                <div className='user-submenu__panel' role='menu' aria-label='Tài khoản & giỏ hàng'>
                  <div className='user-submenu__profile'>
                    <UserOutlined className='user-submenu__profile-icon' />
                    <div className='user-submenu__profile-text'>
                      <div className='user-submenu__name'>Alex Henderson</div>
                    </div>
                  </div>

                  <button
                    type='button'
                    className='user-submenu__item user-submenu__item--appearance'
                    role='menuitem'
                    onClick={toggleDarkMode}>
                    <span className='user-submenu__label'>Appearance</span>
                    <span className={`user-submenu__toggle ${isDarkMode ? "user-submenu__toggle--on" : ""}`}>
                      <span className='user-submenu__toggle-knob' />
                    </span>
                  </button>

                  <button
                    type='button'
                    className='user-submenu__item'
                    role='menuitem'
                    onClick={() => {
                      setSubmenuOpen(false);
                      goToCartOrLogin();
                    }}>
                    <div className='user-submenu__icon'>
                      <ShoppingCartOutlined />
                    </div>
                    <div className='user-submenu__text'>
                      <span className='user-submenu__label'>My Cart</span>
                      <span className='user-submenu__description'>
                        {cartCount} item{cartCount === 1 ? "" : "s"} in basket
                      </span>
                    </div>
                    {cartCount > 0 && <span className='user-submenu__badge'>{cartCount}</span>}
                  </button>

                  <button
                    type='button'
                    className='user-submenu__item'
                    role='menuitem'
                    onClick={() => {
                      setSubmenuOpen(false);
                      goToProfileOrLogin();
                    }}>
                    <div className='user-submenu__icon'>
                      <UserOutlined />
                    </div>
                    <span className='user-submenu__label'>Account Settings</span>
                  </button>

                  <button
                    type='button'
                    className='user-submenu__item user-submenu__item--danger'
                    role='menuitem'
                    onClick={logout}>
                    <span className='user-submenu__label'>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Header>
    </div>
  );
};

export default HeaderPage;

