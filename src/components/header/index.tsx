import React, { useState, useRef, useEffect } from "react";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  DownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo_PhanCoffee.jpg";
import { useTheme } from "../../contexts/ThemeContext";
import "./index.scss";

const { Header } = Layout;

type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

type NavItem =
  | { label: string; href: string }
  | { label: string; children: NavChild[] }
  | { label: ""; kind: "quick"; icon: React.ReactNode };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Coffee",
    children: [
      { label: "All Products", href: "/products", desc: "All coffee products" },
      { label: "Espresso", href: "/products/espresso", desc: "Bold & rich" },
      {
        label: "Cold Brew",
        href: "/products/cold-brew",
        desc: "Smooth & fresh",
      },
      {
        label: "Specialty",
        href: "/products/specialty",
        desc: "Premium beans",
      },
    ],
  },
  { label: "Contact", href: "/contacts" },
  { label: "About", href: "/about" },
  { label: "", kind: "quick", icon: <DownOutlined /> },
];

const HeaderPage: React.FC = () => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { dark, toggleDark } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Kiểm tra login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!(token && user));
    };

    checkLoginStatus();
    // Lắng nghe sự kiện storage để cập nhật khi login/logout ở tab khác
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  // Kiểm tra lại khi component mount hoặc khi navigate
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
  }, [navigate]);

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
    window.location.reload(); // Reload để cập nhật UI
  };

  const quickOptions: MenuProps["items"] = [
    {
      key: "theme",
      label: (
        <div className='quick-item'>
          {dark ? <SunOutlined /> : <MoonOutlined />}
          <span className='quick-item-label'>
            {dark ? "Light Mode" : "Dark Mode"}
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
          <span className='quick-item-label'>Cart</span>
        </div>
      ),
      onClick: () => navigate("/carts"),
    },
    {
      key: "/profiles",
      label: (
        <div className='quick-item'>
          <UserOutlined />
          <span className='quick-item-label'>User</span>
        </div>
      ),
      onClick: () => {
        if (isLoggedIn) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (user.user_ID) {
            navigate(`/profiles/${user.user_ID}`);
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
                <span className='quick-item-label'>Login</span>
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
          <span>Phan Coffee</span>
        </div>

        {/* MENU */}
        <nav className='coffee-nav'>
          {NAV_ITEMS.map((item, idx) => {
            if ("kind" in item) {
              return (
                <Dropdown
                  key={idx}
                  trigger={["click"]}
                  placement='bottomRight'
                  overlayClassName='quick-dropdown'
                  menu={{
                    items: quickOptions,
                    selectable: false,
                  }}>
                  <button className='nav-item icon-only quick-trigger'>
                    {item.icon}
                  </button>
                </Dropdown>
              );
            }

            if ("children" in item) {
              return (
                <button
                  key={item.label}
                  className={`nav-item ${openKey === item.label ? "active" : ""}`}
                  onMouseEnter={() => setOpenKey(item.label)}
                  onClick={() =>
                    setOpenKey(openKey === item.label ? null : item.label)
                  }>
                  {item.label}
                  <DownOutlined className='arrow' />
                </button>
              );
            }

            return (
              <button
                key={item.label}
                className='nav-item'
                onClick={() => navigate(item.href!)}>
                {item.label}
              </button>
            );
          })}
        </nav>
      </Header>

      {/* SUBMENU */}
      <div
        className={`coffee-submenu ${openKey === "Coffee" ? "open" : ""}`}
        onMouseEnter={() => setOpenKey("Coffee")}
        onMouseLeave={() => setOpenKey(null)}>
        <div className='submenu-inner'>
          {NAV_ITEMS.find((i) => "children" in i && i.label === "Coffee") &&
            (NAV_ITEMS[1] as any).children.map((c: NavChild) => (
              <button
                key={c.href}
                className='submenu-card'
                onClick={() => navigate(c.href)}>
                <div className='title'>{c.label}</div>
                <div className='desc'>{c.desc}</div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderPage;
