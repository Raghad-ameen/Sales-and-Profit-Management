import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink} from 'react-router-dom';
import api from '../api';
import './Dashboard.css';
import Swal from 'sweetalert2';
import NavigationArrows from '../components/NavigationArrows.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { Bold } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('main');
  const [saleQuantities, setSaleQuantities] = useState(() => {
    const saved = localStorage.getItem('persistentSaleQuantities');
    return saved ? JSON.parse(saved) : {};
  });
  const [salesDetails, setSalesDetails] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total_revenue: 0, total_profit: 0, low_stock_count: 0 });
  const [displayName, setDisplayName] = useState('');
  const [product, setProduct] = useState({
    name: '',
    cost_price: '',
    selling_price: '',
    stock: '',
    currency: 'ريال' 
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    sessionStorage.clear();
    
    navigate('/login');
    window.location.reload();
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      navigate('/login', { replace: true });
      return;
    }

    try {
      const res = await api.get('dashboard/');
      
      if (res.data.store_name || res.data.username) {
        const finalName = res.data.store_name || res.data.username;
        setDisplayName(finalName);
        if (localStorage.getItem('token')) {
          localStorage.setItem('username', finalName);
        } else {
          sessionStorage.setItem('username', finalName);
        }
      }

      setStats({
        total_revenue: res.data.total_revenue || 0,
        total_profit: res.data.total_profit || 0,
        low_stock_count: res.data.low_stock_alert?.count || 0
      });
      setLowStockProducts(res.data.low_stock_alert?.products || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch stats", err);
      setIsLoading(false);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const fetchSalesDetails = async () => {
    try {
      const res = await api.get('products/');
      setSalesDetails(res.data);
    } catch (err) {
      console.error("خطأ في جلب تفاصيل المبيعات", err);
    }
  };

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

      setSaleQuantities(prev => ({ ...prev, [productId]: '' }));
      
      fetchSalesDetails(); 
      fetchStats(); 
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
const getAuthHeader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
        console.warn("لا يوجد توكن، قد يتم رفض الطلب بـ 403");
        return {}; 
    }
    
    return { "Authorization": `Bearer ${token}` };
};



  useEffect(() => {
    localStorage.setItem('persistentSaleQuantities', JSON.stringify(saleQuantities));
  }, [saleQuantities]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const name = localStorage.getItem('username') || sessionStorage.getItem('username');

    if (name) {
      setDisplayName(name);
    } else {
      setDisplayName('المتجر');
    }

    if (token) {
      fetchStats();
      fetchSalesDetails();
    } else {
      setIsLoading(false);
      navigate('/', { replace: true });
    }
  }, []); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const productData = {
    name: product.name,
    cost_price: parseFloat(product.cost_price),
    selling_price: parseFloat(product.selling_price),
    stock: parseInt(product.stock),
    currency: product.currency,
  };

  try {
    await api.post('products/', productData);

    Swal.fire({
      title: 'تم تسجيل المنتج', 
  text: 'تمت إضافة المنتج الجديد إلى قائمة مخزونك.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });

    fetchStats();
    setProduct({ name: '', cost_price: '', selling_price: '', stock: '', currency: 'ريال' }); 
  } catch (error) {
    Swal.fire({
      title: 'خطأ في الإضافة',
      text: 'تأكد من صحة البيانات المدخلة في الحقول',
      icon: 'error',
      confirmButtonText: 'حسناً'
    });
  }
};

  if (isLoading) return <div className="loading">جاري تحميل البيانات...</div>;

    const stockData = salesDetails.length > 0 ? [
    { name: 'متوفر', value: salesDetails.filter(p => (p.stock ?? p.current_stock) >= 5).length },
    { name: 'منخفض', value: salesDetails.filter(p => (p.stock ?? p.current_stock) < 5 && (p.stock ?? p.current_stock) > 0).length },
    { name: 'نفد', value: salesDetails.filter(p => (p.stock ?? p.current_stock) === 0).length },
] : [];
    const STOCK_COLORS = ['#2ecc71', '#f1c40f', '#e74c3c'];
const bestSellersData = salesDetails.length > 0 ? salesDetails
    .map(p => ({
        name: p.name,
        revenue: parseFloat(p.total_revenue || 0),
        currency: p.currency 
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5) : [];
    // --- 3. تجهيز بيانات "السيولة المتداولة" (Stacked Bar Chart) ---
    const currencies = ['YER', 'USD', 'SAR', 'ريال']; // العملات المستخدمة في نظامك
    const cashFlowData = currencies.map(curr => {
const currProducts = salesDetails.filter(p => p.currency === curr || (curr === 'ريال' && p.currency === 'YEM'));        return {
            currency: curr,
            'تكلفة الشراء': currProducts.reduce((sum, p) => sum + (parseFloat(p.cost_price) * p.stock), 0),
            'قيمة البيع': currProducts.reduce((sum, p) => sum + (parseFloat(p.selling_price) * p.stock), 0),
        };
    }).filter(d => d['تكلفة الشراء'] > 0); 
    if (isLoading) return <div className="loader">جاري تحميل لوحة التحكم...</div>;


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
                        {(displayName || 'م').charAt(0).toUpperCase()}
                    </div>
    <h3>{displayName || 'المتجر'}</h3>
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

      <main className="main-content">

{lowStockProducts.length > 0 && (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
        <div className="stock-alert-mini" style={{
            backgroundColor: '#fff5f5',
            color: '#e53e3e',
            padding: '6px 14px',
            borderRadius: '10px',
            borderRight: '4px solid #e53e3e',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            width: 'fit-content', // لجعل العرض على قدر النص فقط
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}>
            <span style={{ fontFamily: 'Cairo' }}>
                ⚠️ <strong>{lowStockProducts.length}</strong> منتجات قاربت على النفاد!
            </span>
            
            <button 
                onClick={() => setView(view === 'low_stock_details' ? 'dashboard' : 'low_stock_details')}
                className="subtle-action-btn"
            >
                {view === 'low_stock_details' ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            </button>
        </div>
    </div>
)}

{view === 'low_stock_details' && (
    <div className="table-card animation-fade-in" style={{ marginTop: '10px' }}>
        <h3 style={{ borderRight: '4px solid #e53e3e', paddingRight: '10px', marginBottom: '15px', fontSize: '16px' }}>
            منتجات أوشكت على النفاد
        </h3>
        <table className="products-table">
            <thead>
                <tr>
                    <th>اسم المنتج</th>
                    <th>الكمية المتبقية</th>
                    <th>الحالة</th>
                </tr>
            </thead>
            <tbody>
                {lowStockProducts.map((item) => (
                    <tr key={item.id}>
                        <td>{item.name}</td>
                        <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            {(item.stock ?? item.current_stock ?? 0)} قطعة
                        </td>
                        <td><span className="status-low" style={{ background: '#fff5f5', color: '#e53e3e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>مخزون منخفض</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}
    
        <header className="content-header">
          <h1 style={{ 
      marginTop: '80px', 
      marginBottom: '-50px',
      fontFamily: 'Cairo, sans-serif' 
  }}>لوحة تحكم المتجر </h1>
        </header>

      

      <div style={{ minHeight: '150px', width: '100%' }}></div>

                      <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '20px', 
    marginBottom: '20px',
    alignItems: 'start'
}}>                    
                    <div className="table-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="chart-title">توزيع حالة المخزون</h3>
        <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie 
                        data={stockData} 
                        innerRadius={60} 
                        outerRadius={100} 
                        paddingAngle={5} 
                        dataKey="value"
                    >
                        {stockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>

    <div className="table-card" style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="chart-title">أعلى 5 منتجات مبيعاً</h3>
        <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={bestSellersData} 
                    layout="vertical" 
                    margin={{ left: 40, right: 40, top: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={90}
                        tick={{ fontFamily: 'Cairo', fontSize: 12,dx: -60, fontStyle:Bold}}
                    />
                    <Tooltip 
                        formatter={(value, name, props) => {
                            const currency = props.payload.currency || 'ريال';
                            return [`${value.toLocaleString()} ${currency}`, 'إجمالي المبيعات'];
                        }}
                    />
                    <Bar 
                        dataKey="revenue" 
                        fill="#44ACFF" 
                        radius={[0, 6, 6, 0]} 
                        barSize={25} 
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
</div>
    <div className="table-card" style={{ height: '450px' }}>
                    <h3 className="chart-title">تكلفة الشراء مقابل قيمة المبيعات</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="currency" tick={{fontFamily: 'Cairo'}} />
                            <YAxis tick={{fontFamily: 'Cairo',dx: -60,}} />
                           <Tooltip 
    cursor={{fill: '#f5f5f5'}} 
    formatter={(value, name, props) => {
        const currency = props.payload.currency; 
        return [`${value.toLocaleString()} ${currency}`, name];
    }}
/>
                            <Legend />
                            <Bar dataKey="تكلفة الشراء" fill="#ff7675" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="قيمة البيع" fill="#55efc4" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
      </main>
    </div>
  );
};

export default Dashboard;