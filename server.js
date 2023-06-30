const express = require('express');
const path = require('node:path');
const cookieSession = require('cookie-session');

const app = express()
const port = 8000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.get('/favicon.ico', (req, res) => {
    res.sendStatus(404);
})

//TODO: THIS (FAKE) SECRET WILL BE IN THE GIT GO CHANGE IT IN PRODUCTION
app.use(cookieSession({secret: 'nuh uh'}));

app.get('/revival', (req, res) => {
    req.session.lives = 3;
    res.send('Be Reborn!');
});

app.use((req, res, next) => {
    if (!req.session.lives) res.send('You are dead. No touching.');
    else next();
})

app.use((req, res) => {
    req.session.lives = (req.session.lives ?? 3) - 1;
    res.send(`${req.session.lives} Lives Remaining!`);
    console.log(`${req.session.lives} Lives Remaining on User!`);
});

app.use('/static', express.static('public'));

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});

