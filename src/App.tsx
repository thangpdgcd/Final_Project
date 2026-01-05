import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../src/styles/App.scss";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";
import RegisterPage from "./components/register";
import ProductList from "./pages/customers/products";
import Userprofile from "./pages/customers/profiles";
import About from "./pages/customers/abouts";
import Contact from "./pages/customers/contact";
import OrderDetail from "./pages/customers/orders";
import PageCart from "./pages/customers/cart";
import SystemPage from "./pages/systems/pages/SystemPage";

import ProductDetailPage from "./pages/customers/product_details";
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang Home */}
        <Route path='/' element={<HomePage />} />

        {/* Trang Login */}
        <Route path='/login' element={<LoginPage />} />
        {/* Trang Register */}
        <Route path='/register' element={<RegisterPage />} />
        {/* Trang Products */}
        <Route path='/products' element={<ProductList />} />
        {/* Trang Orders */}

        <Route path='/products/:id' element={<ProductDetailPage />} />

        <Route path='/profiles/:userid' element={<Userprofile />} />

        <Route path='/about' element={<About />} />

        <Route path='/categories' element={<About />} />

        <Route path='/contacts' element={<Contact />} />
        <Route path='/orders' element={<OrderDetail />} />
        <Route path='/carts' element={<PageCart />} />
        <Route path='/system' element={<SystemPage />} />
      </Routes>
    </Router>
  );
};

export default App;
