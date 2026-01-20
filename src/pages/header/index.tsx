import React, { useState, useRef, useEffect } from "react";
import { Layout, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";

import {
  ShoppingCartOutlined,
  DownOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/img/logo_PhanCoffee.jpg";
import "./index.scss";

const { Header } = Layout;

function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

type NavItem =
  | { label: string; href: string; icon?: React.ReactNode; children?: never }
  | {
      label: string;
      href?: string;
      icon?: React.ReactNode;
      children: NavChild[];
    }
  | { label: ""; kind: "quick"; icon: React.ReactNode }; // ✅ icon-only item

type OpenKey = string | null;

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Coffee",
    children: [
      {
        label: "Espresso",
        href: "/products/espresso",
        desc: "Bold and rich coffee shots",
      },
      {
        label: "Cold Brew",
        href: "/products/cold-brew",
        desc: "Smooth and refreshing",
      },
      {
        label: "Specialty",
        href: "/products/specialty",
        desc: "Premium coffee blends",
      },
    ],
  },
  { label: "Contact", href: "/contacts" },
  { label: "About", href: "/about" },

  // ✅ Icon-only item -> mở select options (AntD Dropdown)
  { label: "", kind: "quick", icon: <DownOutlined /> },
];

function hasChildren(
  item: NavItem,
): item is Extract<NavItem, { children: NavChild[] }> {
  return "children" in item && Array.isArray(item.children);
}

function isQuick(item: NavItem): item is Extract<NavItem, { kind: "quick" }> {
  return (item as any).kind === "quick";
}

const HeaderPage: React.FC = () => {
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState<OpenKey>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Dark mode
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((v) => !v);

  // Close menus when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleNavClick = (href: string) => {
    navigate(href);
    setOpenKey(null);
  };

  const coffeeItem = NAV_ITEMS.find((i) => i.label === "Coffee");

  // ✅ Options của quick select
  const quickOptions: MenuProps["items"] = [
    // { key: "/products", label: "All Products" },
    // { key: "/products/espresso", label: "Espresso" },
    // { key: "/products/cold-brew", label: "Cold Brew" },
    // { key: "/products/specialty", label: "Specialty" },
    {
      key: "",
      label: <SunOutlined style={{ marginRight: 8 }} />,
      onClick: toggleDark,
    },
   
    { key: "/carts", label: <ShoppingCartOutlined style={{ fontSize: 20 }} /> },
    { key: "/profile", label: <UserOutlined /> },
     { type: "divider" },
  ];

  const onQuickSelect: MenuProps["onClick"] = ({ key }) => {
    handleNavClick(String(key));
  };

  return (
    <div ref={headerRef} className='header-wrapper'>
      {/* ===== HEADER ===== */}
      <Header className='homepage__header'>
        {/* Logo */}
        <div className='homepage__logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        {/* Menu */}
        <nav className='nav-menu'>
          {NAV_ITEMS.map((item, idx) => {
            // ✅ Icon-only quick select dropdown
            if (isQuick(item)) {
              return (
                <Dropdown
                  key={`quick-${idx}`}
                  menu={{ items: quickOptions, onClick: onQuickSelect }}
                  trigger={["click"]}
                  placement='bottomRight'>
                  <button
                    type='button'
                    className={cn("nav-item", "nav-icon-only")}
                    aria-label='Quick select'
                    title='Quick select'
                    onClick={(e) => e.preventDefault()}>
                    <span className='nav-item__icon'>{item.icon}</span>
                  </button>
                </Dropdown>
              );
            }

            // Item thường
            if (!hasChildren(item)) {
              return (
                <button
                  key={item.label}
                  type='button'
                  onClick={() => handleNavClick(item.href)}
                  className='nav-item'>
                  <span className='nav-item__text'>{item.label}</span>
                  {item.icon ? (
                    <span className='nav-item__icon'>{item.icon}</span>
                  ) : null}
                </button>
              );
            }

            // Item có submenu (Coffee)
            return (
              <button
                key={item.label}
                type='button'
                className={cn(
                  "nav-item",
                  openKey === item.label && "nav-item-active",
                )}
                onMouseEnter={() => setOpenKey(item.label)}
                onClick={() =>
                  setOpenKey(openKey === item.label ? null : item.label)
                }>
                <span className='nav-item__text'>{item.label}</span>
                <span className='nav-item__icon'>
                  <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} />
                </span>
              </button>
            );
          })}

          {/* ✅ Darkmode */}
          
        </nav>
      </Header>

      {/* ===== SUBMENU BAR (NẰM DƯỚI HEADER) ===== */}
      <div
        className={cn("submenu-bar", openKey === "Coffee" && "submenu-open")}
        onMouseEnter={() => setOpenKey("Coffee")}
        onMouseLeave={() => setOpenKey(null)}>
        <div className='submenu-inner'>
          {coffeeItem && hasChildren(coffeeItem)
            ? coffeeItem.children.map((child) => (
                <button
                  key={child.href}
                  type='button'
                  className='submenu-item'
                  onClick={() => handleNavClick(child.href)}>
                  <div className='submenu-title'>{child.label}</div>
                  {child.desc ? (
                    <div className='submenu-desc'>{child.desc}</div>
                  ) : null}
                </button>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

export default HeaderPage;
