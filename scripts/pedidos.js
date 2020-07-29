const sql = require('mysql2');
const sequelize = require('sequelize');
const Sequelize = new sequelize('mysql://root:@localhost:3306/delilah_resto');
const pedidos = require('express').Router();
const bodyparser = require('body-parser');
const firma = "delilahresto";
const jwt = require('jsonwebtoken');

pedidos.use(bodyparser.json());

/*CREA LOS PEDIDOS EN BASE A LOS ID QUE PASARE AL LOCAL STORAGE, FUNCIONA*/ 
pedidos.post('/pedidos', async (req,res) => {
    let token = req.headers.authorization;
    let decode = jwt.verify(token, firma, function (error, usuario){
        if(error){
            res.status(401).send("token invalido");
        }else{
            return (usuario);
        }
    });
    let cantidad = req.body.cantidad;
    let id = req.body.id;
    let hoy = new Date();
    let hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    let datospedido = await Sequelize.query('INSERT INTO pedidos (user_fullname , user_telefono , user_adress , hora) VALUES (?, ?, ?, ?)',
    {replacements:[decode.fullname ,decode.telefono ,decode.adress , hora]})
    .then(function(res){
        console.log(res);
        return res
    });
    /*CREA LOS PRODUCTOS QUE ENVIARE EN EL PEDIDO MAS SU CANTIDAD, FUNCIONA*/
    for (let index = 0; index < id.length && cantidad.length; index++) {
        await Sequelize.query('INSERT INTO productosxpedidos (id_producto, id_pedido, cantidad) VALUES (?, ?, ?)',
        {replacements:[id[index], datospedido[0], cantidad[index]]})
        .then(function(res){
            console.log(res);
        })
    }
    res.status(201).send("este pedido fue creado con exito");    
    
});

/*utiliza el token para que el unico que pueda cambiar el estado sea el administrador*/ 
const  autadmin = async (req,res,next) =>{
    let token =  req.headers.authorization;
    try {
        decode = jwt.verify(token, firma);
        if(decode){
            req.usuario = decode
            next();
        }else{
            throw "Sin permiso";
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({msj: 'Login inválido'})
    }
};


/*MODIFICA EL ESTADO DEL PEDIDO, FUNCIONA*/ 
pedidos.put('/update',autadmin, async (req,res)=>{
    if(!req.body.estado || !req.query.id){
        res.status(400).send("faltan requisitos en el pedido")
    }
    else if(req.body.estado == "nuevo" || req.body.estado == "confirmado" || req.body.estado == "preparando" || req.body.estado == "enviando"
    || req.body.estado == "entregado"){
    await Sequelize.query('UPDATE pedidos SET estado = ? WHERE id = ?',
    {replacements:[req.body.estado , req.query.id]})
    .then(function(res){
        console.log(res);
    });
    res.status(200).send("el pedido fue actualizado");
    }
    else{
        res.status(404).send("los datos no son correctos");
    }
});

/*DEVUELVE LOS PEDIDOS, FUNCIONA*/
pedidos.get('/get-pedidos', autadmin, async(req,res) =>{
    let datos = await Sequelize.query('SELECT * FROM productosxpedidos JOIN pedidos ON pedidos.id = productosxpedidos.id_pedido JOIN productos ON productos.id = productosxpedidos.id_producto',
    {type: Sequelize.QueryTypes.SELECT})
    .then(function(res) {
        return res;
    })
    console.log(datos);
    res.status(201).send({"datos": datos});
})

/*BORRAR LOS PEDIDOS, FUNCIONA*/
pedidos.delete('/delete', autadmin, async(req,res)=>{
    let datos = await Sequelize.query('DELETE FROM pedidos WHERE id = ?',
    {replacements:[req.query.id]});
    let datos1 = await Sequelize.query('DELETE FROM productosxpedidos WHERE id_pedido = ?',
    {replacements:[req.query.id]});
    res.status(201).send('el pedido fue eliminado')
    
})






module.exports = pedidos;