import React, { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';
import './Suppliers.css';
import { useNavigate, NavLink } from 'react-router-dom'; 

const Suppliers = () => {
    const navigate = useNavigate(); 
    const [suppliers, setSuppliers] = useState([]);
    const [displayName, setDisplayName] = useState('');
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', category: '' });

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('suppliers/');
            setSuppliers(res.data);
        } catch (err) {
            console.error("خطأ في جلب الموردين", err);
        }
    };

    useEffect(() => {
        const savedName = localStorage.getItem('username') || sessionStorage.getItem('username');
        setDisplayName(savedName || 'المتجر');
        fetchSuppliers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        sessionStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            await api.post('suppliers/', newSupplier);
            Swal.fire({ title: 'تم تسجيل المورد', icon: 'success', timer: 1500, showConfirmButton: false });
            setNewSupplier({ name: '', phone: '', category: '' });
            fetchSuppliers();
        } catch (err) {
            Swal.fire({ title: 'خطأ', text: 'تأكد من صحة البيانات المدخلة', icon: 'error' });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "لن تتمكن من التراجع عن هذا الإجراء!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'نعم، احذفه!',
            cancelButtonText: 'إلغاء'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`suppliers/${id}/`);
                    Swal.fire({ title: 'تم الحذف!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchSuppliers();
                } catch (err) {
                    Swal.fire({ title: 'خطأ', text: 'فشل حذف المورد', icon: 'error' });
                }
            }
        });
    };

    const handleEdit = (supplier) => {
        Swal.fire({
            title: `تعديل المورد: ${supplier.name}`,
            html: `
                <div style="display: flex; flex-direction: column; gap: 12px; padding: 5px;">
                    <input id="swal-name" class="swal2-input" style="direction: rtl; font-family: 'Cairo'; margin: 0; width: 100%;" placeholder="اسم المورد" value="${supplier.name}">
                    <input id="swal-phone" class="swal2-input" style="direction: rtl; font-family: 'Cairo'; margin: 0; width: 100%;" placeholder="رقم الهاتف" value="${supplier.phone}">
                    <input id="swal-category" class="swal2-input" style="direction: rtl; font-family: 'Cairo'; margin: 0; width: 100%;" placeholder="التخصص" value="${supplier.category}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'حفظ التغييرات',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#44ACFF',
            preConfirm: () => {
                return {
                    name: document.getElementById('swal-name').value,
                    phone: document.getElementById('swal-phone').value,
                    category: document.getElementById('swal-category').value
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.put(`suppliers/${supplier.id}/`, result.value);
                    Swal.fire({ title: 'تم التحديث!', icon: 'success', timer: 1500, showConfirmButton: false });
                    fetchSuppliers();
                } catch (err) {
                    Swal.fire({ title: 'خطأ', text: 'فشل التحديث', icon: 'error' });
                }
            }
        });
    };

    return (
        <div className="dashboard-wrapper">
            <aside className="sidebar">
                <div className="sidebar-card store-info">
                    <div style={{ 
                        width: '50px', height: '50px', backgroundColor: '#44ACFF', 
                        color: 'white', borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        marginBottom: '10px', fontWeight: 'bold'
                    }}>
                       <div className="user-avatar-container" style={{ 
                        width: '50px', height: '50px', backgroundColor: '#44ACFF', 
                        color: 'white', borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        marginBottom: '10px', fontWeight: 'bold'
                    }}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    </div>
                   <h3>{displayName || 'المتجر'}</h3>
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
                <header className="content-header">
                    <h1>إدارة الموردين</h1>
                </header>
                
                <section className="add-supplier-card">
                    <h3>إضافة مورد جديد</h3>
                    <form onSubmit={handleAddSupplier} className="supplier-form">
                        <input type="text" placeholder="اسم المورد" value={newSupplier.name} 
                               onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} required />
                        <input type="text" placeholder="رقم الهاتف" value={newSupplier.phone} 
                               onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} required />
                        <input type="text" placeholder="نوع المنتجات" value={newSupplier.category} 
                               onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} required />
                        <button type="submit" className="save-btn">حفظ المورد</button>
                    </form>
                </section>

                <div className="table-card">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>اسم المورد</th>
                                <th>التخصص</th>
                                <th>رقم الهاتف</th>
                                <th>تواصل</th>
                                <th>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(s => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                                    <td>{s.category}</td>
                                    <td>{s.phone}</td>
                                    <td>
                                        <a href={`https://wa.me/${s.phone}`} target="_blank" rel="noreferrer" className="whatsapp-link">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="whatsapp" className="whatsapp-icon" />
                                            واتساب
                                        </a>
                                    </td>
                                                                <td style={{ width: '180px' }}> {/* تحديد عرض الخلية نفسها */}
                                <div className="operations-wrapper">
                                    <button 
                                    className="edit-btn" 
                                    style={{ width: '75px !important', minWidth: '75px' }} // فرض العرض هنا
                                    onClick={() => handleEdit(s)}
                                    >
                                    تعديل
                                    </button>
                                    <button 
                                    className="delete-btn" 
                                    style={{ width: '75px !important', minWidth: '75px' }}
                                    onClick={() => handleDelete(s.id)}
                                    >
                                    حذف
                                    </button>
                                </div>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="back-btn-container">
                    <button onClick={() => navigate('/dashboard')} className="back-btn">العودة للرئيسية</button>
                </div>
                <div style={{ minHeight: '150px', width: '100%' }}></div>
            </main>
        </div>
    );
};

export default Suppliers;