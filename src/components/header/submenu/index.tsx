"use client";

import * as React from "react";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../../contexts/ThemeContext";

const Link = ({
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
  <a href={href} {...props} />
);

/** ------------------ utils ------------------ */
function cn(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

/** ------------------ types ------------------ */
type NavChild = {
  label: string;
  href: string;
  desc?: string;
};

type NavItem =
  | { label: string; href: string; children?: never }
  | { label: string; href?: string; children: NavChild[] };

type OpenKey = string | "USER" | null;

/** ------------------ data ------------------ */
const NAV: NavItem[] = [
  {
    label: "Cửa Hàng",
    children: [
      {
        label: "Khung Avatar",
        href: "/shop/frames",
        desc: "Huyết ấn • linh khí",
      },
      { label: "Vật Phẩm", href: "/shop/items", desc: "Đan dược • pháp khí" },
      { label: "VIP", href: "/shop/vip", desc: "Đặc quyền • tăng tu vi" },
    ],
  },
  {
    label: "Tu Luyện",
    children: [
      {
        label: "Điện Tu Luyện",
        href: "/cultivation",
        desc: "Tăng tu vi mỗi ngày",
      },
      { label: "Phúc Lợi", href: "/benefits", desc: "Nhận thưởng • nhiệm vụ" },
      {
        label: "Bảng Xếp Hạng",
        href: "/leaderboard",
        desc: "Danh vọng • công đức",
      },
    ],
  },
  { label: "Tin Tức", href: "/news" },
];

/** ------------------ component ------------------ */
export function SubMenuHeader(): React.ReactElement {
  const [openKey, setOpenKey] = React.useState<OpenKey>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const { dark, toggleDark } = useTheme();

  // close menus when clicking outside
  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header
      ref={wrapRef}
      className='sticky top-0 z-50 border-b border-amber-400/20 bg-gradient-to-r from-slate-950 via-red-950/20 to-slate-950 backdrop-blur-md'>
      <div className='mx-auto flex max-w-6xl items-center gap-3 px-3 py-2'>
        {/* Logo */}
        <Link
          href='/'
          className='group inline-flex items-center gap-2 rounded-xl px-2 py-1'>
          <span className='h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500/30 to-red-500/20 ring-1 ring-amber-400/30' />
          <span className='text-sm font-semibold text-amber-100/90 group-hover:text-amber-200'>
            sub menu
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className='ml-1 hidden items-center gap-1 md:flex'>
          {NAV.map((item) => {
            const hasChildren = "children" in item && !!item.children?.length;
            const key = item.label;

            if (!hasChildren) {
              return (
                <Link
                  key={key}
                  href={item.href ?? "/"}
                  className='rounded-xl px-3 py-2 text-sm font-semibold text-amber-100/80 transition hover:bg-amber-400/10 hover:text-amber-200'>
                  {item.label}
                </Link>
              );
            }

            const isOpen = openKey === key;

            return (
              <div
                key={key}
                className='relative'
                onMouseEnter={() => setOpenKey(key)}
                onMouseLeave={() => setOpenKey(null)}>
                <button
                  type='button'
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    "text-amber-100/80 hover:bg-amber-400/10 hover:text-amber-200",
                    isOpen && "bg-amber-400/10 text-amber-200",
                  )}>
                  {item.label}
                  <DownOutlined
                    style={{
                      fontSize: "12px",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={cn(
                    "absolute left-0 mt-2 w-[360px] origin-top rounded-2xl border",
                    "border-amber-400/20 bg-slate-950/95 shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
                    "ring-1 ring-amber-400/10 backdrop-blur-md transition duration-150",
                    isOpen
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-95 opacity-0",
                  )}>
                  <div className='p-2'>
                    <div className='mb-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 px-3 py-2 ring-1 ring-amber-400/10'>
                      <div className='text-xs font-semibold text-amber-200/90'>
                        {item.label}
                      </div>
                      <div className='text-[11px] text-amber-100/60'>
                        chọn mục để đi nhanh, kiểu dropdown submenu
                      </div>
                    </div>

                    <div className='grid gap-1'>
                      {item.children &&
                        item.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setOpenKey(null)}
                            className='group rounded-xl px-3 py-2 transition hover:bg-amber-400/10'>
                            <div className='flex items-start gap-3'>
                              <span className='mt-0.5 h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/10 ring-1 ring-amber-400/20 group-hover:from-amber-500/30' />
                              <div className='min-w-0'>
                                <div className='text-sm font-semibold text-amber-100/85 group-hover:text-amber-200'>
                                  {c.label}
                                </div>
                                {c.desc && (
                                  <div className='text-xs text-amber-100/55'>
                                    {c.desc}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>

                    <div className='mt-2 flex items-center justify-between rounded-xl px-3 py-2 ring-1 ring-amber-400/10'>
                      <span className='text-xs text-amber-100/60'>
                        hover để xổ, click để ghim
                      </span>
                      <span className='text-[11px] text-amber-200/70'>
                        ui huyết ấn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className='ml-auto flex items-center gap-2'>
          {/* Dark mode */}
          <button
            type='button'
            onClick={toggleDark}
            className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-100/80 transition hover:bg-amber-400/10 hover:text-amber-200'
            aria-label='Toggle dark mode'
            title='Dark mode'>
            {dark ? (
              <SunOutlined style={{ fontSize: "18px" }} />
            ) : (
              <MoonOutlined style={{ fontSize: "18px" }} />
            )}
          </button>

          {/* Cart */}
          <Link
            href='/cart'
            className='relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/5 text-amber-100/80 transition hover:bg-amber-400/10 hover:text-amber-200'
            aria-label='Cart'
            title='Giỏ hàng'>
            <ShoppingCartOutlined style={{ fontSize: "18px" }} />
            <span className='absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500/90 px-1 text-[11px] font-bold text-white ring-2 ring-slate-950'>
              3
            </span>
          </Link>

          {/* User */}
          <div className='relative'>
            <button
              type='button'
              onClick={() => setOpenKey(openKey === "USER" ? null : "USER")}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3",
                "text-amber-100/80 transition hover:bg-amber-400/10 hover:text-amber-200",
                openKey === "USER" && "bg-amber-400/10 text-amber-200",
              )}
              aria-label='User menu'
              title='Tài khoản'>
              <UserOutlined style={{ fontSize: "18px" }} />
              <span className='hidden text-sm font-semibold md:inline'>
                tài khoản
              </span>
              <DownOutlined
                style={{
                  fontSize: "12px",
                  transition: "transform 0.2s",
                  transform:
                    openKey === "USER" ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <div
              className={cn(
                "absolute right-0 mt-2 w-56 rounded-2xl border border-amber-400/20 bg-slate-950/95 p-2",
                "shadow-[0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-amber-400/10 backdrop-blur-md",
                "transition duration-150",
                openKey === "USER"
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0",
              )}>
              <Link
                href='/me'
                onClick={() => setOpenKey(null)}
                className='block rounded-xl px-3 py-2 text-sm font-semibold text-amber-100/80 hover:bg-amber-400/10 hover:text-amber-200'>
                hồ sơ
              </Link>
              <Link
                href='/wallet'
                onClick={() => setOpenKey(null)}
                className='block rounded-xl px-3 py-2 text-sm font-semibold text-amber-100/80 hover:bg-amber-400/10 hover:text-amber-200'>
                ví xu
              </Link>
              <Link
                href='/orders'
                onClick={() => setOpenKey(null)}
                className='block rounded-xl px-3 py-2 text-sm font-semibold text-amber-100/80 hover:bg-amber-400/10 hover:text-amber-200'>
                đơn hàng
              </Link>
              <div className='my-1 h-px bg-amber-400/10' />
              <button
                type='button'
                onClick={() => {
                  setOpenKey(null);
                  alert("sign out (demo)");
                }}
                className='w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-200/80 hover:bg-red-500/10 hover:text-red-200'>
                đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile quick links */}
      <div className='md:hidden'>
        <div className='mx-auto max-w-6xl px-3 pb-2'>
          <div className='flex gap-2 overflow-x-auto'>
            {NAV.map((item) => {
              const href =
                "href" in item && item.href
                  ? item.href
                  : "children" in item && item.children
                    ? (item.children[0]?.href ?? "/")
                    : "/";
              return (
                <Link
                  key={item.label}
                  href={href}
                  className='shrink-0 rounded-xl border border-amber-400/15 bg-amber-400/5 px-3 py-2 text-sm font-semibold text-amber-100/75'>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

/** ------------------ page ------------------ */
const SubMenuPage: React.FC = () => {
  return (
    <main className='min-h-screen bg-gradient-to-b from-slate-950 via-red-950/10 to-slate-950'>
      <SubMenuHeader />

      <section className='mx-auto max-w-6xl px-3 py-10'>
        <div className='rounded-3xl border border-amber-400/15 bg-amber-400/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]'>
          <h1 className='text-2xl font-bold text-amber-100/90'>
            Trang Sub Menu
          </h1>
          <p className='mt-2 text-sm text-amber-100/65'>
            Đây là trang demo riêng để test dropdown submenu, cart, user,
            darkmode.
          </p>

          <div className='mt-6 grid gap-3 md:grid-cols-3'>
            <div className='rounded-2xl border border-amber-400/15 bg-slate-950/40 p-4'>
              <div className='text-sm font-semibold text-amber-100/85'>
                Dropdown
              </div>
              <div className='mt-1 text-xs text-amber-100/60'>
                Hover hoặc click "Cửa Hàng / Tu Luyện".
              </div>
            </div>
            <div className='rounded-2xl border border-amber-400/15 bg-slate-950/40 p-4'>
              <div className='text-sm font-semibold text-amber-100/85'>
                Giỏ hàng
              </div>
              <div className='mt-1 text-xs text-amber-100/60'>
                Icon + badge demo (3).
              </div>
            </div>
            <div className='rounded-2xl border border-amber-400/15 bg-slate-950/40 p-4'>
              <div className='text-sm font-semibold text-amber-100/85'>
                User + Darkmode
              </div>
              <div className='mt-1 text-xs text-amber-100/60'>
                User dropdown và toggle theme.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SubMenuPage;
