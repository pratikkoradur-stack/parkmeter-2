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

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log('Connected to MongoDB', uri, 'DB:', dbName);

  // Basic vehicle endpoints
  app.get('/vehicles', async (req, res) => {
    try {
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
      const result = await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) });
      res.json({ deletedCount: result.deletedCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  app.listen(port, () => {
    console.log('Mongo API server listening on port', port);
  });
}

main().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
