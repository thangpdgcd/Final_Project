import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";
import RegisterPage from "./components/register";
import ProductList from "./pages/customers/products";
import OrderList from "./pages/customers/orders";
import Profile from "./pages/customers/profiles";
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
        <Route path='/orders' element={<OrderList />} />

        <Route path='/profiles/:id' element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;
