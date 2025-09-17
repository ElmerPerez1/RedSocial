console.log('[controllers/publication] loading module');
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje de prueba desde controllers/publication.js'
    });
}

console.log('[controllers/publication] typeof pruebaPublication:', typeof pruebaPublication);
module.exports = {
    pruebaPublication
};
console.log('[controllers/publication] export keys:', Object.keys(module.exports));