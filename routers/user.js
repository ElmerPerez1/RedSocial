const express = require('express');
const router = express.Router();
const userController = require('../controlers/user');

//Rutas de prueba
router.get('/prueba-user', userController.pruebaUser);

//exportar router
module.exports = router;