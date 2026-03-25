import Userprofile from "../pages/ProfilePage";
import OrderDetail from "../pages/customers/orders/orders";
import PageCart from "../pages/customers/cart/cart"
import PaymentPage from "../pages/customers/payment";
import OrdersPageHistory from "../pages/customers/history_orders/history_orders";


import { AppRoute } from "./route.type";

const privateRoutes: AppRoute[] = [
  { path: "/profiles/:userid", element: <Userprofile /> },
  { path: "/orders", element: <OrderDetail /> },
  { path: "/orders-details", element: <OrderDetail /> },
  { path: "/carts", element: <PageCart /> },
  { path: "/paypal/config", element: <PaymentPage /> },
  { path: "/history-orders", element: <OrdersPageHistory /> },
];

export default privateRoutes;
