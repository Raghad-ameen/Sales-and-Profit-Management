import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // يراقب تغيير الصفحة
  const [hasToken, setHasToken] = useState(false);

  // تحديث الحالة في كل مرة نغير فيها الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setHasToken(!!token);
  }, [location]); // سيعمل الكود فور الانتقال من صفحة Login إلى Dashboard

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setHasToken(false);
    navigate('/login');
    window.location.reload(); // ضمان تصفير كل شيء للتسليم
  };

  return (
    <nav className="navbar">
      <div className="links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}> الرئيسية </NavLink>
        
        {/* لوحة التحكم تظهر دائماً */}
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}> لوحة التحكم </NavLink>

        {hasToken ? (
          <>
            {/* روابط بعد الدخول */}
            <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}> إدارة المنتجات </NavLink>
            <NavLink to="/suppliers" className={({ isActive }) => (isActive ? "active" : "")}> الموردين </NavLink>
            <button onClick={handleLogout} className="logout-btn">خروج</button>
          </>
        ) : (
          <>
            {/* روابط قبل الدخول */}
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}> تسجيل الدخول </NavLink>
            <NavLink to="/signup" className={({ isActive }) => (isActive ? "active" : "")}> إنشاء حساب </NavLink>
          </>
        )}

        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}> الإعدادات </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;