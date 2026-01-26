import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import "../src/styles/App.scss";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";
import RegisterPage from "../src/components/register";
import ProductList from "./pages/customers/products";
import Userprofile from "./pages/customers/profiles";
import About from "./pages/customers/abouts";
import Contact from "./pages/customers/contact";
import OrderDetail from "./pages/customers/orders";
import PageCart from "./pages/customers/cart";
import SystemPage from "./pages/systems/pages/SystemPage";
import ProductDetailPage from "./pages/customers/product_details";
import PaymentPage from "./pages/customers/payment";
import OrdersPageHistory from "./pages/customers/history_orders";

const AppContent = () => {
  const { dark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/products' element={<ProductList />} />
          <Route path='/products/:id' element={<ProductDetailPage />} />
          <Route path='/profiles/:userid' element={<Userprofile />} />
          <Route path='/about' element={<About />} />
          <Route path='/categories' element={<About />} />
          <Route path='/contacts' element={<Contact />} />
          <Route path='/orders-details' element={<OrderDetail />} />
          <Route path='/orders' element={<OrderDetail />} />
          <Route path='/carts' element={<PageCart />} />
          <Route path='/system' element={<SystemPage />} />
          <Route path='/paypal/config' element={<PaymentPage />} />
          <Route path='/history-orders' element={<OrdersPageHistory />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
