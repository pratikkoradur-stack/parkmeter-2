require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'parkmeter';
const port = process.env.PORT || 4000;

let db;
let useMemoryDb = false;
let memoryVehicles = []; // in-memory fallback store when MongoDB is down

// Routes (they will use either MongoDB or in-memory store depending on availability)
app.get('/vehicles', async (req, res) => {
  try {
    if (useMemoryDb) {
      const s = req.query.search ? String(req.query.search).toLowerCase() : null;
      let results = memoryVehicles.slice().sort((a, b) => (b.created_at > a.created_at ? 1 : -1)).slice(0, 1000);
      if (s) {
        results = results.filter(v => (v.plate || '').toLowerCase().includes(s) || (v.owner || '').toLowerCase().includes(s) || (v.model || '').toLowerCase().includes(s));
      }
      return res.json(results);
    }

    const q = {};
    if (req.query.search) {
      const s = req.query.search.toLowerCase();
      q.$or = [
        { plate: { $regex: s, $options: 'i' } },
        { owner: { $regex: s, $options: 'i' } },
        { model: { $regex: s, $options: 'i' } }
      ];
    }
    const cursor = db.collection('vehicles').find(q).sort({ created_at: -1 }).limit(1000);
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

app.post('/vehicles', async (req, res) => {
  try {
    const body = req.body || {};
    const record = Object.assign({}, body, { created_at: body.created_at || new Date().toISOString() });

    if (useMemoryDb) {
      const id = Date.now().toString();
      const newRec = { id, ...record };
      memoryVehicles.push(newRec);
      return res.json({ insertedId: id });
    }

    const result = await db.collection('vehicles').insertOne(record);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert vehicle' });
  }
});

app.get('/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (useMemoryDb) {
      const doc = memoryVehicles.find(v => v.id === id || String(v.id) === id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.json(doc);
    }
    const doc = await db.collection('vehicles').findOne({ _id: new ObjectId(id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

app.delete('/vehicles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (useMemoryDb) {
      const before = memoryVehicles.length;
      memoryVehicles = memoryVehicles.filter(v => String(v.id) !== id);
      return res.json({ deletedCount: before - memoryVehicles.length });
    }
    const result = await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Try to connect to MongoDB but do NOT exit if it fails — fall back to in-memory store
(async function initialize() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB', uri, 'DB:', dbName);
  } catch (err) {
    console.warn('Warning: Could not connect to MongoDB, using in-memory fallback. Error:', err.message || err);
    useMemoryDb = true;
    memoryVehicles = [];
  }

  app.listen(port, '0.0.0.0', () => {
    console.log('API server listening on 0.0.0.0:' + port + (useMemoryDb ? ' (in-memory fallback mode)' : ''));
  });
})();
