const db = require('../db/database');
const User = require('./User');

class SubscriptionSlice {
    static async allocateSlices(userId, videoId, slices) {
        // First check if user has enough available slices
        const totalSlices = await User.getTotalSlices(userId);
        const usedSlices = await User.getCurrentSlicesUsed(userId);
        const availableSlices = totalSlices - usedSlices;

        // Check if user already has slices allocated to this video
        const currentAllocation = await this.getCurrentAllocation(userId, videoId);
        const effectiveSlicesToAdd = currentAllocation ? slices - currentAllocation : slices;

        if (effectiveSlicesToAdd > availableSlices) {
            throw new Error(`Not enough slices available. You have ${availableSlices} slices remaining.`);
        }

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO subscription_slices (user_id, video_id, slices)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id, video_id) 
                DO UPDATE SET slices = ?
            `;
            db.run(sql, [userId, videoId, slices, slices], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        user_id: userId,
                        video_id: videoId,
                        slices: slices
                    });
                }
            });
        });
    }

    static getCurrentAllocation(userId, videoId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT slices FROM subscription_slices WHERE user_id = ? AND video_id = ?';
            db.get(sql, [userId, videoId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.slices : 0);
                }
            });
        });
    }

    static removeAllocation(userId, videoId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM subscription_slices WHERE user_id = ? AND video_id = ?';
            db.run(sql, [userId, videoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    static async updateAllocation(userId, videoId, newSlices) {
        // Validate the new slice allocation
        const totalSlices = await User.getTotalSlices(userId);
        const currentAllocation = await this.getCurrentAllocation(userId, videoId);
        const otherSlicesUsed = await User.getCurrentSlicesUsed(userId) - currentAllocation;
        
        if (newSlices + otherSlicesUsed > totalSlices) {
            throw new Error(`Cannot allocate ${newSlices} slices. You have ${totalSlices - otherSlicesUsed} slices available.`);
        }

        return new Promise((resolve, reject) => {
            const sql = 'UPDATE subscription_slices SET slices = ? WHERE user_id = ? AND video_id = ?';
            db.run(sql, [newSlices, userId, videoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        success: true,
                        changes: this.changes,
                        new_slices: newSlices
                    });
                }
            });
        });
    }

    static getUserSubscriptions(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    s.*,
                    v.title as video_title,
                    v.creator as video_creator,
                    v.thumbnail_url
                FROM subscription_slices s
                JOIN videos v ON v.id = s.video_id
                WHERE s.user_id = ?
                ORDER BY s.slices DESC
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
}

module.exports = SubscriptionSlice;
