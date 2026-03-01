import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        farmName: '',
        location: '',
        pinCode: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const { data } = await axios.post('/api/auth/register', formData);
            localStorage.setItem('userInfo', JSON.stringify(data));

            if (data.role === 'farmer') {
                navigate('/farmer-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card register-card">
                <h2>Join FarmDirect</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group half-width">
                            <label>Phone Number</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group half-width">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>I am a...</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="role-select">
                            <option value="customer">Customer (Buying Products)</option>
                            <option value="farmer">Farmer (Selling Products)</option>
                        </select>
                    </div>

                    {formData.role === 'farmer' && (
                        <div className="farmer-fields">
                            <h3 className="section-title">Farm Details</h3>
                            <div className="form-group">
                                <label>Farm/Business Name</label>
                                <input type="text" name="farmName" value={formData.farmName} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Location (City, State)</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                                </div>
                                <div className="form-group half-width">
                                    <label>Pin Code</label>
                                    <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary w-full">Create Account</button>
                </form>
                <p className="auth-redirect">
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
