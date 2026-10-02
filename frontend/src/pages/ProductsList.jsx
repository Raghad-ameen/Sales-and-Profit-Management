import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import api from '../api';
import './ProductsList.css';
import Swal from 'sweetalert2';

const ProductsList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [displayName, setDisplayName] = useState('');
    
    const [product, setProduct] = useState({
        name: '', cost_price: '', selling_price: '', stock: '', currency: 'YER'
    });

    const fetchProducts = async () => {
        try {
            const response = await api.get('products/');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedName = localStorage.getItem('username') || sessionStorage.getItem('username');
        setDisplayName(savedName || 'المتجر');
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('products/', {
                ...product,
                cost_price: parseFloat(product.cost_price),
                selling_price: parseFloat(product.selling_price),
                stock: parseInt(product.stock),
            });

            Swal.fire({ title: 'تمت الإضافة', icon: 'success', timer: 2000, showConfirmButton: false });
            setProduct({ name: '', cost_price: '', selling_price: '', stock: '', currency: 'YER' });
            fetchProducts();
        } catch (error) {
            Swal.fire({ title: 'خطأ', text: 'تأكد من صحة البيانات المدخلة', icon: 'error' });
        }
    };

    const handleEdit = async () => {
        try {
            await api.put(
                `products/${currentProduct.id}/`, 
                {
                    ...currentProduct,
                    cost_price: parseFloat(currentProduct.cost_price),
                    selling_price: parseFloat(currentProduct.selling_price),
                    stock: parseInt(currentProduct.stock),
                }
            );

            Swal.fire({
                title: 'تم التحديث',
                text: 'تم تعديل بيانات المنتج بنجاح',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            setIsEditing(false);
            fetchProducts();
        } catch (error) {
            Swal.fire({
                title: 'خطأ!',
                text: 'فشل تحديث البيانات، تأكد من المدخلات',
                icon: 'error'
            });
        }
    };

    const handleDelete = async (productId) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'سيتم حذف المنتج نهائياً',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4d',
            confirmButtonText: 'نعم، احذفه!',
            cancelButtonText: 'إلغاء',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`products/${productId}/`);
                fetchProducts();
                Swal.fire({ title: 'تم الحذف', icon: 'success', timer: 1500, showConfirmButton: false });
            } catch (err) { Swal.fire({ title: 'خطأ!', text: 'فشل حذف المنتج', icon: 'error' }); }
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


    return (
        <div className="products-container">
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

            <main className="main-content">
                <div className="table-card" style={{marginBottom: '20px'}}>
                    <h2 style={{fontFamily: 'Cairo', marginBottom: '15px'}}>إضافة منتج جديد</h2>
                    <form onSubmit={handleSubmit} className="edit-form-group" style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        <input style={{flex: 1, minWidth: '150px'}} type="text" name="name" placeholder="اسم المنتج" value={product.name} onChange={handleInputChange} required />
                        <input style={{flex: 1, minWidth: '100px'}} type="number" name="cost_price" placeholder="سعر الشراء" value={product.cost_price} onChange={handleInputChange} required />
                        <input style={{flex: 1, minWidth: '100px'}} type="number" name="selling_price" placeholder="سعر البيع" value={product.selling_price} onChange={handleInputChange} required />
                        <select name="currency" value={product.currency} onChange={handleInputChange} className="edit-form-group input" style={{height: '44px', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '0 10px'}}>
                            <option value="YEM">YER</option>
                            <option value="USD">USD</option>
                            <option value="SAR">SAR</option>
                        </select>
                        <input style={{width: '100px'}} type="number" name="stock" placeholder="الكمية" value={product.stock} onChange={handleInputChange} required />
                        <button type="submit" className="save-changes-btn edit-btn" style={{flex: 'none', padding: '0 25px'}}>إضافة</button>
                    </form>
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <h2 style={{fontFamily: 'Cairo'}}>قائمة المنتجات</h2>
                        <span className="product-count">العدد: {products.length}</span>
                    </div>

                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>اسم المنتج</th>
                                <th>سعر الشراء</th>
                                <th>سعر البيع</th>
                                <th>الكمية</th>
                                <th>الحالة</th>
                                <th>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.currency} {item.cost_price}</td>
                                    <td>{item.currency} {item.selling_price}</td>
                                    <td>{item.stock}</td>
                                    <td>
                                        <span className={`status-badge ${item.stock < 5 ? 'low-stock' : 'in-stock'}`}>
                                            {item.stock < 5 ? 'مخزون منخفض' : 'متوفر'}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => {setCurrentProduct(item); setIsEditing(true);}} className="edit-btn save-changes-btn" style={{padding: '5px 15px', marginLeft: '5px', height: 'auto', fontSize: '13px'}}>تعديل</button>
                                        <button onClick={() => handleDelete(item.id)} className="delete-btn">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {isEditing && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <h3>تعديل المنتج</h3>
                        <div className="edit-form-group">
                            <input type="text" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                            <input type="number" value={currentProduct.cost_price} onChange={(e) => setCurrentProduct({...currentProduct, cost_price: e.target.value})} />
                            <input type="number" value={currentProduct.selling_price} onChange={(e) => setCurrentProduct({...currentProduct, selling_price: e.target.value})} />
                            <input type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})} />
                            {/* داخل الـ Modal */}
<div className="edit-modal-buttons">
    <button 
        className="edit-btn save-changes-btn" 
        onClick={handleEdit} // استدعاء الوظيفة هنا
    >
        حفظ
    </button>
    <button 
        className="edit-btn cancel-edit-btn" 
        onClick={() => setIsEditing(false)}
    >
        إلغاء
    </button>
</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsList;