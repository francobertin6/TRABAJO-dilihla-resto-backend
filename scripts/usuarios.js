const sql = require('mysql2');
const sequelize = require('sequelize');
const Sequelize = new sequelize('mysql://root:@localhost:3306/delilah_resto');
const usuarios = require('express').Router();
const bodyparser = require('body-parser');
const firma = "delilahresto";
const jwt = require('jsonwebtoken');
usuarios.use(bodyparser.json());

async function createuser(username, fullname, email, tel, adress, password){
    let datos = await Sequelize.query('INSERT INTO usuarios (username, fullname, email, tel, adress, password) VALUES (?, ?, ?, ?, ?, ?)',
    {replacements:[username, fullname, email, tel, adress, password ]})
    .then(function(resultados){
        return resultados;
    });
    return datos
}

async function checked(username,email){
    let user;
    let mail;

    let datos1 = await Sequelize.query('SELECT * FROM usuarios WHERE email = ?',
    {replacements:[email], type: Sequelize.QueryTypes.SELECT })
    .then(function(res1){
        if(res1[0]==null){
            mail=true;
        }
        else{
            mail=false;
        }
    });

    let datos2 = await Sequelize.query('SELECT * FROM usuarios WHERE username = ?',
    {replacements:[username], type: Sequelize.QueryTypes.SELECT })
    .then(function(res2){
        if(res2[0]==null){
            user=true;
        }
        else{
            user=false; 
            
        }
    });
    if(user === false || mail === false){
        console.log("usuario o mail ya registrado")
    }else{
        return true
    }
    }
/*con este se registran usuarios, FUNCIONA*/
usuarios.post('/usuarios', async (req,res) => {
   if(!req.body.username || !req.body.fullname || !req.body.email || !req.body.tel || !req.body.adress || !req.body.password){
       res.status(500).send('te faltan parametros');
   }
   else if(req.body.tel === isNaN){
       res.status(401).send("solo numeros deben ser aceptados en este campo");
   }
   let check = await checked(req.body.username, req.body.email)
   if(check === true){
   await createuser(req.body.username, req.body.fullname , req.body.email , req.body.tel, req.body.adress, req.body.password);
   res.status(201).send('usuario creado');}
});

/*con esto se loguea los usuarios o administracion, FUNCIONA*/
usuarios.post('/login', async (req,res) => {
    let password = req.body.password;
    let username = req.body.username;
    let datos = await Sequelize.query('SELECT * FROM usuarios WHERE username = ?',
    {replacements:[username], type:Sequelize.QueryTypes.SELECT});
        console.log(datos[0].username, datos[0].password, datos[0].usertype);

        if(datos[0].password !== password && datos[0].username !== username){
            res.status(404).send("usuario o contraseña es invalido");
        }
        else if(datos[0].usertype === "admin"){
        let admintoken = {
            "username" : datos[0].username,
            "usertype" : datos[0].usertype
        }
        let sign = jwt.sign(admintoken,firma);
        res.status(201).send("tokenadmin: "+sign);
        }else if(datos[0].usertype === "user"){
            let usertoken ={
                "id": datos[0].id,
                "username": datos[0].username,
                "fullname": datos[0].fullname,
                "email": datos[0].email,
                "telefono": datos[0].tel,
                "adress": datos[0].adress,
                "usertype": datos[0].usertype
            }
            let signuser = jwt.sign(usertoken,firma);
            res.status(200).send("tokenusuario: "+signuser);
        }
    });


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
    /*borra usuarios, solo si sos admin, FUNCIONA*/ 
    usuarios.delete('/delete', autadmin, async(req,res) =>{
        let id = req.body.id;
        if(!req.body.id){
            res.status(404).send('no se ha seleccionado el usuario a borrar');
        } 
        else if (id.length !== 1){
            for (let index = 0; index < id.length; index++) {
                await Sequelize.query('DELETE FROM usuarios WHERE id = ?',
                {replacements:[id[index]]})
                .then(function(res){
                    console.log(res);
                })
                console.log( id[index] + ' se ha eliminado' )
                
            }
            res.status(201).send('los usuarios se han eliminado');
        }
        else if(id.length == 1){
            await Sequelize.query('DELETE FROM usuarios WHERE id = ?',
            {replacements:[id]})
            .then(function(res){
                console.log(res);
            })
            console.log('el usuario '+ id + ' se ha eliminado');
            res.status(201).send('el usuario se ha eliminado');
        }
    })


module.exports = usuarios;