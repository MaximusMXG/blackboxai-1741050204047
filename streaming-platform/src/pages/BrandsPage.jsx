import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brandService } from '../services/api';
import '../styles/BrandsPage.css';

const BrandCard = ({ brand }) => {
    return (
        <Link to={`/brands/${brand.slug}`} className="brand-card">
            <div className="brand-logo-container">
                <img 
                    src={brand.logo || 'https://picsum.photos/200'} 
                    alt={brand.name} 
                    className="brand-logo"
                />
                {brand.isVerified && (
                    <span className="verified-badge" title="Verified Brand">✓</span>
                )}
            </div>
            <div className="brand-info">
                <h3 className="brand-name">{brand.name}</h3>
                <p className="brand-category">{brand.category}</p>
                <p className="brand-stats">
                    <span>{brand.followersCount.toLocaleString()} followers</span>
                    {brand.totalVideos > 0 && (
                        <span> • {brand.totalVideos} videos</span>
                    )}
                </p>
                <p className="brand-description">{brand.shortDescription || brand.description}</p>
            </div>
        </Link>
    );
};

const BrandsPage = () => {
    const [brands, setBrands] = useState([]);
    const [popularBrands, setPopularBrands] = useState([]);
    const [categoryBrands, setCategoryBrands] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    
    const categories = [
        { id: 'all', name: 'All Brands' },
        { id: 'entertainment', name: 'Entertainment' },
        { id: 'music', name: 'Music' },
        { id: 'gaming', name: 'Gaming' },
        { id: 'education', name: 'Education' },
        { id: 'sports', name: 'Sports' },
        { id: 'news', name: 'News' },
        { id: 'technology', name: 'Technology' },
        { id: 'lifestyle', name: 'Lifestyle' }
    ];
    
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                
                // Fetch popular brands
                const popularResponse = await brandService.getPopular(8);
                setPopularBrands(popularResponse.data);
                
                // Fetch brands by category if a specific category is selected
                if (activeCategory !== 'all') {
                    const categoryResponse = await brandService.getByCategory(
                        activeCategory, 
                        currentPage, 
                        12
                    );
                    setBrands(categoryResponse.data.brands);
                    setTotalPages(categoryResponse.data.totalPages);
                } else {
                    // Fetch all brands with pagination
                    const allResponse = await brandService.getAll(currentPage, 12);
                    setBrands(allResponse.data.brands);
                    setTotalPages(allResponse.data.totalPages);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching brands:', err);
                setError('Failed to load brands. Please try again later.');
                setLoading(false);
            }
        };
        
        // Don't fetch if we're currently searching
        if (!isSearching) {
            fetchBrands();
        }
    }, [activeCategory, currentPage, isSearching]);
    
    // Handle search
    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (searchQuery.trim() === '') {
                setIsSearching(false);
                setSearchResults([]);
                return;
            }
            
            setIsSearching(true);
            try {
                const response = await brandService.search(searchQuery);
                setSearchResults(response.data);
            } catch (err) {
                console.error('Error searching brands:', err);
                setSearchResults([]);
            }
        }, 500); // Debounce search
        
        return () => clearTimeout(searchTimer);
    }, [searchQuery]);
    
    // Change category
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setCurrentPage(1); // Reset to first page
        setSearchQuery(''); // Clear search
        setIsSearching(false);
    };
    
    // Handle search input
    const handleSearchInput = (e) => {
        setSearchQuery(e.target.value);
    };
    
    // Change page
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // Render brands grid
    const renderBrandsGrid = () => {
        const brandsToShow = isSearching ? searchResults : brands;
        
        if (loading) {
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading brands...</p>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button className="refresh-button" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            );
        }
        
        if (brandsToShow.length === 0) {
            return (
                <div className="no-results">
                    <h3>No brands found</h3>
                    {isSearching ? (
                        <p>Try adjusting your search query or browse by category</p>
                    ) : (
                        <p>Try selecting a different category</p>
                    )}
                </div>
            );
        }
        
        return (
            <div className="brands-grid">
                {brandsToShow.map(brand => (
                    <BrandCard key={brand._id} brand={brand} />
                ))}
            </div>
        );
    };
    
    return (
        <div className="brands-page">
            <div className="brands-hero">
                <h1>Discover <span className="gradient-text">Brands</span></h1>
                <p>Find your favorite creators and support them with your slices</p>
                
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchQuery}
                        onChange={handleSearchInput}
                        className="brand-search-input"
                    />
                    <button className="search-button">
                        🔍
                    </button>
                </div>
            </div>
            
            {!isSearching && popularBrands.length > 0 && (
                <section className="popular-brands-section">
                    <h2>Popular Brands</h2>
                    <div className="popular-brands-grid">
                        {popularBrands.map(brand => (
                            <BrandCard key={brand._id} brand={brand} />
                        ))}
                    </div>
                </section>
            )}
            
            <div className="brands-content">
                <div className="categories-sidebar">
                    <h3>Categories</h3>
                    <ul className="categories-list">
                        {categories.map(category => (
                            <li 
                                key={category.id}
                                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category.id)}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="brands-main-content">
                    <h2>{isSearching ? 'Search Results' : activeCategory === 'all' ? 'All Brands' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Brands`}</h2>
                    
                    {renderBrandsGrid()}
                    
                    {!isSearching && totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="page-button prev"
                            >
                                &lt; Previous
                            </button>
                            
                            <div className="page-numbers">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show pages around current page
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="ellipsis">...</span>
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            className={`page-number ${currentPage === totalPages ? 'active' : ''}`}
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="page-button next"
                            >
                                Next &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandsPage;