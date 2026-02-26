import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import "./styles/App.scss";
import { ThemeProvider, useTheme } from "./components/contexts/ThemeContext";

// guard
import PrivateRoutes from "./routes/PrivateRoutes";

// pages
import LoginPage from "./components/auth/login";
import RegisterPage from "./components/auth/register";

import HomePage from "./pages/customers/homes";
import ProductList from "./pages/customers/products";
import ProductDetailPage from "./pages/customers/product_details";
import About from "./pages/customers/abouts";
import Contact from "./pages/customers/contact";

import Userprofile from "./pages/customers/profiles";
import OrderDetail from "./pages/customers/orders";
import PageCart from "./pages/customers/cart";
import NotFound from "./pages/customers/not_found";
import SystemPage from "./pages/systems/pages/SystemPage";
const AppContent = () => {
  const { dark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Router>
        <Routes>

          {/* ===== PUBLIC ===== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/system" element={<SystemPage />} />
           <Route path="*" element={<NotFound />} />
           
          {/* ===== PRIVATE (BẮT LOGIN) ===== */}
          <Route element={<PrivateRoutes />}>
            {/*  required login */}
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/profiles/:userid" element={<Userprofile />} />
            <Route path="/carts" element={<PageCart />} />
            <Route path="/orders" element={<OrderDetail />} />
          </Route>

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
