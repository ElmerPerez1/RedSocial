const mongoose = require('mongoose');

const conection = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/redsocial', {
          
            
        });
        console.log('Conexión exitosa a la base de datos');
    } catch (error) {
        console.log('Error al conectar a la base de datos:', error);
    }
};

module.exports = conection;
