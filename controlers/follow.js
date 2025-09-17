console.log('[controllers/follow] loading module');
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje de prueba desde controllers/follow.js'
    });
}

console.log('[controllers/follow] typeof pruebaFollow:', typeof pruebaFollow);
module.exports = {
    pruebaFollow
};
console.log('[controllers/follow] export keys:', Object.keys(module.exports));