import React from "react";
import logo from "./logo.svg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/login";
import HomePage from "./pages/customers/homes";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang Home */}
        <Route path='/' element={<HomePage />} />

        {/* Trang Login */}
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
