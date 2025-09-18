# RedSocial

Aplicación tipo red social (backend + frontend estático) con:
- Registro e inicio de sesión (JWT)
- Perfiles con avatar y bio editable
- Seguir / dejar de seguir usuarios
- Contadores de seguidores y seguidos
- Publicaciones con texto y archivo multimedia (imagen / video)
- Feed de publicaciones de usuarios seguidos
- Listado de usuarios con avatar y métricas
- Subida y eliminación de avatar (multer)
- Subida de archivos en publicaciones (multer)
- Interfaz responsive y paleta cálida/vibrante

## Tecnologías

Backend:
- Node.js, Express
- MongoDB + Mongoose (paginación)
- JWT para autenticación
- Bcrypt para hash de contraseñas
- Multer para manejo de archivos
- Middleware de autenticación

Frontend:
- HTML, CSS (responsive, tema cálido), JavaScript Vanilla (SPA simple)
- Fetch API + LocalStorage para token

## Estructura

```
RedSocial/
 ├─ controllers/
 │   ├─ user.js
 │   ├─ follow.js
 │   └─ publication.js
 ├─ models/
 │   ├─ user.js
 │   ├─ follow.js
 │   └─ publication.js
 ├─ routers/
 │   ├─ user.js
 │   ├─ follow.js
 │   └─ publication.js
 ├─ services/
 │   └─ jwt.js
 ├─ middleware/
 │   └─ auth.js
 ├─ uploads/
 │   ├─ avatars/
 │   └─ publications/
 ├─ public/
 │   ├─ index.html
 │   ├─ app.js
 │   └─ styles.css
 ├─ index.js
 ├─ package.json
 └─ README.md
```

## Instalación

1. Clonar repositorio
```
git clone <repo-url>
cd RedSocial
```

2. Instalar dependencias
```
npm install
```

3. Variables de entorno (.env sugerido)
```
PORT=3900
MONGODB_URI=mongodb://127.0.0.1:27017/redsocial
JWT_SECRET=clave_super_secreta_cambia_esto
```

4. Iniciar
```
npm start
```
Abrir: http://localhost:3900

### Scripts (ejemplo package.json)

```
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

## Modelos (resumen)

Usuario (User):
- name, surname, nick (único), email (único), password (hash)
- image (string: 'default.png' o /uploads/avatars/...)
- bio (string opcional)
- timestamps

Follow:
- user (seguido por)
- followed (sigue a)
(ObjectId)

Publication:
- user (autor)
- text
- file (ruta /uploads/publications/... opcional)
- created_at

## Autenticación

- JWT Bearer: enviar Header Authorization: Bearer <token>
- Login retorna token y datos básicos
- Middleware valida token en rutas protegidas

## Endpoints (prefijo /api)

Usuarios / Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /register | No | Crear usuario |
| POST | /login | No | Obtener token |
| GET | /profile/:id | Sí | Perfil público |
| PATCH | /profile | Sí | Actualizar bio |
| GET | /users/:page? | Sí | Listar paginado |
| POST | /avatar | Sí | Subir avatar (form-data: avatar) |
| DELETE | /avatar | Sí | Eliminar avatar |

Follow
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /follow/:id | Sí | Seguir |
| DELETE | /follow/:id | Sí | Dejar de seguir |
| GET | /following/:id | Sí | Lista seguidos |
| GET | /followers/:id | Sí | Lista seguidores |

Publicaciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /publication | Sí | Crear (form-data: text, file?) |
| GET | /publications/:id | Sí | Publicaciones de usuario |
| GET | /feed/:page? | Sí | Feed (si implementado) |
| DELETE | /publication/:id | Sí | Eliminar propia (si implementado) |

Archivos estáticos:
- /uploads/avatars/...
- /uploads/publications/...

## Ejemplos

Registro:
```
POST /api/register
Content-Type: application/json
{
  "name": "Juan",
  "surname": "Pérez",
  "nick": "juanp",
  "email": "juan@example.com",
  "password": "123456"
}
```

Login:
```
POST /api/login
{
  "email": "juan@example.com",
  "password": "123456"
}
```

Actualizar bio:
```
PATCH /api/profile
Authorization: Bearer <jwt>
Content-Type: application/json
{ "bio": "Me gusta programar" }
```

Subir avatar:
```
POST /api/avatar
Authorization: Bearer <jwt>
(form-data: avatar=<archivo>)
```

Crear publicación:
```
POST /api/publication
Authorization: Bearer <jwt>
(form-data: text="Hola", file=<opcional>)
```

Seguir:
```
POST /api/follow/<userId>
Authorization: Bearer <jwt>
```

## Frontend (public/)

SPA ligera:
- index.html: secciones (login, registro, feed, usuarios, perfil, publicar)
- app.js: navegación interna, fetch, token, follow/unfollow, publicaciones, avatar, bio
- styles.css: responsive + tema cálido

Flujo:
1. Login/registro
2. Feed (seguidos)
3. Publicar (texto + archivo)
4. Usuarios (avatar + métricas + follow state)
5. Perfil (avatar, bio, publicaciones, contadores)
6. Logout

## Subida de archivos

Multer:
- /uploads/avatars
- /uploads/publications
- Nombres únicos (timestamp + random)
- El avatar previo se elimina (si no es default)

Mejoras sugeridas:
- Validar mime-type (png, jpg, webp, mp4)
- Límites de tamaño (2MB avatar, 10MB publicación)
- Optimizar imágenes (sharp)

## Seguridad

- Password hash con bcrypt (salt 10)
- JWT (renovar periódicamente)
- Sanitizar texto mostrado
- Evitar mensajes que revelen existencia de usuario en login
- Indices únicos en email/nick

## Respuestas y errores

Formato:
```
{ "status": "success", ... }
{ "status": "error", "message": "..." }
```

Códigos esperados:
- 200 OK
- 400 Datos inválidos
- 401 No autorizado
- 404 No encontrado
- 500 Error interno

## Mejoras futuras

Alta:
- Validación fuerte de archivos
- Paginación feed/publicaciones
- Rate limiting auth
- Tests (Jest + Supertest)

Media:
- Editar nombre / nick
- Eliminar publicaciones
- Likes / comentarios
- Buscador usuarios

Baja:
- Notificaciones
- Modo claro/oscuro toggle
- Infinite scroll

## Tests (propuesta)

```
tests/
 ├─ auth.test.js
 ├─ user.test.js
 ├─ follow.test.js
 ├─ publication.test.js
 └─ helpers/
```

Stack: Jest, Supertest, mongodb-memory-server.

## Despliegue

1. Configurar .env seguro
2. Servir estáticos (Nginx reverse proxy)
3. HTTPS obligatorio
4. PM2 para procesos
5. Logs y monitoreo (Winston / Elastic / Grafana)

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| 401 rutas | Falta token | Añadir Authorization |
| Avatar no carga | Ruta mal | Verificar /uploads estático |
| Feed vacío | No sigues | Seguir usuarios |
| Error subir archivo | Campo incorrecto | Usar 'avatar' o 'file' |
| Mongo no conecta | URI | Revisar MONGODB_URI |



## Autor

(Elmer Perez 5090 22 3700)
