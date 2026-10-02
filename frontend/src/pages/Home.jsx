import React from "react";
import { NavLink, Link } from "react-router-dom";

const Home = () => {
  // 1. التحقق من وجود التوكن في التخزين المحلي أو المؤقت
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  return (
    <div className="home-wrapper" style={{ fontFamily: "Cairo, sans-serif", minHeight: "100vh" }}>
      {/* شريط التنقل */}
      <nav>
        <div className="links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            الرئيسية
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => (isActive ? "active" : "")}>
            إدارة المخزون
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? "active" : "")}>
            التقارير المالية
          </NavLink>
        </div>
      </nav>

      {/* المحتوى الرئيسي */}
      <main style={{ textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ color: "#333" }}>نظام إدارة المنتجات والأرباح</h1>
        <p style={{ maxWidth: "600px", margin: "20px auto", color: "#555", lineHeight: "1.8" }}>
          منصتك المتكاملة لتتبع المبيعات، إدارة المخزون، وتحليل الأرباح بدقة متناهية من خلال واجهة ذكية مصممة لنمو تجارتك
        </p>
        
        <div className="buttons">
          {/* 2. منطق التبديل الديناميكي */}
          {token ? (
            <Link to="/dashboard" className="login" style={{ padding: "12px 30px", textDecoration: "none" ,cursor: 'pointer',fontFamily: "Cairo, sans-serif",fontSize:17 , backgroundColor:'#44ACFF', color:'#f9f9f9'}}>
              الانتقال إلى لوحة التحكم
            </Link>
          ) : (
            <>
              <Link to="/login" className="login">تسجيل الدخول</Link>
              <Link to="/signup" className="signup">إنشاء حساب جديد</Link>
            </>
          )}
        </div>
      </main>

      {/* الفوتر */}
      <footer>
        <div className="footer-content">
          <div>
            <h3>إدارة الأرباح الذكية</h3>
            <p>نظام متكامل يساعدك على مراقبة نمو تجارتك وتحليل بياناتك المالية بكل سهولة ودقة</p>
          </div>
          
          <div>
            <h3>روابط هامة</h3>
            <ul>
              <li><a href="#">إدارة الأرباح الذكية</a></li>
              <li><a href="#">نظام تتبع المبيعات</a></li>
              <li><a href="#">نظام إدارة المخزون</a></li>
            </ul>
          </div>
          <div>
            <h3>تواصل معنا</h3>
            <a href="mailto:support@protrack.com">support@protrack.com</a>
          </div>
        </div>
        <p>© 2026 ProTrack - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default Home;