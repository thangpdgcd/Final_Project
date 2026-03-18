import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { apiProfile, UserProfile } from "../../../api/profileApi";
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
import "./index.scss";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

const AVATAR_STORAGE_KEY = "profile_avatar";

const LAST_ORDER_KEY = "last_order_payload";

type AnyObj = Record<string, any>;
type ProfileSection = "profile" | "orders";

type OrderTab =
  | "all"
  | "pending"
  | "shipping"
  | "waiting"
  | "completed"
  | "cancelled"
  | "refund";

const Profile: React.FC = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>("profile");
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
        const userData = await apiProfile(userid);
        setUser(userData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || t("profile.loadErrorFallback"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    // t is stable from react-i18next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  // Load avatar from localStorage when userid is available
  useEffect(() => {
    if (!userid) return;
    try {
      const stored = localStorage.getItem(`${AVATAR_STORAGE_KEY}_${userid}`);
      if (stored) setAvatarUrl(stored);
    } catch {
      // ignore
    }
  }, [userid]);

  // Load last order data (dùng chung với trang lịch sử đơn hàng)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_ORDER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AnyObj;
      setOrderData(parsed.orderData || null);
      setCreatedOrder(parsed.created || null);
    } catch {
      // ignore
    }
  }, []);

  const displayedItems = useMemo(() => {
    const base = (orderData?.cartItems as AnyObj[] | undefined) || [];
    let list = base;

    if (orderSearch.trim()) {
      const kw = orderSearch.toLowerCase();
      list = list.filter((item: AnyObj) => {
        const name = String(item?.products?.name || "").toLowerCase();
        return name.includes(kw);
      });
    }

    // TODO: filter theo orderTab khi backend có nhiều trạng thái đơn.
    return list;
  }, [orderData, orderSearch]);

  const totalVND = useMemo(() => {
    return displayedItems.reduce(
      (sum: number, item: AnyObj) =>
        sum + (item.products?.price || 0) * item.quantity,
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
          // quota or other
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const renderAvatar = () => (
    <div
      className="profile-avatar profile-avatar--editable"
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
        className="profile-avatar__input"
        onChange={handleAvatarChange}
        aria-hidden
      />
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="profile-avatar__img" />
      ) : (
        <div className="profile-avatar__fallback">
          {user ? getInitials(user.name) : "?"}
        </div>
      )}
      <span className="profile-avatar__edit">
        <CameraOutlined /> {t("profile.changeAvatarLabel")}
      </span>
    </div>
  );

  if (loading) {
    return (
      <Layout className="profile-layout">
        <HeaderPage />
        <Content className="profile-page profile-page--center">
          <div className="profile-page__container">
            <div className="profile-loading">
              <Spin size="large" tip={t("profile.loading")} />
            </div>
          </div>
        </Content>
        <FooterPage />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="profile-layout">
        <HeaderPage />
        <Content className="profile-page">
          <div className="profile-page__container">
            <Alert
              message={t("profile.alertTitle")}
              description={error}
              type="error"
              showIcon
              className="profile-page__alert"
            />
            <button
              type="button"
              className="profile-card__back"
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
    <Layout className="profile-layout">
      <HeaderPage />
      <Content className="profile-page">
        <div className="profile-page__container">
          <div className="profile-page__layout">
            {/* Sidebar giống Shopee */}
            <aside className="profile-sidebar">
              <div className="profile-sidebar__header">
                {renderAvatar()}
                <div className="profile-sidebar__info">
                  <div className="profile-sidebar__name">
                    {user?.name ?? t("profile.noName")}
                  </div>
                  <button
                    type="button"
                    className="profile-sidebar__edit"
                    onClick={handleAvatarClick}
                  >
                    <CameraOutlined style={{ fontSize: 12 }} />{" "}
                    {t("profile.changeAvatarLabel")}
                  </button>
                </div>
              </div>

              <nav
                className="profile-sidebar__nav"
                aria-label="Profile navigation"
              >
                {/* Thông báo */}
                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <BellOutlined />
                  </span>
                  <span>Thông báo</span>
                </button>

                {/* Nhóm: Tài khoản của tôi */}
                <div className="profile-sidebar__sectionTitle">
                  Tài khoản của tôi
                </div>

                <button
                  type="button"
                  className={
                    "profile-sidebar__navItem" +
                    (activeSection === "profile"
                      ? " profile-sidebar__navItem--active"
                      : "")
                  }
                  onClick={() => setActiveSection("profile")}
                >
                  <span className="profile-sidebar__icon">
                    <UserOutlined />
                  </span>
                  <span>Hồ sơ</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <CreditCardOutlined />
                  </span>
                  <span>Ngân hàng</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <HomeOutlined />
                  </span>
                  <span>Địa chỉ</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <LockOutlined />
                  </span>
                  <span>Đổi mật khẩu</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <SettingOutlined />
                  </span>
                  <span>Cài đặt thông báo</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <EyeInvisibleOutlined />
                  </span>
                  <span>Thiết lập riêng tư</span>
                </button>

                <button type="button" className="profile-sidebar__navItem">
                  <span className="profile-sidebar__icon">
                    <IdcardOutlined />
                  </span>
                  <span>Thông tin cá nhân</span>
                </button>

                {/* Đơn mua */}
                <button
                  type="button"
                  className={
                    "profile-sidebar__navItem profile-sidebar__navItem--separated" +
                    (activeSection === "orders"
                      ? " profile-sidebar__navItem--active"
                      : "")
                  }
                  onClick={() => setActiveSection("orders")}
                >
                  <span className="profile-sidebar__icon">
                    <ShoppingCartOutlined />
                  </span>
                  <span>Đơn mua</span>
                </button>
              </nav>
            </aside>

            {/* Nội dung chính */}
            <section className="profile-main">
              <div className="profile-main__header">
                <h2 className="profile-main__title">
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

              <div className="profile-main__body">
                {activeSection === "profile" ? (
                  user ? (
                    <Descriptions
                      bordered
                      column={1}
                      size="middle"
                      className="profile-desc"
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
                    <p className="profile-card__empty">
                      {t("profile.notFound")}
                    </p>
                  )
                ) : (
                  <div className="profile-orders">
                    <div className="profile-tabs">
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
                            "profile-tabs__item" +
                            (orderTab === tab.key
                              ? " profile-tabs__item--active"
                              : "")
                          }
                          onClick={() =>
                            setOrderTab(
                              tab.key as OrderTab,
                            )
                          }
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="profile-main__search">
                      <input
                        className="profile-main__searchInput"
                        placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>

                    {!displayedItems.length ? (
                      <p className="profile-card__empty">
                        Bạn chưa có đơn mua nào.
                      </p>
                    ) : (
                      <div className="order-card">
                        <div className="order-card__header">
                          <div className="order-card__shop">
                            <span className="order-card__shopName">
                              {orderData?.shopName || "Phan Coffee"}
                            </span>
                            <button
                              type="button"
                              className="order-card__shopAction"
                            >
                              Chat
                            </button>
                            <button
                              type="button"
                              className="order-card__shopAction"
                            >
                              Xem shop
                            </button>
                          </div>
                          <div className="order-card__status">
                            <span className="order-card__statusShipping">
                              Giao hàng thành công
                            </span>
                            <span className="order-card__statusMain">
                              {createdOrder?.order?.status ||
                                createdOrder?.status ||
                                "HOÀN THÀNH"}
                            </span>
                          </div>
                        </div>

                        {displayedItems.map((item: AnyObj, idx: number) => (
                          <div className="order-card__body" key={idx}>
                            <div className="order-card__product">
                              <div className="order-card__thumb" />
                              <div className="order-card__info">
                                <div className="order-card__name">
                                  {item?.products?.name || "Sản phẩm"}
                                </div>
                                <div className="order-card__meta">
                                  Phân loại hàng:{" "}
                                  {item?.products?.categoryName || "Coffee"}
                                </div>
                              </div>
                            </div>
                            <div className="order-card__qty">
                              x{item.quantity}
                            </div>
                            <div className="order-card__price">
                              {(item.products?.price || 0).toLocaleString()}₫
                            </div>
                          </div>
                        ))}

                        <div className="order-card__footer">
                          <div className="order-card__total">
                            <span>Thành tiền:</span>
                            <span className="order-card__totalValue">
                              {totalVND.toLocaleString()}₫
                            </span>
                          </div>
                          <div className="order-card__actions">
                            <button
                              type="button"
                              className="order-card__button order-card__button--primary"
                            >
                              Mua lại
                            </button>
                            <button
                              type="button"
                              className="order-card__button order-card__button--secondary"
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
