const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { honeypot, timeTaken } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    let score = 0;

    // Honeypot field should remain empty
    if (honeypot) {
      score += 100;
    }

    // Extremely fast submissions are suspicious
    if (timeTaken && timeTaken < 1500) {
      score += 50;
    }

    // Decide human/bot
    if (score >= 100) {
      user.status = "bot";
    } else {
      user.status = "human";
    }

    user.verificationScore = score;

    await user.save();

    res.json({
      message: "Verification completed",
      status: user.status,
      verificationScore: user.verificationScore
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Verification failed"
    });
  }
});

module.exports = router;