const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow");
const { auth } = require("../middlewares/auth");

// Endpoints
router.post("/follow/:id", auth, followController.followUser);
router.delete("/unfollow/:id", auth, followController.unfollowUser);
router.get("/followers/:id", auth, followController.followers);
router.get("/following/:id", auth, followController.following);

module.exports = router;
