import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';
import './Dashboard.css';
import './SalesManagement.css';

const SalesManagement = () => {
    const navigate = useNavigate();
    const [salesDetails, setSalesDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [displayName, setDisplayName] = useState('');
    
    // إدارة حالة مدخلات الكمية لكل منتج بشكل منفصل
    const [saleQuantities, setSaleQuantities] = useState(() => {
        const saved = localStorage.getItem('persistentSaleQuantities');
        return saved ? JSON.parse(saved) : {};
    });

    // جلب البيانات من السيرفر
    const fetchSalesDetails = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await api.get('products/');
            setSalesDetails(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error("خطأ في جلب تفاصيل المبيعات", err);
            setIsLoading(false);
        }
    };

    // تنفيذ عملية البيع
    const handleSale = async (productId) => {
        const qty = saleQuantities[productId];
        if (!qty || qty <= 0) {
            Swal.fire({
                title: 'تنبيه',
                text: "يرجى إدخال كمية مباعة صحيحة",
                icon: 'info',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#44ACFF'
            });
            return;
        }

        try {
            await api.post('sales/', {
                product: productId,
                quantity: parseInt(qty)
            });

            Swal.fire({
                title: 'تم تسجيل البيع!',
                text: 'تم تحديث المخزون بنجاح.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // تصفير الحقل بعد النجاح
            setSaleQuantities(prev => ({ ...prev, [productId]: '' }));
            fetchSalesDetails(); // تحديث الجدول
        } catch (err) {
            Swal.fire({
                title: 'فشل التسجيل',
                text: "تأكد من توفر الكمية الكافية في المخزون",
                icon: 'error',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#e74c3c'
            });
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        sessionStorage.clear();
        
        navigate('/login');
        window.location.reload();
    };

    // حفظ الكميات المدخلة في الـ localStorage لضمان عدم ضياعها عند التحديث
    useEffect(() => {
        localStorage.setItem('persistentSaleQuantities', JSON.stringify(saleQuantities));
    }, [saleQuantities]);

     useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const name = localStorage.getItem('username') || sessionStorage.getItem('username');
    
        if (name) {
          setDisplayName(name);
        } else {
          setDisplayName('Unknown');
        }
    
        if (token) {
          fetchSalesDetails();
        } else {
          setIsLoading(false);
          navigate('/', { replace: true });
        }
      }, []); 

    if (isLoading) return <div className="loading">جاري تحميل تفاصيل المبيعات...</div>;

    return (
        <div className="dashboard-wrapper">
                <aside className="sidebar">
  {/* كرت معلومات المتجر */}
  <div className="sidebar-card store-info">
   <div className="user-avatar-container" style={{ 
                        width: '50px', height: '50px', backgroundColor: '#44ACFF', 
                        color: 'white', borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        marginBottom: '10px', fontWeight: 'bold'
                    }}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
    <h3>{displayName}</h3>
  </div>

  {/* قائمة الروابط - المنيو */}
  <nav className="sidebar-card menu-nav">
    <NavLink to="/dashboard" end>الرئيسية</NavLink>
    <NavLink to="/products">إدارة المنتجات</NavLink>
    <NavLink to="/sales">إدارة المبيعات</NavLink> 
    <NavLink to="/suppliers">الموردين</NavLink>
    <NavLink to="/reports">التقارير المالية</NavLink>
    <NavLink to="/settings">الإعدادات</NavLink>
  </nav>

  {/* قسم تسجيل الخروج */}
  <div className="sidebar-card logout-section">
    <button onClick={handleLogout} className="logout-btn-card">تسجيل الخروج</button>
  </div>
</aside>
            <main className="main-content" style={{ padding: '20px' }}>
                <header className="content-header">
                    <h2 style={{ 
                        fontFamily: 'Cairo', 
                        marginTop: '40px', 
                        marginBottom: '20px',
                        borderRight: '5px solid #44ACFF',
                        paddingRight: '15px'
                    }}>
                        تفاصيل المبيعات وإدارة العمليات
                    </h2>
                </header>

                <section className="details-section">
                    <div className="table-card shadow-sm">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>اسم المنتج</th>
                                    <th>الكمية المراد بيعها</th>
                                    <th>إجمالي مبيعات الصنف</th>
                                    <th>المخزون الحالي</th>
                                    <th>العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesDetails.length > 0 ? (
                                    salesDetails.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: '600' }}>{item.name}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="sale-input-field"
                                                    placeholder="0"
                                                    value={saleQuantities[String(item.id)] || ''} 
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setSaleQuantities(prev => ({
                                                            ...prev,
                                                            [String(item.id)]: val
                                                        }));
                                                    }}
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '35px',
                                                        textAlign: 'center', 
                                                        margin: '0 auto', 
                                                        display: 'block', 
                                                        border: '1px solid #e0e0e0', 
                                                        borderRadius: '8px',
                                                        fontFamily: 'Cairo'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ color: '#27ae60', fontWeight: 'bold' }}>
                                                {(item.total_revenue || 0).toLocaleString()} {item.currency}
                                            </td>
                                            <td style={{ 
                                                color: (item.stock ?? item.current_stock ?? 0) < 5 ? '#e74c3c' : '#2c3e50', 
                                                fontWeight: 'bold' 
                                            }}>
                                                {item.stock ?? item.current_stock ?? 0} قطعة
                                            </td>
                                            <td>
                                                <button 
                                                    onClick={() => handleSale(item.id)} 
                                                    className="save-sale-btn"
                                                    style={{
                                                        backgroundColor: '#44ACFF',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 15px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontFamily: 'Cairo'
                                                    }}
                                                >
                                                    تسجيل بيع
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                            لا توجد منتجات متوفرة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SalesManagement;