import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../src/styles/App.scss";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";
import RegisterPage from "./components/register";
import ProductList from "./pages/customers/products";
import Userprofile from "./pages/customers/profiles";
import About from "./pages/customers/abouts";
import Contact from "./pages/contact";
import CustomerOrders from "./pages/customers/orders";
import CartPage from "./pages/cart";
import CartItems from "./pages/cartItem";
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

        <Route path='/profiles/:userid' element={<Userprofile />} />

        <Route path='/about' element={<About />} />

        <Route path='/categories' element={<About />} />

        <Route path='/contact' element={<Contact />} />
        <Route path='/order' element={<CustomerOrders />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/cart-item' element={<CartItems />} />
      </Routes>
    </Router>
  );
};

export default App;
