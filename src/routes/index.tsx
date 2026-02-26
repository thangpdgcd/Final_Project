import { Routes, Route } from "react-router-dom";
import publicRoutes from "./PublicRoutes";
import privateRoutes from "./privateRoutesList";
import PrivateGuard from "./PrivateGuard";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ===== PUBLIC ===== */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}

      {/* ===== PRIVATE ===== */}
      <Route element={<PrivateGuard />}>
        {privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>

    </Routes>
  );
};

export default AppRoutes;
