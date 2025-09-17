const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication");
const { auth } = require("../middlewares/auth");

// Endpoints
router.post("/publication", auth, publicationController.createPublication);
router.get("/publications/:id", auth, publicationController.userPublications);
router.get("/feed", auth, publicationController.feed);

module.exports = router;
