import React from "react";
import { Layout, Menu, Button, Card, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/img/logo_PhanCoffee.jpg";
import bannerImage from "../../../assets/img/backgroud_PhanCoffee.png";
import bannerrobusta from "../../../assets/img/robustaphancoffee.png";
import bannerarabica from "../../../assets/img/arabicaphancofffee.png";
import bannerhoney from "../../../assets/img/caphehoneyphancoffee.png";
import "./index.scss";
import aboutImage from "../../../assets/img/robustakontum.jpg";

const { Header, Content, Footer } = Layout;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const menuRoutes: Record<string, string> = {
    home: "/",
    products: "/products",
    contact: "/contact",
    login: "/login",
    about: "/about",
  };

  const handleMenuClick = (e: { key: string }) => {
    const path = menuRoutes[e.key];
    if (path) navigate(path);
  };

  // 📌 Hình ảnh gallery
  const galleryImages: string[] = [
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/514357309_792471066633824_1084889073239955186_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeG5d9oHb9m4Kqm8OWoMcjY_28RPAnMg-PzbxE8CcyD4_F20C958erk3fXa5YmVN9ZJxGrV8uwuwU4z24y0wwYhw&_nc_ohc=Ln9mi3WitigQ7kNvwFpt2dK&_nc_oc=AdmsyoPh7wfqumtTX2-ZrhguIdEdoFWkgP_HVdurwkIENMiluAGHzdwvsyJB15TjkdwAO5wGgDC2bj3YAeTJdhYG&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=bFRrV_Gw9Rk4-uPmkLG73g&oh=00_Afb7kBdt5HxdZXxD9bDSVC7E54N-fJaaAZtF2abXnvueqg&oe=68D7749C",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/485144388_696963506184581_8177906150215252834_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHZT7ROiKb7BhkxwLLanAioSAQLMj___1hIBAsyP___WH3BNZ0Ap_wtCHFbFCKYALWWB7Wp2fXTDZLs12Xwfe2L&_nc_ohc=_GrreFXfP6gQ7kNvwGuFiVe&_nc_oc=AdmPmEYAph9vwlvSkkep7UvKNWCIy10rfLsp3Rp33388-tYN24ZSxdTaCuJW7gE_8uqFbBE7JNm13LlZKYjqINhl&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=v0DdGuJ2hUmNXxxDgto7vQ&oh=00_AfZcw79lX7RjH4uGVnQoWVwGtraFyqZKGNTFGlWjOOdX8A&oe=68D79686",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/485279782_695975656283366_2260645432310935248_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeFby_BUIYvwC92acLfNy_lINqw2JOdft8o2rDYk51-3yojlfOjKUiPR2l4LvS_itrauaBRfNQcVGAa09AZ4TAvf&_nc_ohc=5IOGlO3NGr8Q7kNvwFHhcld&_nc_oc=AdkhbEFYKBdR2-y3WrWzbBRAdabUqbYBaNJ5gXKhN70lMSeFLjgWgcaBzqApUFKHiDC6XaeMbCGkQTgd0UBVHqrl&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=lxlq46_EZHATOFMdx2bLGQ&oh=00_AfZiJ7hBHkle10xfGgoOMYADo9t3ur4H9r_ErLu4B4MjZw&oe=68D7A17E",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/492005643_716963337517931_4130308983468400647_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGsZ035laDosyMfoWadnx6ruhOOLFT7FzC6E44sVPsXMHFIxPhS1c6pcdddYj71GnWehtxtPBckZ6gR0Izu50yi&_nc_ohc=z7UFq9Rbs9sQ7kNvwHTRV4L&_nc_oc=Adn4uDsvPaR-YVenmg6pXMkM3Rv-_SFP7DY474B_PPRoZRI4RzjknQzHkKoalUbSF532BkVQMk2vKunxMkYDnQg2&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=WzMqOTC0DiDP3wwhDHL1oA&oh=00_AfYLNeO94y6cShXw9mejQncSkNM5gPjeZX-cl0PhdiSDmQ&oe=68D774DE",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/484429099_687956943751904_5732941882958382120_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHswWVKgEIsBt3LXfai5AF7XVK_LNP8tRJdUr8s0_y1EhIzkw5hTJ-ecR7q-ec4cSrPD46oJH9eFQWCdDStxJLl&_nc_ohc=3na9j5zx7roQ7kNvwF9h28A&_nc_oc=AdnUdl8cua2BNv6wf3PecGrJovEuEKxJUgiJ1Pgnl4BoPdc5Wvlr5LPUlU5wShIvsPiBBojdI90so4hUxXB9L9L1&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=AcBaQl2hDJiabLilhsH3xg&oh=00_Afa3xpvQV6mZqrruGTI6jPoa4De5Pg5jNPzJQQTruwm8Aw&oe=68D7985F",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/481510994_683018360912429_2259457484289900981_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEKxQFERPnJHrHJJn3D2jG-Rq0ohZ2sd9JGrSiFnax30qwp_IyNiVKqmCd4iB6gfUovn8eIFMDONsJKlHvKCXfM&_nc_ohc=CG-THP4holwQ7kNvwGdupA0&_nc_oc=Adk0SPU3UHbldl0jwc7rT5zoxASdOgoCl0WUZ0PabLgjza7FtgAdC4nYopR07GJXuRWojNB7xI8Wq3AlvufQe04L&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=fmnlb3KV3mQkcdRn3gJKPw&oh=00_AfYiFynTCjiXb3XrAVFS5W-vAroBkanUMPw0Pp7vCEXSoA&oe=68D78DC5",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/474461012_613126051212732_5762121008411865013_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGF-1-F1VFmJkWYL2bWOQPeZt5tcgsVBNhm3m1yCxUE2LhwMPGzY-isHHHUcY_D_hkzw2hgGtt3Hy89KCviy6Fu&_nc_ohc=kIuKcU4ewKAQ7kNvwGbx7Iw&_nc_oc=AdnmyRxEDtIA3gsrBL61GVDQwF4zGdHGiNkSFuGZb6G1IAjH3UngPTPFFHW5qp9dE2ry88U-qnUslITsA6hSYL4m&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=kbO01xlryizA33E41Q6gHw&oh=00_AfYQyBRHk_L81CCwyvTAiJ9B-zLgVzG1uGd0pY-2gwe-sA&oe=68D785AB",
    "https://scontent.fdad3-3.fna.fbcdn.net/v/t39.30808-6/508591929_767936225753975_3134276320481414280_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeH8cc6wyjyQ9V7kbsIqUqRqEQ413HeUdrIRDjXcd5R2simDKCktlG0VB84pSFZnCuV19LG6EXM9MIZ7nVdTosdj&_nc_ohc=giKmV2B4RVMQ7kNvwGrHN3P&_nc_oc=AdnHFY5Zn0zQK5zT3CcQ7-f2XtZJoSpcoavuBf3JB0fmLEF0XFNb6BdZ7PQRlCA9xdnGNO_O541sZ3_iWNJdWhca&_nc_zt=23&_nc_ht=scontent.fdad3-3.fna&_nc_gid=OEaf-Rt2h4dBVOViHewLVg&oh=00_AfYPODd-lV_PpoGUtJJhUXs9G51LDNMzFuPnqHgfAB6fcg&oe=68D76E8B",
  ];

  return (
    <Layout className='homepage '>
      {/* ===== HEADER ===== */}
      <Header className='homepage__header'>
        <div className='homepage__logo'>
          <img src={logo} alt='Phan Coffee' />
          <span className='logo-phancoffee'>Phan Coffee</span>
        </div>

        <Menu
          mode='horizontal'
          overflowedIndicator={false}
          onClick={handleMenuClick}
          className='menu-home'
          items={[
            { key: "home", label: "Home" },
            { key: "products", label: "Coffee" },
            { key: "contact", label: "Contact" },
            { key: "about", label: "About" },
            { key: "login", label: "Log In" },
          ]}
        />
      </Header>

      {/* ===== CONTENT ===== */}
      <Content className='homepage__content'>
        {/* Hero Section */}
        <Carousel
          autoplay
          className='homepage__hero'
          style={{ backgroundImage: `url(${bannerImage})` }}></Carousel>

        {/* Services Section */}
        <div className='homepage__services'>
          <div className='homepage__services-grid'>
            <Card
              hoverable
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
              {" "}
              <Meta
                title='ROBUSTA MĂNG ĐEN'
                description='Cà phê MĂNG ĐEN BLEND Robusta & Arabica nguyên chất rang mộc đắng dịu thơm nồng pha phin, pha máy - Phan Coffee'
              />
            </Card>
            <Card
              hoverable
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
              {" "}
              <Meta
                title='ROBUSTA MĂNG ĐEN'
                description='Cà phê MĂNG ĐEN BLEND Robusta & Arabica nguyên chất rang mộc đắng dịu thơm nồng pha phin, pha máy - Phan Coffee'
              />
            </Card>
            <Card
              hoverable
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
              {" "}
              <Meta
                title='ROBUSTA MĂNG ĐEN'
                description='Cà phê MĂNG ĐEN BLEND Robusta & Arabica nguyên chất rang mộc đắng dịu thơm nồng pha phin, pha máy - Phan Coffee'
              />
            </Card>
          </div>
        </div>
        <div>
          <section className='about-us'>
            <div className='about-container'>
              {/* Left text */}
              <div className='about-text'>
                <h2>ABOUT US</h2>
                <p>
                  Khi bạn cầm ly cà phê của Phan Coffee, bạn không chỉ nhận một
                  sản phẩm – mà kèm theo đó là tâm huyết mà chúng mình đã gửi
                  gắm vào đó. Cảm ơn những người đồng hành, những người đã chia
                  sẻ và những lời đánh giá thật lòng từ bạn. Mỗi đánh giá là một
                  viên gạch xây dựng niềm tin, là động lực để chúng mình tiếp
                  tục phát triển. Have a nice day ❤️
                </p>
                <p>
                  ☕ PHAN COFFEE ROASTERS 📍 86 Lâm Tùng, xã Iachim, Kon Tum
                </p>
                <Button type='default' size='large' className='read-more'>
                  Read More
                </Button>
              </div>

              {/* Right image */}
              <div className='about-image'>
                <img src={aboutImage} alt='About Coffee' />
              </div>
            </div>
          </section>
        </div>

        {/* ===== GALLERY SECTION (THÊM MỚI) ===== */}
        <section className='gallery-section'>
          <div className='gallery-header'>
            <h2>Our Gallery</h2>
            <p>
              Lorem ipsum is simply dummy text of printing typesetting industry
              lorem Ipsum the industry’s standard dummy text ever since the
              1500s, when an unknown printer took a galley of type and scrambled
              it to make a type specimen book.
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
              See More
            </Button>
          </div>
        </section>
      </Content>

      {/* ===== FOOTER ===== */}
      <Footer className='homepage__footer text-cyan-700 bg-amber-200'>
        © {new Date().getFullYear()} CoffeeShop. All rights reserved.
      </Footer>
    </Layout>
  );
};

export default HomePage;
