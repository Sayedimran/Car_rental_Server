const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.port || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();


// middle were


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucqbn.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const rentCollection = client.db('rentalCar').collection('cars')
        const bookingsCollection = client.db('rentalCar').collection('bookings');


        app.get('/cars', async (req, res) => {
            const cursor = rentCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })


        app.post('/addCars', async (req, res) => {
            const carsData = req.body

            const result = await rentCollection.insertOne(carsData)

            res.send(result)
        })

        app.get('/my-cars', async (req, res) => {
            const email = req.query.email;
            const result = await rentCollection.find({ email: email }).toArray()
            res.send(result)
        })

        // Delate Cars 
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid ID format' });
            }
            const query = { _id: new ObjectId(id) };
            const result = await rentCollection.deleteOne(query);
            res.send(result);
        });

        //    get a car data by id  form db 
        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid ID format' });
            }
            const query = { _id: new ObjectId(id) };
            const result = await rentCollection.findOne(query);
            res.send(result);
        })

        app.put('/updateCars/:id', async (req, res) => {
            const id = req.params.id
            const carsData = req.body
            const updated = {
                $set: carsData
            }

            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }


            const result = await rentCollection.updateOne(query, updated, options)

            res.send(result)
        })

        // my booking  confirm



        app.post("/booking", async (req, res) => {
            const bookingData = req.body;
            const result = await bookingsCollection.insertOne(bookingData)
            res.send(result)
        })

        app.get('/bookedCar', async (req, res) => {
            const email = req.query.userEmail;
            const result = await bookingsCollection.find({ userEmail: email }).toArray()
            res.send(result)
        })

        app.delete('/bookedCar/:id', async (req, res) => {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ error: 'Invalid ID format' });
            }
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        });

        app.patch("/bookedCar/:id", async (req, res) => {
            const id = req.params.id;
            const { startDate, endDate } = req.body;

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { startDate, endDate } }
            );

            res.send(result);
        });

        app.patch("/statusCar/:id", async (req, res) => {
            const id = req.params.id;
            const { status } = req.body;

            const result = await bookingsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "Canceled" } }
            )
        })


    } finally {
        // Ensures that the client will close when you finish
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {

    res.send('SIMPLE CRUD RUNNING PORTs')
})

app.listen(port, () => {
    console.log(`Server running on post ${port}`);

})
