import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp'; 
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/ProductsList'; 
import Suppliers from './components/Suppliers'; 
import Settings from './pages/Settings';
import NavigationArrows from './components/NavigationArrows.jsx';
import Reports from './pages/Reports.jsx';
import SalesManagement from './pages/SalesManagement.jsx'

function AuthHandler({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const publicPaths = ['/login', '/signup'];
    
    if (token && publicPaths.includes(location.pathname)) {
      navigate('/dashboard');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode-active');
    } else {
      document.body.classList.remove('dark-mode-active');
    }
  }, [navigate, location]);

  return children;
}

// مكون التغليف الرئيسي: هنا نستخدم children بشكل صحيح
function LayoutWrapper({ children }) {
  const location = useLocation();
  // استثناء Home و Login و SignUp من السايد بار والأسهم
  const excludedPaths = ['/', '/login', '/signup'];
  const isExcluded = excludedPaths.includes(location.pathname);

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      {/* 1. السايد بار (اختياري - يظهر في الصفحات الداخلية فقط) */}
      {/* <Sidebar /> */} 

      <div className="main-viewport" style={{ flex: 1, backgroundColor: 'var(--body-bg, #f9f9f9)' }}>
        {/* 2. الهيدر الموحد والأسهم بلونك الجديد 44ACFF */}
        <header className="global-nav-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 20px', 
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
  <NavigationArrows />
  <span style={{ marginRight: '15px', fontFamily: 'Cairo', fontWeight: 'bold', color: '#888' }}>
    نظام إدارة المتجر
  </span>
</header>
        
        {/* 3. هنا يتم عرض محتوى الصفحة الحالية */}
        <div className="page-content" style={{ padding: '30px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const checkAuth = () => !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

  return (
    <Router>
      <AuthHandler>
        <LayoutWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route 
              path="/dashboard" 
              element={checkAuth() ? <Dashboard /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/products" 
              element={checkAuth() ? <ProductsList /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/suppliers" 
              element={checkAuth() ? <Suppliers /> : <Navigate to="/login" replace />} 
            />   
            <Route 
              path="/settings" 
              element={checkAuth() ? <Settings /> : <Navigate to="/login" replace />} 
            />

          <Route 
              path="/reports" 
              element={checkAuth() ? <Reports /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/sales" 
              element={checkAuth() ? <SalesManagement /> : <Navigate to="/login" replace />} 
            />

          </Routes>
        </LayoutWrapper>
      </AuthHandler>
    </Router>
  );
}

export default App;