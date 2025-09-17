//importar dependencias
const conection = require('./Database/conection');
const express = require('express');
const cors = require('cors');

//mensaje de bienvenida
console.log('Bienvenido a mi red social');
//conectar a la base de datos
conection();

//Crear el servidor node
const app = express();
const port = 3900; //puerto de escucha

//cargar rutas

//configurar cors o el middleware 
app.use(cors());    
//convertir los datos del body a objeto js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cargar configuracion de las rutas
const userRoutes = require('./routers/user');
const followRoutes = require('./routers/follow');
const publicationRoutes = require('./routers/publication');
console.log('DEBUG typeof userRoutes:', typeof userRoutes);
console.log('DEBUG typeof followRoutes:', typeof followRoutes);
console.log('DEBUG typeof publicationRoutes:', typeof publicationRoutes);
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes); 

//ruta de prueba
app.get('/ruta-prueba', (req, res) => {
    res.status(200).send('Hola mundo desde mi red social');
});

//poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});