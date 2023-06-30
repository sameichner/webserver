const express = require('express');
const path = require('node:path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

const app = express()
const port = 8000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.use('/static', express.static('public'));

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

