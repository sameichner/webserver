const express = require('express');
const path = require('node:path');
const session = require('express-session')
const dotenv = require('dotenv').config();
const mysql = require('mysql2');

const dbcon = mysql.createConnection({
    host:       process.env.SQLHOST,
    user:       process.env.SQLUSER,
    password:   process.env.SQLPASS,
    database:   process.env.SQLDB
});

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
        dbcon.query(`INSERT INTO logins VALUES (0, ?, ?)`, [username, password], 
            (err, result) => {
                if (err) {
                    if ((err.code) == 'ER_DUP_ENTRY') {
                        res.send('This username is already taken!');
                        return;
                    } else throw err;
                } else {
                    res.send('Sucessfully Registered!');
                }
            }
        );
    }
});

app.listen(port, () => {
    dbcon.connect(((err)=>{
        if (err) throw err;
        console.log('DB Connected Successfully!');
    }));
    console.log(`App listening on port ${port}`);
});

