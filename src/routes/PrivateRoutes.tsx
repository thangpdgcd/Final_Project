import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoutes = () => {
  const location = useLocation();

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location }}
        />
      );
    }
  } catch (error) {
    console.error("Error reading access token from localStorage:", error);
    return (
      <Navigate
        to="*"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoutes;
