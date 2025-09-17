const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const publicationController = require("../controllers/publication");
const { auth } = require("../middlewares/auth");

// Configuración de multer para publicaciones
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'publications')),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const base = crypto.randomBytes(16).toString('hex');
		cb(null, `${base}${ext}`);
	}
});
const upload = multer({ storage });

// Endpoints
router.post("/publication", auth, upload.single('file'), publicationController.createPublication);
router.get("/publications/:id", auth, publicationController.userPublications);
router.get("/feed", auth, publicationController.feed);

module.exports = router;
