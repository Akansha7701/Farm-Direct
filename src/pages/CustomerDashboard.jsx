import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async (currentKeyword = keyword) => {
        try {
            let url = '/api/products?';
            if (currentKeyword) url += `keyword=${currentKeyword}&`;
            if (category) url += `category=${category}`;

            const { data } = await axios.get(url);
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const addToCart = async (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.product._id === product._id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated')); // trigger navbar update

        try {
            await axios.post('/api/cart/sync', { items: cart }, { withCredentials: true });
        } catch (error) {
            console.error('Failed to sync cart', error);
        }
    };

    return (
        <div className="customer-dashboard">
            <div className="search-bar-container">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search fresh products..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn-primary search-btn">Search</button>
                </form>
                <div className="category-filters">
                    {['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Other'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${category === cat || (cat === 'All' && category === '') ? 'active' : ''}`}
                            onClick={() => setCategory(cat === 'All' ? '' : cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="products-grid customer-grid">
                {products.length === 0 ? <p className="no-products">No products found matching your search.</p> : products.map(p => (
                    <div key={p._id} className="product-card">
                        <img src={p.image.startsWith('/') ? `http://localhost:5000${p.image}` : 'https://via.placeholder.com/250'} alt={p.name} />
                        <div className="product-info">
                            <span className="category-tag">{p.category}</span>
                            <h4>{p.name}</h4>
                            <p className="farmer-name">By: {p.farmer?.name} ({p.farmer?.location})</p>
                            <p className="price">₹{p.pricePerKg} / kg</p>
                            <button className="btn-primary w-full add-to-cart-btn" onClick={() => addToCart(p)}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default CustomerDashboard;
