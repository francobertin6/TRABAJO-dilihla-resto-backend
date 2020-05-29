const express = require('express');
const server = express();
const bodyparser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');


server.listen(3000, ()=>{
    console.log("se a iniciado el servidor");
});
server.use(bodyparser.json());

//importacion
    const admin = require('./scripts/administrador');
    const pedidos = require('./scripts/pedidos');
    const productos = require('./scripts/productos');
    const usuarios = require('./scripts/usuarios');
    

//endpoint
    server.use(cors());
    server.use('/user', usuarios);
    server.use('/productos', productos);
    server.use('/admin', admin);
    server.use('/pedidos', pedidos);
  
