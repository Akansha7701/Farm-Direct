import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const FarmerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [showAddModal, setShowAddModal] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '', category: 'Vegetables', pricePerKg: '', quantityAvailable: '', description: '', image: ''
    });

    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'farmer') {
            navigate('/login');
            return;
        }
        fetchProducts();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/products/farmer/me');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products');
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/orders/myorders/all');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/products', newProduct);
            setShowAddModal(false);
            setNewProduct({ name: '', category: 'Vegetables', pricePerKg: '', quantityAvailable: '', description: '', image: '' });
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert(`Failed to add product: ${error.response?.data?.message || error.message}`);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post('/api/upload', formData, config);
            setNewProduct({ ...newProduct, image: data });
        } catch (error) {
            console.error(error);
            alert(`Image upload failed: ${error.response?.data || error.message}`);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <h2>Farmer Portal</h2>
                <div className="sidebar-menu">
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>My Products</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Incoming Orders</button>
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'products' && (
                    <div className="tab-section">
                        <div className="section-header">
                            <h3>Manage Products</h3>
                            <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Product</button>
                        </div>
                        <div className="products-grid">
                            {products.length === 0 ? <p>No products added yet.</p> : products.map(p => (
                                <div key={p._id} className="product-card">
                                    <img src={p.image.startsWith('/') ? `http://localhost:5000${p.image}` : 'https://via.placeholder.com/150'} alt={p.name} />
                                    <div className="product-info">
                                        <h4>{p.name}</h4>
                                        <p className="price">₹{p.pricePerKg} / kg</p>
                                        <p className="stock">Stock: {p.quantityAvailable} kg</p>
                                        <button className="btn-danger" onClick={() => handleDeleteProduct(p._id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="tab-section">
                        <h3>Customer Orders</h3>
                        <div className="orders-list">
                            {orders.length === 0 ? <p>No orders yet.</p> : orders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <h4>Order #{order._id.substring(0, 8)}</h4>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                                    </div>
                                    <div className="order-details">
                                        <p><strong>Customer:</strong> {order.customer?.name} ({order.customer?.phone})</p>
                                        <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                                        <div className="action-buttons">
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button className="btn-primary" onClick={() => handleUpdateOrderStatus(order._id, 'Accepted')}>Accept</button>
                                                    <button className="btn-danger" onClick={() => handleUpdateOrderStatus(order._id, 'Rejected')}>Reject</button>
                                                </>
                                            )}
                                            {order.status === 'Accepted' && (
                                                <button className="btn-primary" onClick={() => handleUpdateOrderStatus(order._id, 'Shipped')}>Mark Shipped</button>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button className="btn-primary" onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}>Mark Delivered</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {
                showAddModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Add New Product</h3>
                            <form onSubmit={handleAddProduct} className="auth-form">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group half-width">
                                        <label>Price (₹ per kg)</label>
                                        <input type="number" value={newProduct.pricePerKg} onChange={e => setNewProduct({ ...newProduct, pricePerKg: e.target.value })} required />
                                    </div>
                                    <div className="form-group half-width">
                                        <label>Available Quantity (kg)</label>
                                        <input type="number" value={newProduct.quantityAvailable} onChange={e => setNewProduct({ ...newProduct, quantityAvailable: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Upload Image</label>
                                    <input type="file" onChange={uploadFileHandler} required={!newProduct.image} />
                                    {newProduct.image && <p style={{ fontSize: '0.8rem', color: 'green' }}>Image uploaded successfully</p>}
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-danger outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Product</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FarmerDashboard;
