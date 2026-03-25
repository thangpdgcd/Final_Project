import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { getUserById, type User } from "../../../api/userApi";
import { Descriptions, Spin, Alert, Button } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CameraOutlined,
  BellOutlined,
  CreditCardOutlined,
  LockOutlined,
  SettingOutlined,
  EyeInvisibleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import HeaderPage from "../../../components/layout/Header";
import FooterPage from "../../../components/layout/Footer";
import Chatbox from "../../../components/chatbox";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

const AVATAR_STORAGE_KEY = "profile_avatar";

const LAST_ORDER_KEY = "last_order_payload";

type AnyObj = Record<string, unknown>;
type ProfileSection = "profile" | "orders";

type OrderTab =
  | "all"
  | "pending"
  | "shipping"
  | "waiting"
  | "completed"
  | "cancelled"
  | "refund";

const descClass =
  "[&_.ant-descriptions-item-label_span]:inline-flex [&_.ant-descriptions-item-label_span]:items-center [&_.ant-descriptions-item-label_span]:gap-1.5 " +
  "dark:[&_.ant-descriptions-view]:!border-white/10 dark:[&_.ant-descriptions-row>th]:!border-white/10 dark:[&_.ant-descriptions-row>td]:!border-white/10 " +
  "dark:[&_.ant-descriptions-row>th]:!bg-transparent dark:[&_.ant-descriptions-row>td]:!bg-transparent dark:[&_.ant-descriptions-item-label]:!text-neutral-400 " +
  "dark:[&_.ant-descriptions-item-content]:!text-neutral-100";

const Profile: React.FC = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("profile");
  const [orderData, setOrderData] = useState<AnyObj | null>(null);
  const [createdOrder, setCreatedOrder] = useState<AnyObj | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderTab, setOrderTab] = useState<OrderTab>("all");
  const { t } = useTranslation();

  useEffect(() => {
    if (!userid) {
      setError(t("profile.missingUserId"));
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getUserById(Number(userid));
        setUser(userData);
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || t("profile.loadErrorFallback"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  useEffect(() => {
    if (!userid) return;
    try {
      const stored = localStorage.getItem(`${AVATAR_STORAGE_KEY}_${userid}`);
      if (stored) setAvatarUrl(stored);
    } catch {
      // ignore
    }
  }, [userid]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AnyObj;
      setOrderData((parsed.orderData as AnyObj) || null);
      setCreatedOrder((parsed.created as AnyObj) || null);
    } catch {
      // ignore
    }
  }, []);

  type LineItem = {
    quantity?: number;
    products?: { name?: string; price?: number; categoryName?: string };
  };

  const displayedItems = useMemo(() => {
    const base = (orderData?.cartItems as LineItem[] | undefined) || [];
    let list = base;

    if (orderSearch.trim()) {
      const kw = orderSearch.toLowerCase();
      list = list.filter((item) => {
        const name = String(item?.products?.name || "").toLowerCase();
        return name.includes(kw);
      });
    }

    return list;
  }, [orderData, orderSearch]);

  const totalVND = useMemo(() => {
    return displayedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.products?.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [displayedItems]);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      if (userid) {
        try {
          localStorage.setItem(`${AVATAR_STORAGE_KEY}_${userid}`, dataUrl);
        } catch {
          // quota
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const renderAvatar = () => (
    <div
      className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-full border border-[#ee4d2d] bg-[#fff7f5] hover:[&_.profile-avatar-edit]:opacity-100"
      onClick={handleAvatarClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAvatarClick();
        }
      }}
      aria-label={t("profile.changeAvatarAria")}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        onChange={handleAvatarChange}
        aria-hidden
      />
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="block h-full w-full object-cover" />
      ) : (
        <div
          className="grid h-full w-full place-items-center text-lg font-bold text-[#ee4d2d]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {user ? getInitials(user.name) : "?"}
        </div>
      )}
      <span className="profile-avatar-edit absolute inset-0 flex items-center justify-center gap-1 bg-black/50 text-[10px] text-white opacity-0 transition-opacity duration-200">
        <CameraOutlined /> {t("profile.changeAvatarLabel")}
      </span>
    </div>
  );

  const navBtn = (active: boolean, extra = "") =>
    `flex w-full cursor-pointer items-center gap-2 rounded-sm border-0 bg-transparent px-1 py-2 text-left text-sm text-black/80 hover:text-[#ee4d2d] dark:text-neutral-100 dark:hover:text-amber-400 ${extra} ` +
    (active
      ? "font-semibold text-[#ee4d2d] dark:text-amber-400"
      : "");

  if (loading) {
    return (
      <Layout className="flex min-h-screen flex-col">
        <HeaderPage />
        <Content className="grid min-h-[calc(100vh-72px)] flex-1 place-items-center bg-neutral-100 px-12 pb-10 pt-24 dark:bg-[var(--bg-main,#141414)]">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="py-12 text-center">
              <Spin size="large" tip={t("profile.loading")}>
                <div className="min-h-6 min-w-6" />
              </Spin>
            </div>
          </div>
        </Content>
        <FooterPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="flex min-h-screen flex-col">
        <HeaderPage />
        <Content className="min-h-[calc(100vh-72px)] flex-1 bg-neutral-100 px-12 pb-10 pt-24 dark:bg-[var(--bg-main,#141414)]">
          <div className="mx-auto w-full max-w-[1200px]">
            <Alert
              message={t("profile.alertTitle")}
              description={error}
              type="error"
              showIcon
              className="mx-auto max-w-xl"
            />
            <button
              type="button"
              className="mt-4 inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent text-[#ee4d2d]"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftOutlined /> {t("profile.back")}
            </button>
          </div>
        </Content>
        <FooterPage />
      </Layout>
    );
  }

  return (
    <Layout className="flex min-h-screen flex-col">
      <HeaderPage />
      <Content className="min-h-[calc(100vh-72px)] flex-1 bg-neutral-100 px-12 pb-10 pt-24 dark:bg-[var(--bg-main,#141414)] max-md:px-6 max-sm:px-5">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="flex h-full flex-col gap-3 rounded bg-white p-4 shadow-sm dark:border dark:border-white/10 dark:bg-[var(--bg-surface,#1e2022)] dark:shadow-xl">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-3 dark:border-white/10">
                {renderAvatar()}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 truncate text-sm font-semibold text-black/85 dark:text-neutral-100">
                    {user?.name ?? t("profile.noName")}
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-xs text-neutral-500 dark:text-neutral-400"
                    onClick={handleAvatarClick}
                  >
                    <CameraOutlined className="!text-xs" />{" "}
                    {t("profile.changeAvatarLabel")}
                  </button>
                </div>
              </div>

              <nav
                className="mt-1 flex flex-col gap-1"
                aria-label={t("profile.profileNavigationAria")}
              >
                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <BellOutlined />
                  </span>
                  <span>Thông báo</span>
                </button>

                <div className="mb-0.5 mt-2 text-xs font-semibold uppercase text-neutral-400 dark:text-neutral-400">
                  Tài khoản của tôi
                </div>

                <button
                  type="button"
                  className={navBtn(activeSection === "profile")}
                  onClick={() => setActiveSection("profile")}
                >
                  <span className="flex w-5 justify-center">
                    <UserOutlined />
                  </span>
                  <span>Hồ sơ</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <CreditCardOutlined />
                  </span>
                  <span>Ngân hàng</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <HomeOutlined />
                  </span>
                  <span>Địa chỉ</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <LockOutlined />
                  </span>
                  <span>Đổi mật khẩu</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <SettingOutlined />
                  </span>
                  <span>Cài đặt thông báo</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <EyeInvisibleOutlined />
                  </span>
                  <span>Thiết lập riêng tư</span>
                </button>

                <button type="button" className={navBtn(false)}>
                  <span className="flex w-5 justify-center">
                    <IdcardOutlined />
                  </span>
                  <span>Thông tin cá nhân</span>
                </button>

                <button
                  type="button"
                  className={navBtn(
                    activeSection === "orders",
                    "mt-2 border-t border-neutral-100 pt-2.5 dark:border-white/10",
                  )}
                  onClick={() => setActiveSection("orders")}
                >
                  <span className="flex w-5 justify-center">
                    <ShoppingCartOutlined />
                  </span>
                  <span>Đơn mua</span>
                </button>
              </nav>
            </aside>

            <section className="h-full rounded bg-white p-3 shadow-sm dark:border dark:border-white/10 dark:bg-[var(--bg-surface,#1e2022)] dark:shadow-xl sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-4 border-b border-neutral-100 pb-3 dark:border-white/10">
                <h2 className="m-0 text-lg font-medium text-black/85 dark:text-neutral-100">
                  {t("profile.accountBadge")}
                </h2>
                <Button
                  type="default"
                  size="small"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate(-1)}
                >
                  {t("profile.back")}
                </Button>
              </div>

              <div className="pt-1">
                {activeSection === "profile" ? (
                  user ? (
                    <Descriptions
                      bordered
                      column={1}
                      size="middle"
                      className={descClass}
                    >
                      <Descriptions.Item
                        label={
                          <span>
                            <UserOutlined /> {t("profile.fieldName")}
                          </span>
                        }
                      >
                        {user.name}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span>
                            <MailOutlined /> {t("profile.fieldEmail")}
                          </span>
                        }
                      >
                        {user.email}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span>
                            <HomeOutlined /> {t("profile.fieldAddress")}
                          </span>
                        }
                      >
                        {user.address || t("profile.emptyField")}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <span>
                            <PhoneOutlined /> {t("profile.fieldPhone")}
                          </span>
                        }
                      >
                        {user.phoneNumber || t("profile.emptyField")}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {t("profile.notFound")}
                    </p>
                  )
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: "Tất cả" },
                        { key: "pending", label: "Chờ thanh toán" },
                        { key: "shipping", label: "Vận chuyển" },
                        { key: "waiting", label: "Chờ giao hàng" },
                        { key: "completed", label: "Hoàn thành" },
                        { key: "cancelled", label: "Đã hủy" },
                        { key: "refund", label: "Trả hàng/Hoàn tiền" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={
                            "cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-2.5 py-2 text-[13px] text-black/75 hover:text-[#ee4d2d] dark:text-neutral-300 dark:hover:text-amber-400 " +
                            (orderTab === tab.key
                              ? "border-b-[#ee4d2d] font-medium text-[#ee4d2d] dark:border-amber-400 dark:text-amber-400"
                              : "")
                          }
                          onClick={() => setOrderTab(tab.key as OrderTab)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-w-[420px] flex-1">
                      <input
                        className="w-full rounded-sm border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-[#ee4d2d] focus:outline-none dark:border-neutral-600 dark:bg-[#141516] dark:text-neutral-100 dark:placeholder:text-neutral-500"
                        placeholder={t("profile.historyOrdersSearchPlaceholder")}
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>

                    {!displayedItems.length ? (
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Bạn chưa có đơn mua nào.
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-sm border border-neutral-300 dark:border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2.5 dark:border-white/10 dark:bg-[#181a1b]">
                          <div className="flex flex-wrap items-center gap-2 text-[13px] dark:text-neutral-100">
                            <span className="font-medium">
                              {String(
                                (orderData as { shopName?: string } | null)
                                  ?.shopName || "Phan Coffee",
                              )}
                            </span>
                            <button
                              type="button"
                              className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs hover:border-[#ee4d2d] hover:text-[#ee4d2d] dark:border-white/15 dark:bg-transparent dark:hover:text-amber-400"
                            >
                              Chat
                            </button>
                            <button
                              type="button"
                              className="cursor-pointer rounded-sm border border-neutral-300 bg-white px-2 py-1 text-xs hover:border-[#ee4d2d] hover:text-[#ee4d2d] dark:border-white/15 dark:bg-transparent dark:hover:text-amber-400"
                            >
                              Xem shop
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-teal-500">
                              Giao hàng thành công
                            </span>
                            <span className="font-medium text-[#ee4d2d] dark:text-amber-400">
                              {String(
                                (createdOrder?.order as AnyObj | undefined)?.status ||
                                  createdOrder?.status ||
                                  "HOÀN THÀNH",
                              )}
                            </span>
                          </div>
                        </div>

                        {displayedItems.map((item, idx: number) => (
                          <div
                            className="grid grid-cols-1 items-center gap-3 border-b border-neutral-100 p-3 last:border-b-0 dark:border-white/10 md:grid-cols-[minmax(0,1fr)_auto_auto] max-md:justify-items-start"
                            key={idx}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-20 w-20 shrink-0 rounded-sm border border-neutral-100 bg-neutral-100 dark:border-white/10 dark:bg-neutral-800" />
                              <div className="min-w-0">
                                <div className="mb-1 text-[13px] text-black/85 dark:text-neutral-100">
                                  {item?.products?.name || "Sản phẩm"}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Phân loại hàng:{" "}
                                  {item?.products?.categoryName || "Coffee"}
                                </div>
                              </div>
                            </div>
                            <div className="text-[13px] text-neutral-600 dark:text-neutral-400">
                              x{Number(item.quantity ?? 0)}
                            </div>
                            <div className="text-sm text-neutral-900 dark:text-neutral-300">
                              {Number(
                                item.products?.price || 0,
                              ).toLocaleString()}
                              ₫
                            </div>
                          </div>
                        ))}

                        <div className="flex flex-col items-end justify-between gap-3 border-t border-neutral-100 px-3 py-2.5 dark:border-white/10 max-md:items-end md:flex-row md:items-center">
                          <div className="text-[13px] dark:text-neutral-100">
                            <span className="mr-1">Thành tiền:</span>
                            <span className="text-base font-medium text-[#ee4d2d] dark:text-amber-400">
                              {totalVND.toLocaleString()}₫
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              className="min-w-[120px] cursor-pointer rounded-sm border border-[#ee4d2d] bg-[#fff7f5] px-3 py-1.5 text-[13px] text-[#ee4d2d] dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-400"
                            >
                              Mua lại
                            </button>
                            <button
                              type="button"
                              className="min-w-[120px] cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-[13px] text-neutral-600 hover:border-neutral-400 dark:border-white/15 dark:bg-transparent dark:text-neutral-300"
                            >
                              Liên hệ người bán
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </Content>
      <FooterPage />
      <Chatbox />
    </Layout>
  );
};

export default Profile;
