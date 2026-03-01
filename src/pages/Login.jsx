import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Reset cart on login
            localStorage.removeItem('cart');

            // Redirect based on role
            if (data.role === 'farmer') {
                navigate('/farmer-dashboard');
            } else {
                // Fetch cart for customer
                try {
                    const cartData = await axios.get('/api/cart', { withCredentials: true });
                    if (cartData.data && cartData.data.items) {
                        const formattedCart = cartData.data.items.map(i => ({
                            product: i.product,
                            quantity: i.quantity
                        }));
                        localStorage.setItem('cart', JSON.stringify(formattedCart));
                        window.dispatchEvent(new Event('cartUpdated'));
                    }
                } catch (cartError) {
                    console.error('Failed to sync cart on login', cartError);
                }
                navigate('/browse');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Login to FarmDirect</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full">Sign In</button>
                </form>
                <p className="auth-redirect">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
