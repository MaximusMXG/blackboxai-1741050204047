const express = require('express');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Get all MongoDB models/schemas
router.get('/models', async (req, res) => {
    try {
        // Get all registered models
        const modelNames = Object.keys(mongoose.models);
        
        // Get schema details for each model
        const models = modelNames.map(name => {
            const model = mongoose.models[name];
            const schema = model.schema;
            
            // Extract paths from schema
            const paths = Object.keys(schema.paths).map(pathName => {
                const path = schema.paths[pathName];
                return {
                    name: pathName,
                    type: path.instance,
                    required: !!path.isRequired,
                    default: path.defaultValue,
                    ref: path.options?.ref || null,
                    enum: path.enumValues || null
                };
            });
            
            return {
                name,
                collectionName: model.collection.collectionName,
                paths
            };
        });
        
        res.json(models);
    } catch (error) {
        console.error('Error getting models:', error);
        res.status(500).json({ error: 'Error getting models' });
    }
});

// Get SQLite tables
router.get('/tables', async (req, res) => {
    try {
        // Open SQLite database
        const dbPath = path.join(__dirname, '../../db/data/slices.db');
        const db = new sqlite3.Database(dbPath);
        
        // Get all tables
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                db.close();
                return res.status(500).json({ error: err.message });
            }
            
            const tablePromises = tables.map(table => {
                return new Promise((resolve, reject) => {
                    // Get table schema
                    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        resolve({
                            name: table.name,
                            columns: columns.map(col => ({
                                name: col.name,
                                type: col.type,
                                notNull: !!col.notnull,
                                defaultValue: col.dflt_value,
                                primaryKey: !!col.pk
                            }))
                        });
                    });
                });
            });
            
            Promise.all(tablePromises)
                .then(tableSchemas => {
                    db.close();
                    res.json(tableSchemas);
                })
                .catch(err => {
                    db.close();
                    res.status(500).json({ error: err.message });
                });
        });
    } catch (error) {
        console.error('Error getting tables:', error);
        res.status(500).json({ error: 'Error getting tables' });
    }
});

// Execute MongoDB query (admin-only development tool)
router.post('/query/mongodb', async (req, res) => {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Not allowed in production environment' });
        }
        
        const { collection, operation, query, data, options } = req.body;
        
        if (!collection || !operation) {
            return res.status(400).json({ error: 'Collection and operation are required' });
        }
        
        // Get collection
        const db = mongoose.connection.db;
        const coll = db.collection(collection);
        
        let result;
        
        // Execute operation
        switch (operation) {
            case 'find':
                result = await coll.find(query || {}).toArray();
                break;
            case 'findOne':
                result = await coll.findOne(query || {});
                break;
            case 'insertOne':
                result = await coll.insertOne(data || {});
                break;
            case 'insertMany':
                result = await coll.insertMany(data || []);
                break;
            case 'updateOne':
                result = await coll.updateOne(query || {}, { $set: data || {} }, options);
                break;
            case 'updateMany':
                result = await coll.updateMany(query || {}, { $set: data || {} }, options);
                break;
            case 'deleteOne':
                result = await coll.deleteOne(query || {});
                break;
            case 'deleteMany':
                result = await coll.deleteMany(query || {});
                break;
            case 'aggregate':
                result = await coll.aggregate(query || []).toArray();
                break;
            default:
                return res.status(400).json({ error: 'Invalid operation' });
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error executing MongoDB query:', error);
        res.status(500).json({ error: error.message });
    }
});

// Execute SQLite query (admin-only development tool)
router.post('/query/sqlite', async (req, res) => {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Not allowed in production environment' });
        }
        
        const { query, params } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        // Open SQLite database
        const dbPath = path.join(__dirname, '../../db/data/slices.db');
        const db = new sqlite3.Database(dbPath);
        
        // Check if it's a SELECT query
        const isSelect = query.trim().toUpperCase().startsWith('SELECT');
        
        if (isSelect) {
            // Execute SELECT query
            db.all(query, params || [], (err, rows) => {
                db.close();
                
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json(rows);
            });
        } else {
            // Execute non-SELECT query
            db.run(query, params || [], function(err) {
                db.close();
                
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                
                res.json({
                    changes: this.changes,
                    lastID: this.lastID
                });
            });
        }
    } catch (error) {
        console.error('Error executing SQLite query:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get storage structure
router.get('/storage', async (req, res) => {
    try {
        // Get storage directory
        const storagePath = path.join(__dirname, '../../storage');
        
        // Check if storage directory exists
        try {
            await fs.access(storagePath);
        } catch (error) {
            return res.status(404).json({ error: 'Storage directory not found' });
        }
        
        // Get directory structure recursively
        const getDirectoryStructure = async (dirPath, relativePath = '') => {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            const structure = {
                path: relativePath,
                directories: [],
                files: []
            };
            
            for (const entry of entries) {
                const entryPath = path.join(dirPath, entry.name);
                const entryRelativePath = path.join(relativePath, entry.name);
                
                if (entry.isDirectory()) {
                    const subStructure = await getDirectoryStructure(entryPath, entryRelativePath);
                    structure.directories.push(subStructure);
                } else {
                    const stats = await fs.stat(entryPath);
                    structure.files.push({
                        name: entry.name,
                        path: entryRelativePath,
                        size: stats.size,
                        extension: path.extname(entry.name),
                        url: `/storage/${entryRelativePath.replace(/\\/g, '/')}`
                    });
                }
            }
            
            return structure;
        };
        
        const structure = await getDirectoryStructure(storagePath);
        
        res.json(structure);
    } catch (error) {
        console.error('Error getting storage structure:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create directory in storage
router.post('/storage/directory', async (req, res) => {
    try {
        const { path: dirPath } = req.body;
        
        if (!dirPath) {
            return res.status(400).json({ error: 'Directory path is required' });
        }
        
        // Sanitize path to prevent directory traversal attacks
        const sanitizedPath = dirPath.replace(/\.\./g, '');
        const fullPath = path.join(__dirname, '../../storage', sanitizedPath);
        
        await fs.mkdir(fullPath, { recursive: true });
        
        res.json({ success: true, path: sanitizedPath });
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete file or directory in storage
router.delete('/storage', async (req, res) => {
    try {
        const { path: itemPath } = req.body;
        
        if (!itemPath) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        // Sanitize path to prevent directory traversal attacks
        const sanitizedPath = itemPath.replace(/\.\./g, '');
        const fullPath = path.join(__dirname, '../../storage', sanitizedPath);
        
        // Check if it's a directory or file
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }
        
        res.json({ success: true, path: sanitizedPath });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get database status
router.get('/status', async (req, res) => {
    try {
        // MongoDB status
        const mongoStats = {
            connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose.connection.host,
            models: Object.keys(mongoose.models),
            collections: Object.keys(mongoose.connection.collections)
        };
        
        // SQLite status
        const dbPath = path.join(__dirname, '../../db/data/slices.db');
        const db = new sqlite3.Database(dbPath);
        
        db.get("SELECT count(*) as count FROM sqlite_master WHERE type='table'", [], (err, result) => {
            db.close();
            
            const sqliteStats = {
                path: dbPath,
                tables: err ? null : result.count,
                error: err ? err.message : null
            };
            
            // Storage status
            const storagePath = path.join(__dirname, '../../storage');
            fs.readdir(storagePath)
                .then(entries => {
                    const storageStats = {
                        path: storagePath,
                        entries: entries.length,
                        directories: ['brands', 'videos'].filter(dir => entries.includes(dir))
                    };
                    
                    res.json({
                        mongo: mongoStats,
                        sqlite: sqliteStats,
                        storage: storageStats,
                        environment: process.env.NODE_ENV || 'development'
                    });
                })
                .catch(error => {
                    const storageStats = {
                        path: storagePath,
                        error: error.message
                    };
                    
                    res.json({
                        mongo: mongoStats,
                        sqlite: sqliteStats,
                        storage: storageStats,
                        environment: process.env.NODE_ENV || 'development'
                    });
                });
        });
    } catch (error) {
        console.error('Error getting database status:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;