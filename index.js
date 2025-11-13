const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const serverless = require('serverless-http'); 

const app = express();
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Root route
app.get('/', (req, res) => {
    res.send('Daily Fix server is running');
});

async function run() {
  try {
    await client.connect();

    const db = client.db('dailyfixdb');
    const usersCollection = db.collection('users');
    const servicesCollection = db.collection("services");
    const bookingsCollection = db.collection("bookings");

    // Users
    app.post('/users', async(req, res) =>{
        const newUser = req.body;
        const existingUser = await usersCollection.findOne({ email: newUser.email });
        if(existingUser){
            return res.send('User already exists. Do not need to insert again.');
        }
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    });

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get('/users/:uid', async (req, res) => {
      const uid = req.params.uid;
      const result = await usersCollection.findOne({ uid });
      res.send(result);
    });

    app.patch('/users/:uid', async (req, res) => {
      const uid = req.params.uid;
      const { name, image } = req.body;
      const result = await usersCollection.updateOne(
        { uid },
        { $set: { name, image } }
      );
      res.send(result);
    });

    // Services
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const existingService = await servicesCollection.findOne({ serviceTitle: newService.serviceTitle });
      if (existingService) {
        return res.send("Service already exists. Do not insert again.");
      }
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find({}).toArray();
      res.send(result);
    });

    app.patch('/services/:id', async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const result = await servicesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedService }
      );
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const userEmail = req.query.email;
      if (!userEmail) return res.status(401).send({ deletedCount: 0 });
      const result = await servicesCollection.deleteOne({ _id: new ObjectId(id), providerEmail: userEmail });
      res.send(result);
    });

    app.post('/bookings', async(req, res)=>{
      const result = await bookingsCollection.insertOne(req.body);
      res.send(result);
    });

    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    console.log("MongoDB connected successfully!");
  } finally {
  }
}
run().catch(console.dir);

module.exports.handler = serverless(app);
