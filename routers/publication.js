const express = require('express');
const router = express.Router();
const publicationController = require('../controlers/publication');

//Rutas de prueba
router.get('/prueba-publication', publicationController.pruebaPublication);

//exportar router
console.log('[routers/publication] typeof router before export:', typeof router);
module.exports = router;
console.log('[routers/publication] export set. typeof module.exports:', typeof module.exports);