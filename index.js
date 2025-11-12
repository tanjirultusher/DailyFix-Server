const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
require('dotenv').config()

const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())


//dailyfixdb
//GYu0KY3SnYivkt2L
const uri = "mongodb+srv://dailyfixdb:GYu0KY3SnYivkt2L@cluster0.upddivc.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
    res.send('Daily Fix server is running');
})


async function run() {
  try {
    await client.connect();

    const db = client.db('dailyfixdb');
    const usersCollection = db.collection('users');
    const servicesCollection = db.collection("services");


    app.post('/users', async(req, res) =>{
        const newUser = req.body;
        const email = req.body.email;
        const query = {email: email}
        const existingUser = await usersCollection.findOne(query);
        if(existingUser){
            res.send('User already exists. Do not need to insert again.')
        }
        else{
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        }
    })

    
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const title = newService.serviceTitle;

      const query = { serviceTitle: title };
      const existingService = await servicesCollection.findOne(query);

      if (existingService) {
        res.send("Service already exists. Do not insert again.");
      } else {
        const result = await servicesCollection.insertOne(newService);
        res.send(result);
      }
    });

    app.get('/users/', async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/services", async (req, res) => {
      const cursor = await servicesCollection.find({});
      const result = await cursor.toArray()
      res.send(result);
    });

    app.get('/users/:uid', async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
    
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Smart server is running on port: ${port}`)
})

