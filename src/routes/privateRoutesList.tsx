import Userprofile from "../pages/customers/profiles";
import OrderDetail from "../pages/customers/orders";
import PageCart from "../pages/customers/cart";
import PaymentPage from "../pages/customers/payment";
import OrdersPageHistory from "../pages/customers/history_orders";
// import SystemPage from "../pages/systems/pages/SystemPage";
import { AppRoute } from "./route.type";

const privateRoutes: AppRoute[] = [
  { path: "/profiles/:userid", element: <Userprofile /> },
  { path: "/orders", element: <OrderDetail /> },
  { path: "/orders-details", element: <OrderDetail /> },
  { path: "/carts", element: <PageCart /> },
  { path: "/paypal/config", element: <PaymentPage /> },
  { path: "/history-orders", element: <OrdersPageHistory /> },
  // { path: "/system", element: <SystemPage /> },
];

export default privateRoutes;
