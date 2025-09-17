const express = require("express");
const router = express.Router();
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const userController = require("../controllers/user");
const { auth } = require("../middlewares/auth");

// Multer para avatares
const avatarStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'avatars')),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const base = crypto.randomBytes(16).toString('hex');
		cb(null, `${base}${ext}`);
	}
});
const uploadAvatar = multer({ storage: avatarStorage });

// Endpoints
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", auth, userController.profile);
router.patch("/profile", auth, userController.updateProfile);
// Express 5 path-to-regexp can error on optional params. Define both routes explicitly.
router.get("/users", auth, userController.list);
router.get("/users/:page", auth, userController.list);

// Avatar del usuario autenticado
router.post('/avatar', auth, uploadAvatar.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', auth, userController.deleteAvatar);

module.exports = router;
