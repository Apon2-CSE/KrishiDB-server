const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
const uri =
  "mongodb+srv://krishi-db:yWg8fWlprpfEvxkN@cluster0.ncssljo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected!");

    const db = client.db("krishi-db");
    const usersCollection = db.collection("users");
    const cropsCollection = db.collection("crops");

    // ✅ Root route
    app.get("/", (req, res) => {
      res.send("🌾 KrishiLink API Running...");
    });

    // 🧑‍🌾 ========== USERS ==========

    // Get all users
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // Add a user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const exists = await usersCollection.findOne({ email: user.email });
        if (exists) {
          return res.status(400).send({ message: "User already exists" });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error adding user", error: err });
      }
    });

    // 🧺 ========== CROPS ==========

    // Get all crops
    app.get("/crops", async (req, res) => {
      const crops = await cropsCollection.find().toArray();
      res.send(crops);
    });

    // Get single crop
    app.get("/crops/:id", async (req, res) => {
      const id = req.params.id;
      const crop = await cropsCollection.findOne({ _id: new ObjectId(id) });
      res.send(crop);
    });

    // Add a crop
    app.post("/crops", async (req, res) => {
      try {
        const crop = req.body;
        const result = await cropsCollection.insertOne(crop);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error adding crop", error: err });
      }
    });

    // Update crop
    app.put("/crops/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const result = await cropsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });

    // Delete crop
    app.delete("/crops/:id", async (req, res) => {
      const id = req.params.id;
      const result = await cropsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ❤️ Add Interest to crop
    app.patch("/crops/:id/interest", async (req, res) => {
      const id = req.params.id;
      const { userEmail, userName, quantity, message } = req.body;

      const interest = {
        userEmail,
        userName,
        quantity,
        message,
        status: "pending",
        createdAt: new Date(),
      };

      const result = await cropsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { interests: interest } }
      );

      res.send(result);
    });

    // Get all interests for one crop
    app.get("/crops/:id/interests", async (req, res) => {
      const id = req.params.id;
      const crop = await cropsCollection.findOne({ _id: new ObjectId(id) });
      res.send(crop?.interests || []);
    });
  } catch (error) {
    console.error("❌ Error connecting MongoDB:", error);
  }
}

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

run();
