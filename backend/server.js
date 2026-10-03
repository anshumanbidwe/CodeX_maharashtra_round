const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const verificationRoutes = require("./routes/verification");

const app = express();

app.use(express.json());
app.use("/api/verify", verificationRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

    

app.get("/", (req, res) => {
    res.json({
        message: "Fair Drop backend is running"
    });
});

app.listen(3000, () => {
    console.log("Fair Drop backend running on port 3000");
});

app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already registered"
      });
    }

    const user = await User.create({
      name,
      email
    });

    res.status(201).json({
      message: "Registration successful",
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});