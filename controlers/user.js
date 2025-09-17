const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: 'Mensaje de prueba desde controllers/user.js'
    });
}

module.exports = {
    pruebaUser
};