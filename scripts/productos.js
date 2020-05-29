const sql = require('mysql2');
const sequelize = require('sequelize');
const Sequelize = new sequelize('mysql://root:@localhost:3306/delilah_resto');
const productos = require('express').Router();
const bodyparser = require('body-parser');
const firma = "delilahresto";
const jwt = require('jsonwebtoken');
productos.use(bodyparser.json());

async function createproducts(foodname,price,url){  
    let datos = await Sequelize.query('INSERT INTO productos(foodname, price, url) VALUES (?, ?, ?)',
    {replacements:[foodname,price,url]})
    .then(function(res) {
        return res;
    });
    return datos
};
/*autenticacion token de admin*/
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
/*creo productos, FUNCIONA*/
productos.post('/post',autadmin, async(req,res)=>{
    if(!req.body.foodname || !req.body.price || !req.body.url){
        res.status(404).send("no se cumplen todos los parametros")
    }else{
    await createproducts(req.body.foodname, req.body.price, req.body.url);
    res.status(201).send('tu producto fue agregado');
    }
});


/*modifico productos, FUNCIONA*/ 
productos.put('/put/:id/:value',autadmin, async(req,res)=>{
    const values = req.params.value 
    const id = req.params.id;
    const {value} = req.query
    await Sequelize.query('UPDATE productos SET '+ values+' = ? WHERE id = '+ id ,
        {replacements:[req.query.value]})
        .then(function(res){
            return res
        }); 
        res.status(201).send('tu producto fue modificado');      
});

/*borro productos, FUNCIONA*/
productos.delete('/delete',autadmin, async(req,res)=>{
    const {id} = req.query;
    await Sequelize.query('DELETE FROM productos WHERE id = ?',
    {replacements:[req.query.id]})
    .then(function (res){
        return res
    });
    res.status(201).send('tu producto fue eliminado');
});

/*obtengo los productos, FUNCIONA*/
productos.get('/get', async(req,res)=>{
    let datos = await Sequelize.query('SELECT * FROM productos',
    {type: Sequelize.QueryTypes.SELECT})
    if(datos[0] == undefined){
    res.status(401).send("no hay productos");
    }else{
        res.status(201).send("productos devueltos satisfactoriamente");
        console.log(datos);
    }
})
/*obtengo un producto en especifico, FUNCIONA*/
productos.get('/get/:id', async(req,res)=>{
    let id = req.params.id;
    let datos = await Sequelize.query('SELECT * FROM productos WHERE id = '+ id,
    {type: Sequelize.QueryTypes.SELECT})
    if(datos[0] === undefined){
        res.status(404).send("tu producto no se ha encontrado");
    }else{
        console.log(datos);
        res.status(401).send("producto encontrado");
    }
})



module.exports = productos;