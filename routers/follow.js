const express = require('express');
const router = express.Router();
const followController = require('../controlers/follow');

//Rutas de prueba
// Debug: verify the controller export and handler type
console.log('DEBUG followController keys:', Object.keys(followController));
console.log('DEBUG typeof followController.pruebaFollow:', typeof followController.pruebaFollow);
router.get('/prueba-follow', followController.pruebaFollow);

//exportar router
module.exports = router;