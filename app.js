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
    var admincheck="SELECT * FROM admin WHERE username=\'" + req.body.username + "\'";
    var searcher ="SELECT * FROM customers WHERE username=\'" + req.body.username + "\'";
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

app.post('/login', function (req, res) {
    var re = joi.validate(req.body, validation.login);
    if (re.error !== null) {
        res.send(mess);
        return
    }
    var query = "SELECT * FROM customers WHERE username=\'" + req.body.username + "\'";
    con.query(query, function (err, result) {
        if (err||result.length !== 1||result[0].password !== req.body.password){
            res.send(mess);
            return;
        }
        if (!req.cookie_project2.login) {
            req.cookie_project2.login = true;
        }
        res.send({message: "Welcome " + result[0].fname })
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
app.post('/updateInfo',function(

));
var server = app.listen(8082, function () {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log("Example app listening at %s", bind)
});