//importar dependencias
const conection = require('./Database/conection');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

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
app.use(express.json({ type: ["application/json", "application/*+json"] }));
// fallback para requests con Content-Type text/* (ej. clientes mal configurados)
app.use(express.text({ type: ["text/*"] }));
app.use(express.urlencoded({ extended: true }));

// logging de requests para diagnostico
app.use((req, res, next) => {
    const ct = req.headers['content-type'] || 'n/a';
    const cl = req.headers['content-length'] || 'n/a';
    console.log(`[REQ] ${req.method} ${req.originalUrl} CT=${ct} Len=${cl}`);
    if (["POST","PUT","PATCH"].includes(req.method)) {
        console.log('[BODY]', req.body);
    }
    next();
});

// Normalizar cuerpos enviados como texto intentando parsear JSON
app.use((req, res, next) => {
    if (typeof req.body === 'string') {
        try {
            const parsed = JSON.parse(req.body);
            req.body = parsed;
        } catch (e) {
            // dejar como string si no es JSON válido
        }
    }
    next();
});

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

// servir frontend estatico
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
// servir archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// asegurar carpetas de subida
const uploadsRoot = path.join(__dirname, 'uploads');
const publicationsDir = path.join(uploadsRoot, 'publications');
const avatarsDir = path.join(uploadsRoot, 'avatars');
try {
    if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
    if (!fs.existsSync(publicationsDir)) fs.mkdirSync(publicationsDir);
    if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
} catch (e) {
    console.error('No se pudieron crear directorios de uploads:', e.message);
}

//ruta de prueba
app.get('/ruta-prueba', (req, res) => {
    res.status(200).send('Hola mundo desde mi red social');
});

//poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});