import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../src/styles/App.scss";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";
import RegisterPage from "./components/register";
import ProductList from "./pages/customers/products";
import OrderList from "./pages/customers/orders";
import Userprofile from "./pages/customers/profiles";
import About from "./pages/customers/abouts";
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
        <Route path='/profiles/:userid' element={<Userprofile />} />

        <Route path='/about' element={<About />} />

        <Route path='/categories' element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;
