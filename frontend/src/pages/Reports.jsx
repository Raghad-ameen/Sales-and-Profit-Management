import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import './Reports.css';

const Reports = () => {
    const [filterType, setFilterType] = useState('cost_price');
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]); // أضفنا الحالة الخاصة بالمبيعات هنا
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('username') || sessionStorage.getItem('username');
        setDisplayName(savedName || 'المتجر');

        const fetchData = async () => {
            try {
                // 1. جلب المنتجات للجدول والتشارت
                const resProd = await api.get('products/');
                setProducts(resProd.data);

                // 2. جلب المبيعات للكروت العلوية (عشان ما تنقص الأرقام)
                const resSales = await api.get('sales/');
                setSales(resSales.data);
            } catch (err) { 
                console.error("خطأ في جلب البيانات:", err); 
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        sessionStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    // حساب الكروت بناءً على سجل المبيعات الفعلي
    const finalBalances = useMemo(() => {
        const init = {
            YER: { profit: 0, sales: 0 },
            USD: { profit: 0, sales: 0 },
            SAR: { profit: 0, sales: 0 }
        };

        return sales.reduce((acc, item) => {
            // معالجة اختلاف المسميات (YEM تحول إلى YER)
            let curr = item.currency === "YEM" ? "YER" : item.currency;
            
            if (acc[curr]) {
                // نستخدم أسماء الحقول كما هي في الـ Django Serializer الخاص بك
                acc[curr].sales += Number(item.total_sale_price || 0); 
                acc[curr].profit += Number(item.total_profit || 0);
            }
            return acc;
        }, init);
    }, [sales]);

    const chartData = useMemo(() => {
        return [...products].reverse().map(p => {
            let val = 0;
            const buy = Number(p.cost_price) || 0;
            const sell = Number(p.selling_price) || 0;
            const stock = Number(p.stock) || 0;

            if (filterType === 'cost_price') val = buy;
            else if (filterType === 'selling_price') val = sell;
            else if (filterType === 'profit') val = (sell - buy);
            else if (filterType === 'total_sales') val = (sell * stock);
            else if (filterType === 'stock_level') val = stock;

            return { name: p.name, value: val, currency: p.currency };
        });
    }, [products, filterType]);

    const handlePrint = () => window.print();
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(products);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "التقارير");
        XLSX.writeFile(wb, "Report.xlsx");
    };

    return (
        <div className="products-container">
            <aside className="sidebar">
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
                <header className="table-header">
                    <h2 style={{fontFamily:'Cairo'}}>التحليل المالي الشامل</h2>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={exportExcel} className="btn-excel">تصدير Excel</button>
                        <button onClick={handlePrint} className="btn-print">طباعة التقرير (PDF)</button>
                    </div>
                </header>

                <div className="multi-currency-grid">
                    {Object.keys(finalBalances).map((curr) => (
                        <div key={curr} className="currency-section">
                            <h4 className="currency-title">العملة: {curr}</h4>
                            <div className="currency-cards-row">
                                <div className={`currency-card sales-card ${curr.toLowerCase()}`} style={{ 
    backgroundColor: '#fff', 
    padding: '15px', 
    borderRadius: '8px', 
    marginBottom: '15px', // هذا السطر سيخلق الفراغ الذي تبحثين عنه
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
}}>
                                    <span>إجمالي المبيعات</span>
                                    <h3>{finalBalances[curr].sales.toLocaleString()}</h3>
                                </div>
                                <div className={`currency-card profit-card ${curr.toLowerCase()}`} style={{ 
    backgroundColor: '#fff', 
    padding: '15px', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
}}>
                                    <span>صافي الربح</span>
                                    <h3>{finalBalances[curr].profit.toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="table-card">
                    <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ borderRight: '4px solid #44ACFF', paddingRight: '10px' }}>مخطط المخزون الحالي</h3>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #44ACFF', fontFamily: 'Cairo' }}
                        >
                            <option value="cost_price">سعر الشراء</option>
                            <option value="selling_price">سعر البيع</option>
                            <option value="profit">صافي الربح للقطعة</option>
                            <option value="total_sales">إجمالي قيمة المخزون</option>
                            <option value="stock_level">كمية المخزون</option>
                        </select>
                    </div>

                    <div className="chart-box" style={{marginBottom:'40px'}}>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value, name, props) => [`${value.toLocaleString()} ${props.payload.currency}`, "القيمة"]} />
                                <Area type="monotone" dataKey="value" stroke="#44ACFF" fill="#44ACFF" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>سعر الشراء</th>
                                <th>سعر البيع</th>
                                <th>العملة</th>
                                <th>المخزون</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{Number(item.cost_price).toLocaleString()}</td>
                                    <td>{Number(item.selling_price).toLocaleString()}</td>
                                    <td><span className="status-badge in-stock">{item.currency}</span></td>
                                    <td>{item.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Reports;