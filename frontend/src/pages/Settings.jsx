import React, { useState, useEffect } from 'react';
import './SettingsList.css'; 
import Swal from 'sweetalert2';
import api from '../api'; 
import { useNavigate, NavLink } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
const [username, setUsername] = useState(localStorage.getItem('username') || sessionStorage.getItem('username') || '');
const [displayName, setDisplayName] = useState(localStorage.getItem('username') || sessionStorage.getItem('username') || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode-active');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode-active');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    sessionStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        Swal.fire('خطأ', 'كلمة المرور الجديدة غير متطابقة', 'error');
        return;
    }

    try {
        await api.post('change-password/', {
            old_password: oldPassword,
            new_password: newPassword,
            new_username: username 
        });

        // التحديث في كل أماكن التخزين لضمان ظهور الاسم في كل الصفحات
        if (localStorage.getItem('username')) localStorage.setItem('username', username);
        if (sessionStorage.getItem('username')) sessionStorage.setItem('username', username);
        
        setDisplayName(username);
        
        // إطلاق الحدث لتنبيه الصفحات المفتوحة
        window.dispatchEvent(new Event("storage"));

        Swal.fire('نجاح', 'تم تحديث البيانات بنجاح', 'success');
        
        // تصفير حقول الباسوورد بعد النجاح لأمان المستخدم
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
    } catch (err) {
        Swal.fire('فشل', 'تأكد من صحة كلمة المرور القديمة', 'error');
    }
  };

  return (
    <div className="products-container"> {/* الحاوية الكبرى الموحدة */}
      <aside className="sidebar">
        <div className="sidebar-card store-info">
          <div style={{ 
            width: '50px', height: '50px', backgroundColor: '#44ACFF', 
            color: 'white', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            marginBottom: '10px', fontWeight: 'bold'
          }}>
            {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
          </div>
          <h3>{displayName}</h3>
        </div>
        <nav className="sidebar-card menu-nav">
          <NavLink to="/dashboard" end>الرئيسية</NavLink>
          <NavLink to="/products">إدارة المنتجات</NavLink>
                    <NavLink to="/sales">إدارة المبيعات</NavLink> 
          
          <NavLink to="/suppliers">الموردين</NavLink>
          <NavLink to="/reports">التقارير المالية</NavLink>
          <NavLink to="/settings">الإعدادات</NavLink>
        </nav>
        <div className="sidebar-card logout-section">
          <button onClick={handleLogout} className="logout-btn-card" style={{fontFamily:'Cairo'}}>تسجيل الخروج</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="settings-card">
          <h2 className="settings-title">إعدادات الحساب والمظهر</h2>
          
          <form onSubmit={handleUpdate} className="settings-body">
            <div className="form-group">
              <label>اسم المستخدم</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="custom-input" />
            </div>
            
            <div className="form-group">
              <label>كلمة المرور الحالية</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="custom-input" required />
            </div>
            
            <div className="form-row">
               <div className="form-group">
                  <label>كلمة المرور الجديدة</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="custom-input" />
               </div>
               <div className="form-group">
                  <label>تأكيد كلمة المرور الجديدة</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="custom-input" />
               </div>
            </div>
            
            <div className="btn-container">
              <button type="submit" className="save-changes-btn">حفظ التغييرات</button>
            </div>
          </form>

          <hr className="divider" />
          
          <div className="settings-section">
            <h3>مظهر النظام</h3>
            <div className="dark-mode-toggle">
              <span className={`mode-status ${isDarkMode ? 'active-text' : 'active-text-off'}`}>
                  الوضع الليلي: {isDarkMode ? 'مفعل' : 'معطل'}
              </span>
              <label className="switch">
                  <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
                  <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="back-btn-container">
            <button onClick={() => navigate('/dashboard')} className="back-btn">العودة للرئيسية</button>
        </div>
        <div style={{ minHeight: '150px', width: '100%' }}></div>
      </main>
    </div>
  );
};

export default Settings;