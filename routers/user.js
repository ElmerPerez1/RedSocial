const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

// Endpoints
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", auth, userController.profile);
// Express 5 path-to-regexp can error on optional params. Define both routes explicitly.
router.get("/users", auth, userController.list);
router.get("/users/:page", auth, userController.list);

module.exports = router;
