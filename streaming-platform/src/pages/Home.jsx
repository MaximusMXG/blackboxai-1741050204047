import React from 'react';
import '../styles/home.css';

const Home = () => {
    return (
        <div className="home-container">
            <h1 className="home-title">Your Entertainment, Sliced Just Right</h1>
            <p className="home-description">
                Stream mainstream hits, discover indie gems, and support upcoming projects. All in one perfectly curated slice.
            </p>
            <button className="btn-primary">Start Watching</button>
        </div>
    );
};

export default Home;
