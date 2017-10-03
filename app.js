var express = require('express');
var mysql = require('mysql');
var sessions = require('client-sessions');
var bodyParser = require('body-parser');
var joi= require("joi");
var validation=require('./validation');
var con = mysql.createConnection({
    host: "db2.ccvrssydyenj.us-east-1.rds.amazonaws.com",
    user: "autoy",
    password: "dbpasswd",
    database: "project2"
});
con.connect(function (err) {
    if (err) {
        throw err;
    }
    else {
        console.log("Database connection success!");
    }
});
var invalidity={message: "The input you provided is not valid"};
var mess = {message: "There seems to be an issue with the username/password combination that you entered"};
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessions({
    cookieName: 'cookie_project2',
    secret: 'faefjwofaihahawoeifhaifwahfeo',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 15 * 60 * 1000
}));
app.post('/registerUser',function (req, res) {

    var re = joi.validate(req.body, validation.register);
    if (re.error !== null) {
        res.send(invalidity);
        return
    }
    var admincheck = "SELECT * FROM admin WHERE username=\'" + req.body.username + "\'";
    con.query(admincheck, function (err, result) {
        if (result.length > 0) {
            res.send((invalidity));
            return;
        }
        var searcher = "SELECT * FROM customers WHERE username=\'" + req.body.username + "\'";
        con.query(searcher, function (err, result) {
            if (err || result.length > 0) {
                res.send(invalidity);
                return;
            }
            var insert = "INSERT INTO customers values(\'" + req.body.fname + "\',\'" + req.body.lname + "\',\'";
            insert += req.body.address + "\',\'" + req.body.city + "\',\'" + req.body.state + "\',\'" + req.body.zip + "\',\'";
            insert += req.body.email + "\',\'" + req.body.username + "\',\'" + req.body.password + "\')";
            con.query(insert);
            res.send({message: req.body.fname + " was registered successfully"});
        });
    });

});

app.post('/login', function (req, res) {
    var re = joi.validate(req.body, validation.login);
    if (re.error !== null) {
        res.send(mess);
        return
    }
    var query = "SELECT * FROM customers WHERE username=\'" + req.body.username + "\'";
    con.query(query, function (err, result) {
        if (err || result.length > 0 && result[0].password !== req.body.password) {
            res.send(mess);
        } else if (result.length === 0) {
            var searcher = "SELECT * FROM admin WHERE username=\'" + req.body.username + "\'";
            con.query(searcher, function (err, result) {
                if (err || result.length === 0 || result[0].password !== req.body.password) {
                    res.send(mess);
                    return;
                }
                req.cookie_project2.login = true;
                req.cookie_project2.admin = true;
                req.cookie_project2.username=req.body.username;
                res.send({message: "Welcome " + result[0].fname})
            });
        } else {
            req.cookie_project2.login = true;
            req.cookie_project2.admin = false;
            req.cookie_project2.username=req.body.username;
            res.send({message: "Welcome " + result[0].fname})
        }
    });
});
app.post('/logout', function (req, res) {
    if (req.cookie_project2.login) {
        req.cookie_project2.login = false;
        res.send({"message": "You have been successfully logged out"})
    } else {
        res.send({"message": "You are not currently logged in"})
    }
});
app.post('/updateInfo',function(req,res){
    if(!req.cookie_project2.login){
        res.send({"message":"You are not currently logged in"});
        return
    }
    var query = "SELECT * FROM customers WHERE username=\'" + req.cookie_project2.username + "\'";
    con.query(query, function (err, result) {
        if(result.length===0 ){
            res.send({"message":"The input you provided is not valid"});
            return
        }
        var update="UPDATE customers SET ";

        if(req.body.hasOwnProperty('fname'))
            update+="fname = \'"+req.body.fname+"\',";
        if(req.body.hasOwnProperty('lname'))
            update+="lname = \'"+req.body.lname+"\',";
        if(req.body.hasOwnProperty('address'))
            update+="address = \'"+req.body.address+"\',";
        if(req.body.hasOwnProperty('city'))
            update+="city = \'"+req.body.city+"\',";
        if(req.body.hasOwnProperty('state'))
            update+="state = \'"+req.body.state+"\',";
        if(req.body.hasOwnProperty('zip'))
            update+="zip = \'"+req.body.zip+"\',";
        if(req.body.hasOwnProperty('email'))
            update+="email = \'"+req.body.email+"\',";
        if(update.charAt(update.length-1)===',')
            update=update.substring(0,update.length-1);
        update+= "WHERE username=\'"+req.cookie_project2.username+"\'";
        console.log(update);
        con.query(update);
        res.send({"message": result[0].fname+" your information was successfully updated"})
    });
});
app.post('/addProducts',function (req, res) {
    if (!req.cookie_project2.login){
        res.send({"message":"You are not currently logged in"});
        return
    }
    if(!req.cookie_project2.admin){
        res.send({message:"You must be an admin to perform this action"});
        return
    }
    var re = joi.validate(req.body, validation.product);
    if (re.error !== null) {
        res.send(mess);
        return
    }
    var query = "SELECT * FROM products WHERE asin=\'" + req.body.asin + "\'";
    con.query(query,function (err, result) {
        if(err||result.length!==0){
            res.send(mess);
            return;
        }
        var insert="INSERT INTO products VALUES (\'"+req.body.asin+"\',\'"+req.body.productName;
        insert+="\',\'"+req.body.productDescription+"\',\'"+req.body.grup+'\')';
        con.query(insert);
        res.send({message:req.body.productName+" was successfully added to the system"})
    })

});
app.post('/modifyProduct',function (req, res) {
    if (!req.cookie_project2.login){
        res.send({"message":"You are not currently logged in"});
        return
    }
    if(!req.cookie_project2.admin){
        res.send({message:"You must be an admin to perform this action"});
        return
    }
    var re = joi.validate(req.body, validation.product);
    if (re.error !== null) {
        res.send(mess);
        return
    }
    var query = "SELECT * FROM products WHERE asin=\'" + req.body.asin+ "\'";
    con.query(query,function (err, result) {
        if(err||result.length!==1){
            res.send(mess);
            return;
        }
        var update="UPDATE products set name=\'"+req.body.productName;
        update+="\',description=\'"+req.body.productDescription+"\',grup=\'"+req.body.group+'\' WHERE asin=\''+req.body.asin+"\'";
        con.query(update);
        res.send({message:req.body.productName+" was successfully updated"});
    })

});
app.post('/viewUsers',function (req, res) {
    if (!req.cookie_project2.login){
        res.send({"message":"You are not currently logged in"});
        return
    }
    if(!req.cookie_project2.admin){
        res.send({message:"You must be an admin to perform this action"});
        return
    }
    var query= "SELECT fname,lname,username FROM customers ";
    if(req.body.hasOwnProperty("fname")&&req.body.hasOwnProperty("lname")){
        query+="WHERE fname LIKE \'%"+req.body.fname+"%\' AND lname LIKE \'%" +req.body.lname+"%\'";
    }else if(req.body.hasOwnProperty("fname")){
        query+="WHERE fname LIKE \'%"+req.body.fname+"%\'";
    }else if(req.body.hasOwnProperty("lname")){
        query+="WHERE lname LIKE \'%"+req.body.lname+"%\'";
    }

    con.query(query,function(err,result){
        if(err||result.length===0){
            res.send(mess);
            return;
        }
        var list={message:"The action was successful",user:[]};
        result.forEach(function (t) {
            list.user.push({fname:t.fname,lname:t.lname,userId:t.username})
        });
        res.send(list);
    });

});
app.post('/viewProducts',function (req, res) {
    var query= "SELECT asin,name FROM products ";
    var condition="";
    if(req.body.hasOwnProperty("asin")){
        condition+= "asin =\'"+req.body.asin+"\'";
    }
    if(req.body.hasOwnProperty("group")){
        if(condition!==""){
            condition+="AND ";
        }
        condition+="grup =\'"+req.body.group+"\'";
    }
    if(req.body.hasOwnProperty("keyword")){
        if(condition!==""){
            condition+="AND ";
        }
        condition+="(name like \'%"+req.body.keyword+"%\' OR description like\'%"+req.body.keyword+"%\')"
    }

    if(condition!==""){
        query+="WHERE "+condition;
    }
    console.log(query);
    con.query(query,function(err,result){
        if(err||result.length===0){
            res.send({message:"There are no products that match that criteria"});
            return;
        }
        var list={product:[]};
        result.forEach(function (t) {
            list.product.push({asin:t.asin,productName:t.name})
        });
        res.send(list);
    });
});
var server = app.listen(8082, function () {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log("Example app listening at %s", bind)
});
