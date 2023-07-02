const express = require('express');
const path = require('node:path');
const session = require('express-session')
const dotenv = require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const dbcon = mysql.createConnection({
    host:       process.env.SQLHOST,
    user:       process.env.SQLUSER,
    password:   process.env.SQLPASS,
    database:   process.env.SQLDB
});

const hashCost = 11;
// change over time as computers get faster

const app = express()
const port = 8000;

app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/login.html'))
});

app.use('/static', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.post('/auth/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        dbcon.query('SELECT username FROM logins WHERE username = ?', username,
        (err, result) => {
            if (err) throw err;
            if (result.length) {
                res.status(403).send('This username is already taken!');
                return;
            }
            bcrypt.hash(password, hashCost, (err, hashResult)=>{
                if (err) throw err;
                dbcon.query('INSERT INTO logins VALUES (0, ?, ?)', [username, hashResult], 
                    (err, result) => {
                        if (err) throw err;
                        res.status(201).send('Sucessfully Registered!');
            });
        });
    });

    } else {
        res.status(400).send('Username and password must not be empty!');
    }
});

app.post('/auth/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        dbcon.query('SELECT * FROM logins WHERE username = ?', username, 
            (err, result) => {
                if (err) throw err;
                switch (result.length) {
                    case 0:
                        res.status(401).send('Incorrect username or password!');
                        return;
                    case 1:
                        bcrypt.compare(password, result[0].password, (err, hashmatch)=>{
                            if (err) throw err;
                            if (hashmatch) {
                                res.status(302).send('Successful Login!');
                                // more login stuff should go here (session)
                            } else {
                                res.status(401).send('Incorrect username or password!');
                            }
                        });
                        return;
                    default:
                        console.log('DB is doing something weird\n');
                        console.log(result);
                        console.log(req);
                        res.status(500).send('Multiple users exist with those credentials somehow, please contact site owner as to how this happened!');
                }
            }
        );
    } else {
        res.status(400).send('Username and password must not be empty!');
    }
});

app.listen(port, () => {
    dbcon.connect(((err)=>{
        if (err) throw err;
        console.log('DB Connected Successfully!');
    }));
    console.log(`App listening on port ${port}`);
});

