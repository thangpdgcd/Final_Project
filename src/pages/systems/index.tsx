// systems/index.tsx
import React from "react";
import { Link } from "react-router-dom";
const SystemHome = () => {
  return (
    <div className='system-home'>
      <h1>System Management</h1>
      <ul>
        <li>
          <Link to='/systems/user-manager'>User Manager</Link>
        </li>
        <li>
          <Link to='/systems/admin-manager'>Admin Manager</Link>
        </li>
        <li>
          <Link to='/systems/product-manager'>Product Manager</Link>
        </li>
        <li>
          <Link to='/systems/orders-manager'>Order Manager</Link>
        </li>
        <li>
          <Link to='/systems/categories-manager'>Category Settings</Link>
        </li>
      </ul>
    </div>
  );
};

export default SystemHome;
