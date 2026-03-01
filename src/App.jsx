import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import './pages/Dashboard.css';
import './pages/Customer.css';

function App() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [cartCount, setCartCount] = useState(0);

    // Function to refresh cart count from localStorage
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalItems);
    };

    useEffect(() => {
        updateCartCount();
        // Listen for custom event triggered when cart updates
        window.addEventListener('cartUpdated', updateCartCount);
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="app-container">
                <header className="navbar">
                    <Link to="/" className="nav-brand" style={{ textDecoration: 'none', color: 'white' }}>FarmDirect</Link>
                    <nav className="nav-links">
                        <Link to="/browse">Browse Products</Link>
                        {!userInfo ? (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link>
                            </>
                        ) : (
                            <>
                                {userInfo.role === 'farmer' && <Link to="/farmer-dashboard">Farmer Dashboard</Link>}
                                {userInfo.role === 'customer' && (
                                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && <span className="cart-badge" style={{ background: '#d35400', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{cartCount}</span>}
                                    </Link>
                                )}
                                <span style={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}>Hi, {userInfo.name}</span>
                                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                            </>
                        )}
                    </nav>
                </header>
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<div className="hero">
                            <h1>Fresh From Farm to Your Table</h1>
                            <p>Buy directly from farmers with no middlemen.</p>
                            <div style={{ marginTop: '2rem' }}>
                                <Link to="/browse" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none', display: 'inline-block' }}>Start Shopping</Link>
                            </div>
                        </div>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                        <Route path="/browse" element={<CustomerDashboard />} />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </main>
                <footer className="footer">
                    <p>&copy; 2026 FarmDirect. Support Local Farmers.</p>
                </footer>
            </div>
        </Router>
    )
}

export default App;
