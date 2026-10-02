import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    store_name: '',
    store_type: ''
  });
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // منع الإرسال إذا كان هناك خطأ في طول الباسوورد
   if (formData.password.length < 8) return;

    try {
      const response = await api.post('register/', formData);
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        const userDisplayName = response.data.store_name || response.data.username || formData.store_name || formData.username;
        localStorage.setItem('username', userDisplayName);
        navigate('/dashboard'); 
      } else {
        navigate('/login'); 
      }
    } catch (error) {
      const serverErrors = error.response?.data;
      console.error("Signup Error:", serverErrors);

      if (error.response?.status === 400) {
        // فحص نوع الخطأ وعرضه كنص بدلاً من alert
        if (serverErrors?.username) {
          setError('اسم المستخدم موجود بالفعل، حاول اختيار اسم آخر.');
        } else if (serverErrors?.password) {
          setError('خطأ في كلمة المرور: ' + serverErrors.password[0]);
        } else {
          setError('بيانات غير صالحة، يرجى مراجعة المدخلات.');
        }
      } else {
        setError('حدث خطأ أثناء التسجيل. تأكد من أن السيرفر يعمل.');
      }
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });

    if (val.length > 0 && val.length < 8) {
      setPasswordError('يجب أن تكون كلمة المرور 8 رموز على الأقل');
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="login-container">
        <h2>إنشاء حساب متجر جديد</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="اسم المستخدم (للتسجيل)" 
            required 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            style={{fontFamily: "Cairo, sans-serif", fontSize: 14}}
          />

          <input 
            type="text" 
            placeholder="اسم المتجر" 
            required 
            value={formData.store_name}
            onChange={(e) => setFormData({...formData, store_name: e.target.value})}
            style={{fontFamily: "Cairo, sans-serif", fontSize: 14}}
          />

          <input 
            type="text" 
            placeholder="نوع النشاط" 
            required 
            value={formData.store_type}
            onChange={(e) => setFormData({...formData, store_type: e.target.value})}
            style={{fontFamily: "Cairo, sans-serif", fontSize: 14}}
          />

          <div className="password-group">
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              required 
              // ⬇️ التعديل المهم: ربطنا الدالة هنا
              onChange={handlePasswordChange}
              value={formData.password}
              className={passwordError ? 'input-error' : ''}
              style={{fontFamily: "Cairo, sans-serif", fontSize: 14, width: '100%'}}
            />
            {/* ⬇️ عرض رسالة الخطأ تحت الإدخال مباشرة */}
            {passwordError && (
              <p style={{color: 'red', fontSize: '12px', marginTop: '5px', textAlign: 'right'}}>
                {passwordError}
              </p>
            )}
          </div>

          {error && (
            <p style={{color: 'red', fontSize: '12px', marginTop: '5px', textAlign: 'right'}}>
              {error}
            </p>
          )}

          <button type="submit" style={{fontFamily: "Cairo, sans-serif", fontSize: 14, marginTop: '20px'}}>
            إنشاء الحساب
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;