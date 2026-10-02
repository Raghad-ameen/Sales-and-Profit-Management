import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // حالة خيار تذكرني
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // تصغير الأخطاء السابقة

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      // 1. تنظيف القديم
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      sessionStorage.clear();

const response = await api.post('token/', { username, password });      
      // 2. تحديد مكان التخزين
      const storage = rememberMe ? localStorage : sessionStorage;   
      
      storage.setItem('token', response.data.access); 
      storage.setItem('refresh_token', response.data.refresh);
      storage.setItem('username', username);

      // 3. الحل السحري: انتظر 100 ملي ثانية ثم وجه المستخدم للتأكد من الحفظ
      setTimeout(() => {
        window.location.href = '/dashboard'; 
      }, 100);

    } catch (error) {
      console.error("Login Error:", error);
      setError("خطأ في الدخول: تأكد من اسم المستخدم وكلمة المرور");
    }
};



  return (
    <div className="signup-page-wrapper">
      <div className="login-container">
      <h2>تسجيل الدخول للمتجر</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="اسم المستخدم" 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ width: '100%', marginBottom: '10px', padding: '8px' ,fontFamily: "Cairo, sans-serif",fontSize:14}}
        />
        <input 
          type="password" 
          placeholder="كلمة المرور" 
          minLength="8" 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ width: '100%', marginBottom: '10px', padding: '8px' ,fontFamily: "Cairo, sans-serif", fontSize:14}}
          required
       />

      {/* حاوية تذكرني: تبدأ من اليمين، المربع أولاً ثم النص بجانبه */}
<div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'flex-start', // يضمن الالتصاق بجهة اليمين في نظام RTL
  gap: '8px', 
  marginBottom: '15px', 
  width: '100%', 
  direction: 'rtl' // يحدد اتجاه العناصر من اليمين لليسار
}}>
  <input 
    type="checkbox" 
    id="remember" 
    checked={rememberMe} 
    onChange={(e) => setRememberMe(e.target.checked)} 
    style={{ cursor: 'pointer', width: '16px', height: '16px', margin: 0 }}
  />
  <label htmlFor="remember" style={{ fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
    تذكرني على هذا الجهاز
  </label>
</div>
       {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer',fontFamily: "Cairo, sans-serif",fontSize:17 }}>دخول</button>
      </form>
      <div style={{ marginTop: '15px', fontSize: '13px' }}>
  <span>ليس لديك حساب؟ </span>
  <Link to="/signup" style={{ color: '#2c3e50', fontWeight: 'bold', textDecoration: 'none' }}>
    إنشاء حساب جديد
  </Link>
</div>
      </div>
    </div>
  );
}

export default Login;