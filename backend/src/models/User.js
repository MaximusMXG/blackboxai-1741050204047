const db = require('../db/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

class User {
    static async create(username, email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
                
                db.run(sql, [username, email, hashedPassword], function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        reject(err);
                    } else {
                        const token = generateToken(this.lastID);
                        resolve({ 
                            id: this.lastID, 
                            username, 
                            email,
                            token 
                        });
                    }
                });
            } catch (err) {
                console.error('Error hashing password:', err);
                reject(err);
            }
        });
    }

    static async login(email, password) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], async (err, user) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    reject(err);
                } else if (!user) {
                    reject(new Error('User not found'));
                } else {
                    try {
                        const isMatch = await bcrypt.compare(password, user.password);
                        if (!isMatch) {
                            reject(new Error('Invalid password'));
                        } else {
                            const token = generateToken(user.id);
                            resolve({
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                token
                            });
                        }
                    } catch (err) {
                        console.error('Error comparing passwords:', err);
                        reject(err);
                    }
                }
            });
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, email, total_slices, created_at FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    static getSliceAllocation(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    v.title,
                    v.creator,
                    s.slices,
                    s.created_at
                FROM subscription_slices s
                JOIN videos v ON v.id = s.video_id
                WHERE s.user_id = ?
            `;
            db.all(sql, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    static getTotalSlices(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT total_slices FROM users WHERE id = ?';
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total_slices : 0);
                }
            });
        });
    }

    static getCurrentSlicesUsed(userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT SUM(slices) as total FROM subscription_slices WHERE user_id = ?';
            db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total || 0 : 0);
                }
            });
        });
    }
}

module.exports = User;
