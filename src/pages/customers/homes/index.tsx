import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Card, Carousel, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import bannerrobusta from "../../../assets/img/robustaphancoffee.png";
import bannerarabica from "../../../assets/img/arabicaphancofffee.png";
import bannerhoney from "../../../assets/img/caphehoneyphancoffee.png";
import aboutImage from "../../../assets/img/robustakontum.jpg";

import "./index.scss";
import BannerCarousel from "../../service";
import FooterPage from "../../footer";

const { Header, Content } = Layout;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [contactForm] = Form.useForm();

  // ✅ trạng thái đăng nhập dựa theo token
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  // nếu token đổi ở tab khác
  useEffect(() => {
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ✅ mapping route PHẢI khớp App.tsx
  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contacts", // App đang dùng /contacts
    about: "/about",
    login: "/login",
    cart: "/carts",
    carts: "/carts",
  };

  const handleMenuClick = (e: { key: string }) => {
    // 👉 Logout
    if (e.key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // nếu có lưu user
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }

    // 👉 Login
    if (e.key === "login") {
      navigate("/login");
      return;
    }

    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  const menuitems = [
    { key: "home", label: "Home" },
    { key: "products", label: "Coffee" },
    { key: "contact", label: "Contact" },
    { key: "about", label: "About" },
    {
      key: isLoggedIn ? "logout" : "login",
      label: isLoggedIn ? "Log Out" : "Log In",
    },
    {
      key: "carts",
      label: (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "100%",
          }}>
          <ShoppingCartOutlined style={{ fontSize: 20, color: "#000" }} />
        </span>
      ),
    },
  ];

  const galleryImages: string[] = [
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/485144388_696963506184581_8177906150215252834_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHZT7ROiKb7BhkxwLLanAioSAQLMj___1hIBAsyP___WH3BNZ0Ap_wtCHFbFCKYALWWB7Wp2fXTDZLs12Xwfe2L&_nc_ohc=Kaujtk80alEQ7kNvwFZsF92&_nc_oc=AdmPAxQSuk3gs130jL0nAJ_ZJjsU0z43SyUr9z6Y_XWh3WBdHYsFgrJf-g3uJmvyF2GPKYY2f0GxriQ80KV-BxAn&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=wJpchH6EQSVMgpxIhWSjnw&oh=00_AflV2XZxOqt9dOUXjOWDiNdiJmEG0X8LBUfaQGoqhN-QUQ&oe=693C00C6",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/485279782_695975656283366_2260645432310935248_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFby_BUIYvwC92acLfNy_lINqw2JOdft8o2rDYk51-3yojlfOjKUiPR2l4LvS_itrauaBRfNQcVGAa09AZ4TAvf&_nc_ohc=GL5VLvt9mOcQ7kNvwErRV7s&_nc_oc=AdknylF4C9E2StuctIIV5yCcPmBuUGNXh5THcrJRKSQtpmY4PVR4GDP4iqIGqAga-qYadYV5pUa8mpjje-K8O0b7&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=yAC0Asq-zFBcKe79_XG84A&oh=00_AfmVrXU_fC9MvxpqUkJ_DLHCCjlL4DosrqeaPE0WbgcWwg&oe=693C0BBE",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/492005643_716963337517931_4130308983468400647_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGsZ035laDosyMfoWadnx6ruhOOLFT7FzC6E44sVPsXMHFIxPhS1c6pcdddYj71GnWehtxtPBckZ6gR0Izu50yi&_nc_ohc=novc0tqr0bwQ7kNvwFjT48f&_nc_oc=AdmBKO0zRRZv8mQbh5pjTov3YKWJCeYDjNs6XipTfzMwQ0XzQ-V_DH7ON_j59Um2SngLH3KVTI9VBje26JYsIODT&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=gT1jpD0N419x9_E94_xySA&oh=00_AfnpVLBmazfKcgHd4_uaPgeaGpXBZ0gHiQH18hMyAiwZcQ&oe=693C175E",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/481510994_683018360912429_2259457484289900981_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEKxQFERPnJHrHJJn3D2jG-Rq0ohZ2sd9JGrSiFnax30qwp_IyNiVKqmCd4iB6gfUovn8eIFMDONsJKlHvKCXfM&_nc_ohc=QtCPtoqRIzcQ7kNvwEa8dvd&_nc_oc=Adn-JbDr_TgfInzsNIe9o4_HOP4J1Ideq0XDnfKu6vDnRC6msaAN_YxqB6whiKa42F3fV7bk9ZJDtaLtGZypBItp&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=eVRgmbE1Tcr7j7xSawIAug&oh=00_AfkH7kcHmXttg35C_iSN47kzWeRjc7bFtXGzFrArXstyiA&oe=693C3045",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/491058981_716261540921444_5577408955101849797_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGkk9mptFeVgu4r3kNGADBpZjTp8zDjpOVmNOnzMOOk5S5Esjey6Etmv6XPO2PovcP-ElzWLGEfiTvCNyXp6UGD&_nc_ohc=lUdCpv3AoZUQ7kNvwGxuzKO&_nc_oc=AdkT4E5igopbzZ0-vNiHejbyg14gV6VF2F-9hYpxaxUKyxxVjVlndJQXLQ3_hMyGa0UKyES6dZge2p4ZlSjaKSVL&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=5C8rbFbfTLYjkpe0N_fnrQ&oh=00_AfmNLzgwkiUddAny63hXLaLQGn98X3WYTxzNzJXNPnBXsw&oe=693C009F",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/475447276_621542930371044_653321439013061691_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEG5nLoZ0p97BZtqygKbvbM3Uh0n8VB0W_dSHSfxUHRb5ntWtvXL7sjGxE4ntK_lyFZGuzKUIndO0mltwa7B3UX&_nc_ohc=oyB-8rQDSo8Q7kNvwF394lZ&_nc_oc=Adno6vN5r8MIKp2QVA5gbHbIMgy-GBse9-vvLFnNNOxC7WaiLektikzJgDfbzmj5UTGeSfMSQBoKN5LK50vqc-fp&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=IFVbqczIIENUp_qODr1ZWg&oh=00_Afl-HGYNN-CpsKCgya5tObDZxEalf5OpEd5DPQt4c11-dA&oe=693BFD0D",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/475772186_621550380370299_5871532636348375883_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeF_-TtHvB5FlH3vZey8bgdiKdDJK1-Q2GMp0MkrX5DYY5NBBmCqTv1LlfoxL_ufZV4HOyNje08RiuReUl5pu8a3&_nc_ohc=KjM9PIl7aFoQ7kNvwGrWDun&_nc_oc=Admbgmd9qNXi7nHb5Y3I8CUomoqwFcaRzpOM97NFtE71dlkDWDZC8Nwz7F4jHdgZM_g3TZc1V0IlIWwDzf1HGptd&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=HUujIhb4ardXfKMs9GiJfw&oh=00_Afk7x7lXtKWjBERgjOU2esGaTVCs4yXF5zz-GOgh6Okh4Q&oe=693C01EC",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/474693630_615212927670711_6131228019885634988_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHBxOwJO6UTWTpavcyT1JS5UvKwfAMWOh1S8rB8AxY6HfjpB583MdYkGi7iJpAJUuOnzaCQRx5m5JF7jIqG4E7m&_nc_ohc=I7KHX7laJOgQ7kNvwE64XZD&_nc_oc=AdlMvCoyyEey2yrXPlfEhFvT1OT5ErO3NoINSvB0-W7S8U5IY7nglMyca3vS5lsLL0O1fOcV_meEQZ84Rn_S2wY7&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=XkW0jexdIZjD1UdZP54ZJg&oh=00_Afm7igFBBilhnIIK19UkdNc6jGNRIYD1AYXHTuUeFf6IGw&oe=693BFD6A",
  ];

  const handleContactSubmit = (values: any) => {
    console.log("Contact form:", values);
  };

  return (
    <Layout className='homepage'>
      {/* ===== HEADER ===== */}
      <Header className='homepage__header'>
        <div className='homepage__logo' onClick={() => navigate("/")}>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          items={menuitems}
        />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='homepage__content'>
        {/* HERO BANNER */}
        <section
          className='hero-banner'
          style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className='hero-banner__overlay' />
          <div className='hero-banner__content'>
            <p className='hero-banner__tag'>PHAN COFFEE ROASTERS</p>
            <h1 className='hero-banner__title'>
              EXPERIMENTAL VIETNAMESE COFFEE
            </h1>
            <p className='hero-banner__subtitle'>
              Single-origin beans & experimental roasting from the Central
              Highlands of Vietnam. Bold, clean and naturally sweet.
            </p>
            <div className='hero-banner__actions'>
              <Button
                type='primary'
                size='large'
                className='hero-btn hero-btn--primary'
                onClick={() => navigate("/products")}>
                Shop now
              </Button>
              <Button
                size='large'
                className='hero-btn hero-btn--ghost'
                onClick={() => navigate("/")}>
                Our story
              </Button>
            </div>
            <div className='hero-banner__stores'>
              <span>Available on</span>
              <img src='/icons/shopee.svg' alt='Shopee' />
              <img src='/icons/lazada.svg' alt='Lazada' />
              <img src='/icons/tiktokshop.svg' alt='TikTok Shop' />
            </div>
          </div>
        </section>

        {/* INFO STRIP */}
        <section className='homepage__intro-strip'>
          <div className='intro-item'>
            <h4>ROASTED IN KONTUM</h4>
            <p>86 Lâm Tùng, xã Ia Chim, Tp. Kon Tum</p>
          </div>
          <div className='intro-item'>
            <h4>EXPERIMENTAL ROASTS</h4>
            <p>Single–origin, honey & natural processed coffees.</p>
          </div>
          <div className='intro-item'>
            <h4>WORLDWIDE SHIPPING</h4>
            <p>From the Central Highlands to your cup.</p>
          </div>
        </section>

        {/* BEST SELLERS / PRODUCT CARDS */}
        <section className='homepage__services'>
          <h2 className='section-title'>Best Sellers</h2>
          <p className='section-subtitle'>
            Signature coffees carefully roasted by Phan Coffee for both filter
            and espresso.
          </p>

          <div className='homepage__services-grid'>
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                hoverable
                className='product-card'
                cover={
                  <Carousel autoplay>
                    <div>
                      <img
                        className='img-banner'
                        alt='Robusta 1'
                        src={bannerrobusta}
                      />
                    </div>
                    <div>
                      <img
                        className='img-banner'
                        alt='Robusta 2'
                        src={bannerarabica}
                      />
                    </div>
                    <div>
                      <img
                        className='img-banner'
                        alt='Robusta 3'
                        src={bannerhoney}
                      />
                    </div>
                  </Carousel>
                }>
                <Meta
                  title='MANG DEN BLEND'
                  description={
                    item === 1
                      ? "Blend of Robusta & Arabica from Mang Den – clean sweetness, perfect for milk-based drinks."
                      : "100% arabica & robusta from the Central Highlands, medium roast, suitable for both filter & espresso."
                  }
                />
                <div className='product-card__footer'>
                  <span className='product-card__price'>đ180.000</span>
                  <Button
                    type='primary'
                    size='small'
                    onClick={() => navigate("/products")}>
                    Add to cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ABOUT US */}
        <section className='about-us'>
          <div className='about-container'>
            <div className='about-text'>
              <h2>About Phan Coffee</h2>
              <p>
                When you hold a cup of coffee from Phan Coffee, you don&apos;t
                just receive a product – you receive the passion we put into
                every roast. We source beans from the Central Highlands and
                roast in small batches to keep flavors vibrant and clean.
              </p>
              <p>
                Thank you to everyone who has shared honest feedback with us.
                Every review helps us refine our craft and brings us closer to
                your perfect cup.
              </p>
              <p>☕ PHAN COFFEE ROASTERS – Mang Den, Kon Tum.</p>

              <Button
                type='default'
                size='large'
                className='read-more'
                onClick={() => navigate("/about")}>
                Read more
              </Button>
            </div>

            <div className='about-image'>
              <img src={aboutImage} alt='About Phan Coffee' />
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className='gallery-section'>
          <div className='gallery-header'>
            <h2>Phan Coffee Moments</h2>
            <p>
              A glimpse into our roastery, our café and the community that
              surrounds Phan Coffee. Each shot is a moment shared over coffee.
            </p>
          </div>

          <div className='gallery-grid'>
            {galleryImages.map((img, idx) => (
              <Card
                key={idx}
                cover={<img alt={`gallery-${idx}`} src={img} />}
                className='gallery-card'
              />
            ))}
          </div>

          <div className='gallery-footer'>
            <Button type='default' className='see-more-btn'>
              See more on Facebook
            </Button>
          </div>
        </section>

        {/* EXTRA BANNER */}
        <BannerCarousel />

        {/* CONTACT SECTION */}
        <section className='homepage__contact-section' id='contact'>
          <div className='homepage__contact-container'>
            {/* Form bên trái */}
            <div className='contact-card contact-card--form'>
              <div className='contact-form-inner'>
                <h3 className='contact-title'>Liên hệ Phan Coffee</h3>
                <p className='contact-subtitle'>
                  Hãy để lại thông tin, chúng tôi sẽ liên hệ lại sớm nhất có
                  thể.
                </p>

                <Form
                  id='contact-form'
                  layout='vertical'
                  form={contactForm}
                  className='contact-form'
                  onFinish={handleContactSubmit}>
                  <Form.Item
                    label='Name'
                    name='name'
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}>
                    <Input placeholder='Nhập tên của bạn' />
                  </Form.Item>

                  <Form.Item
                    label='Email'
                    name='email'
                    rules={[{ type: "email", message: "Email không hợp lệ" }]}>
                    <Input
                      prefix={<MailOutlined />}
                      placeholder='you@example.com'
                    />
                  </Form.Item>

                  <Form.Item label='Phone Number' name='phone'>
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder='(+84) 123 456 789'
                    />
                  </Form.Item>

                  <Form.Item label='Message' name='message'>
                    <Input.TextArea
                      placeholder='Lời nhắn của bạn...'
                      rows={4}
                    />
                  </Form.Item>
                </Form>

                <div className='contact-actions'>
                  <Button
                    type='primary'
                    htmlType='submit'
                    form='contact-form'
                    className='contact-btn contact-btn--primary'>
                    Gửi
                  </Button>
                  <a
                    className='contact-btn contact-btn--outline'
                    href='https://maps.app.goo.gl/GTY4E8aFStkpMK81A'
                    target='_blank'
                    rel='noopener noreferrer'>
                    Chỉ đường
                  </a>
                </div>
              </div>
            </div>

            {/* Map bên phải */}
            <div className='contact-card contact-card--map'>
              <h3 className='contact-map-title'>Phan Coffee Roasters</h3>
              <div className='contact-map-address'>
                <EnvironmentOutlined />
                <span>86 Lâm Tùng, xã Ia Chim, Tp. Kon Tum, Kon Tum</span>
              </div>

              <div className='contact-map-wrapper'>
                <iframe
                  title='Phan Coffee Roasters Map'
                  src='https://www.google.com/maps?q=86%20L%C3%A2m%20T%C3%B9ng%2C%20Ia%20Chim%2C%20Kon%20Tum&output=embed'
                  loading='lazy'
                />
              </div>

              <p className='contact-map-note'>
                Mở Google Maps để xem đường đi chi tiết, thời gian di chuyển và
                gợi ý tuyến đường phù hợp.
              </p>
            </div>
          </div>
        </section>
      </Content>

      {/* FOOTER */}
      <FooterPage />
    </Layout>
  );
};

export default HomePage;
