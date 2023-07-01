const express = require('express');
const path = require('node:path');
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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.use('/static', express.static('public'));

app.listen(port, () => {
    dbcon.connect(((err)=>{
        if (err) throw err;
        console.log('DB Connected Successfully!');
    }));
    console.log(`App listening on port ${port}`);
});

