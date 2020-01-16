// import express from 'express';
express = require('express')
let ejs = require('ejs')
const app = express()
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
    // res.send('Hello World')
    res.render('pages/index');
});

app.get('/assignments', (req, res) => {
    res.render('pages/planner');
});

app.listen(5656, () => {
    console.log('http://localhost:5656')
})

