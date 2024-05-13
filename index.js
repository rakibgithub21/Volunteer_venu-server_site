const express = require('express');
const cors = require('cors');
require('dotenv').config()

// for jwt and set cookie
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')


const port = process.env.PORT || 5000;
const app = express()


const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}






app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vq4rqer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const volunteerPostCollection = client.db('volunteerVenue').collection('postVolunteer')
const beAVolunteerCollection = client.db('volunteerVenue').collection('beVolunteer')

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();



        // jwt token generate:

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '15d'
            })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
                })
                .send({ success: true })
        })

        // clear token on logout

        app.get('/logout', (req, res) => {
            res
                .clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    maxAge:0
                })
                .send({ success: true })
        })















        // find({ deadline: { $gte: new Date() } })
        app.get('/volunteer', async (req, res) => {
            const result = await volunteerPostCollection.find()
                .sort({ deadline: 1 })
                .limit(6)
                .toArray()
            res.send(result)
        })



        // get all data:
        app.get('/all-volunteer', async (req, res) => {
            const search = req.query.search;
            let query = {
                title: { $regex: search, $options: 'i' }
            }

            const result = await volunteerPostCollection.find(query).toArray()
            res.send(result)
        })


        // get single data:

        app.get('/all', async (req, res) => {
            const result = await volunteerPostCollection.find().toArray()
            res.send(result)
        })

        app.get('/all/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await volunteerPostCollection.findOne(query)
            res.send(result)
        })


        app.patch('/all/:id', async (req, res) => {
            const id = req.params.id;
            // const volunteerNeed = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateOperation = {
                $inc: {
                    volunteerNeed: -1,
                }
            }
            const result = await volunteerPostCollection.updateOne(filter, updateOperation)
            res.json(result)
        })


        app.get('/alls/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'postBy.email': email };
            const result = await volunteerPostCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/all/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await volunteerPostCollection.deleteOne(query)
            res.send(result)

        })

        app.put('/all/:id', async (req, res) => {
            const id = req.params.id;
            const reqBody = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...reqBody,
                },
            }
            const result = await volunteerPostCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


        // post volunteer:
        app.post('/volunteer', async (req, res) => {
            const reqData = req.body;
            const result = await volunteerPostCollection.insertOne(reqData)
            res.send(result)
        })


        // ------------------------------- beAVolunteerCollection ------------------------------------

        app.get('/beVolunteer', async (req, res) => {
            const result = await beAVolunteerCollection.find().toArray()
            res.send(result)
        })

        app.get('/beVolunteer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { 'volunteerDetails.email': email }
            const result = await beAVolunteerCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/beVolunteer/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await beAVolunteerCollection.deleteOne(query)
            res.send(result)
        })


        app.post('/beVolunteer', async (req, res) => {
            const reqData = req.body;
            const result = await beAVolunteerCollection.insertOne(reqData)
            res.send(result)
        })







        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello From Assignment 11 Server..........')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})