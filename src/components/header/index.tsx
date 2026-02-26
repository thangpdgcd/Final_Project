import React, { useState, useRef, useEffect } from "react";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useTheme } from "../contexts/ThemeContext";
import "./index.scss";
import {
  DownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const logo = `${process.env.PUBLIC_URL || ""}/logo_Web_Phan_Coffeess.png`;

const { Header } = Layout;

type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

type NavItem =
  | { label: string; href: string }
  | { label: string; children: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { label: "home", href: "/" },
  { label: "coffee", href: "/products" },
  { label: "contact", href: "/contacts" },
  { label: "about", href: "/about" },
];

const HeaderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { dark, toggleDark } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!(token && user));
    };

    checkLoginStatus();
    // Listen for storage event to update when login/logout in another tab
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // Re-check when route changes (e.g. after login redirect)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload(); // Reload to update UI
  };

  const quickOptions: MenuProps["items"] = [
    {
      key: "theme",
      label: (
        <div className='quick-item'>
          {dark ? <SunOutlined /> : <MoonOutlined />}
          <span className='quick-item-label'>
            {dark ? t("nav.lightMode") : t("nav.darkMode")}
          </span>
        </div>
      ),
      onClick: toggleDark,
    },
    {
      key: "/carts",
      label: (
        <div className='quick-item'>
          <ShoppingCartOutlined />
          <span className='quick-item-label'>{t("nav.cart")}</span>
        </div>
      ),
      onClick: () => navigate("/carts"),
    },
    {
      key: "/profiles",
      label: (
        <div className='quick-item'>
          <UserOutlined />
          <span className='quick-item-label'>{t("nav.user")}</span>
        </div>
      ),
      onClick: () => {
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
          } else {
            navigate("/login");
          }
        } else {
          navigate("/login");
        }
      },
    },
    // Divider
    {
      type: "divider",
    },
    // Login/Logout buttons
    ...(isLoggedIn
      ? [
        {
          key: "logout",
          label: (
            <div className='quick-item quick-item--logout'>
              <LogoutOutlined />
              <span className='quick-item-label'>Logout</span>
            </div>
          ),
          onClick: handleLogout,
        },
      ]
      : [
        {
          key: "login",
          label: (
            <div className='quick-item quick-item--login'>
              <LoginOutlined />
              <span className='quick-item-label'>{t("nav.login")}</span>
            </div>
          ),
          onClick: () => navigate("/login"),
        },
      ]),
  ];

  return (
    <div ref={headerRef} className='header-wrapper'>
      <Header className='coffee-header'>
        {/* LOGO */}
        <div className='coffee-logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span>{t("common.brandName")}</span>
        </div>

        {/* MENU + LANGUAGE SWITCH */}
        <div className="coffee-nav-wrapper">
          <div className='coffee-nav'>
            {NAV_ITEMS.map((item, idx) => {
              if ("children" in item) {
                return (
                  <button
                    key={item.label}
                    className={`nav-item ${openKey === item.label ? "active" : ""}`}
                    onMouseEnter={() => setOpenKey(item.label)}
                    onClick={() =>
                      setOpenKey(openKey === item.label ? null : item.label)
                    }>
                    {t(`nav.${item.label}`)}
                    <DownOutlined className='arrow' />
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  className='nav-item'
                  onClick={() => navigate(item.href!)}>
                  {item.label ? t(`nav.${item.label}`) : ""}
                </button>
              );
            })}

            <div className='lang-switch'>
              <button
                type='button'
                className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
                onClick={() => i18n.changeLanguage("en")}
              >
                EN
              </button>
              <button
                type='button'
                className={`lang-btn ${i18n.language === "vi" ? "active" : ""}`}
                onClick={() => i18n.changeLanguage("vi")}
              >
                VN
              </button>
            </div>

            <Dropdown
              trigger={["click"]}
              placement='bottomRight'
              menu={{
                items: quickOptions,
                selectable: false,
              }}>
              <button className='nav-item icon-only quick-trigger'>
                <DownOutlined />
              </button>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* SUBMENU */}
      

    </div>
  );
};

export default HeaderPage;
