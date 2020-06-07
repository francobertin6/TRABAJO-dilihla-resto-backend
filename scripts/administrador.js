const jwt = require('jsonwebtoken');
const sql = require('mysql2');
const sequelize = require('sequelize');
const Sequelize = new sequelize('mysql://root:@localhost:3306/delilah_resto');
const admin = require('express').Router();
const bodyparser = require('body-parser');
const firma = "delilahresto";



admin.use(bodyparser.json());

/*se creara un administrador desde la pagina de administrador, FUNCIONA*/
async function createadmin(username, password, usertype){
    let datos = await Sequelize.query('INSERT INTO usuarios (username, fullname, email, tel, adress, password, usertype) VALUES (?, null, null, null, null, ?, admin)',
    {replacements:[username,password]})
    .then(function(resultados){
        return resultados;
    });
    return datos
}
admin.post('/crearadmin', async (req,res) =>{
   await createadmin(req.body.username, req.body.password)
   res.status(201).send('administrador ingresado correctamente');
});




module.exports = admin;