import RegisterPage from "../components/auth/register";
import { AppRoute } from "./route.type";
import HomePage from "../pages/customers/homes/homes";
import LoginPage from "../components/auth/login";
import ProductList from "../pages/customers/products/products";
import ProductDetailPage from "../pages/customers/product_details/product_details";
import About from "../pages/customers/abouts/abouts";
import Contact from "../pages/customers/contact/contact";

import Userprofile from "../pages/customers/profiles/profiles";

const publicRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/products", element: <ProductList /> },
  { path: "/products/:id", element: <ProductDetailPage /> },
  { path: "/about", element: <About /> },
  { path: "/contacts", element: <Contact /> },
  { path: "/profiles/:userid", element: <Userprofile /> },


];

export default publicRoutes;    