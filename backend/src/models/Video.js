const db = require('../db/database');

class Video {
    static create(title, creator, thumbnailUrl) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO videos (title, creator, thumbnail_url) VALUES (?, ?, ?)';
            db.run(sql, [title, creator, thumbnailUrl], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        title, 
                        creator, 
                        thumbnail_url: thumbnailUrl 
                    });
                }
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM videos WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static getAll() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM videos ORDER BY created_at DESC';
            db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getTotalSlices(videoId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT SUM(slices) as total_slices 
                FROM subscription_slices 
                WHERE video_id = ?
            `;
            db.get(sql, [videoId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total_slices || 0 : 0);
                }
            });
        });
    }

    static getSubscribers(videoId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    u.username,
                    u.email,
                    s.slices,
                    s.created_at
                FROM subscription_slices s
                JOIN users u ON u.id = s.user_id
                WHERE s.video_id = ?
                ORDER BY s.slices DESC
            `;
            db.all(sql, [videoId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = Video;
