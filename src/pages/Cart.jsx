import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const navigate = useNavigate();

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(items);
    }, []);

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const removeFromCart = async (id) => {
        const updatedCart = cartItems.filter(item => item.product._id !== id);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));

        try {
            await axios.post('/api/cart/sync', { items: updatedCart }, { withCredentials: true });
        } catch (error) {
            console.error('Failed to sync cart on remove', error);
        }
    };

    const updateQuantity = async (id, change) => {
        const updatedCart = cartItems.map(item => {
            if (item.product._id === id) {
                const newQty = item.quantity + change;
                if (newQty > 0 && newQty <= item.product.quantityAvailable) {
                    return { ...item, quantity: newQty };
                }
            }
            return item;
        });
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));

        try {
            await axios.post('/api/cart/sync', { items: updatedCart }, { withCredentials: true });
        } catch (error) {
            console.error('Failed to sync cart on update', error);
        }
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + (item.product.pricePerKg * item.quantity), 0);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!userInfo) {
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) return;

        // In FarmDirect, an order is usually per farmer. For simplicity here, if multiple products from different farmers are in cart, we'd need multiple orders.
        // Let's create an order for the first farmer or group by farmer. 
        // For the MVP demo, let's group items by farmer:
        const itemsByFarmer = {};
        cartItems.forEach(item => {
            const farmerId = item.product.farmer._id;
            if (!itemsByFarmer[farmerId]) itemsByFarmer[farmerId] = [];
            itemsByFarmer[farmerId].push({
                product: item.product._id,
                quantity: item.quantity,
                priceAtPurchase: item.product.pricePerKg
            });
        });

        try {
            // Post an order for each farmer
            for (const farmerId of Object.keys(itemsByFarmer)) {
                const farmerTotal = itemsByFarmer[farmerId].reduce((acc, item) => {
                    const price = cartItems.find(c => c.product._id === item.product).product.pricePerKg;
                    return acc + (price * item.quantity);
                }, 0);

                await axios.post('/api/orders', {
                    farmer: farmerId,
                    products: itemsByFarmer[farmerId],
                    totalAmount: farmerTotal,
                    shippingAddress,
                    pinCode,
                    paymentMethod
                });
            }

            alert('Order Placed Successfully!');
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));

            // Clear cart from database
            try {
                await axios.delete('/api/cart', { withCredentials: true });
            } catch (err) {
                console.error('Failed to clear cart in DB', err);
            }

            navigate('/');
        } catch (error) {
            alert('Failed to place order. Try again.');
        }
    };

    return (
        <div className="cart-container">
            <h2>Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <button className="btn-primary" onClick={() => navigate('/browse')}>Browse Products</button>
                </div>
            ) : (
                <div className="cart-grid">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.product._id} className="cart-item">
                                <img src={item.product.image.startsWith('/') ? `http://localhost:5000${item.product.image}` : 'https://via.placeholder.com/150'} alt={item.product.name} />
                                <div className="cart-item-info">
                                    <h4>{item.product.name}</h4>
                                    <p>Farmer: {item.product.farmer?.name}</p>
                                    <p className="price">₹{item.product.pricePerKg} / kg</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="qty-controls">
                                        <button type="button" onClick={() => updateQuantity(item.product._id, -1)}>-</button>
                                        <span>{item.quantity} kg</span>
                                        <button type="button" onClick={() => updateQuantity(item.product._id, 1)}>+</button>
                                    </div>
                                    <p className="item-total">₹{item.product.pricePerKg * item.quantity}</p>
                                    <button className="btn-danger outline" onClick={() => removeFromCart(item.product._id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row total">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount}</span>
                        </div>

                        <form onSubmit={handleCheckout} className="checkout-form">
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <textarea required value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} rows="3" />
                            </div>
                            <div className="form-group">
                                <label>PIN Code</label>
                                <input type="text" required value={pinCode} onChange={e => setPinCode(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                    <option value="COD">Cash on Delivery (COD)</option>
                                    <option value="UPI">UPI Payment</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full checkout-btn">Confirm Order</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
