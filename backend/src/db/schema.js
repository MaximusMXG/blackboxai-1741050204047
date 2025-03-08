const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
}

// Define database path
const dbPath = path.join(dataDir, 'slices.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database schema
const initializeSchema = () => {
    return new Promise((resolve, reject) => {
        // Create subscription_slices table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS subscription_slices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                video_id TEXT NOT NULL,
                slices INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, video_id)
            )
        `, (err) => {
            if (err) {
                console.error('Error creating subscription_slices table:', err.message);
                reject(err);
            } else {
                console.log('Ensured subscription_slices table exists');
                resolve();
            }
        });
    });
};

// Initialize schema on module load
initializeSchema()
    .then(() => console.log('SQLite schema initialized'))
    .catch(err => console.error('Error initializing SQLite schema:', err));

module.exports = { db, initializeSchema };