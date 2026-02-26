import RegisterPage from "../components/auth/register";
import { AppRoute } from "./route.type";
import HomePage from "../pages/customers/homes";
import LoginPage from "../components/auth/login";
import ProductList from "../pages/customers/products";
import ProductDetailPage from "../pages/customers/product_details";
import About from "../pages/customers/abouts";
import Contact from "../pages/customers/contact";
import SystemPage from "../pages/systems/pages/SystemPage";
import Userprofile from "../pages/customers/profiles";

const publicRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/products", element: <ProductList /> },
  { path: "/products/:id", element: <ProductDetailPage /> },
  { path: "/about", element: <About /> },
  { path: "/contacts", element: <Contact /> },
   { path: "/system", element: <SystemPage /> },
  { path: "/profiles/:userid", element: <Userprofile /> },

];                  
                        
export default publicRoutes;    