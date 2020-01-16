// import express from 'express';
express = require('express')
let ejs = require('ejs')
const app = express()
app.set('view engine', 'ejs');



app.get('/', (req, res) => {
    // res.send('Hello World')
    res.render('pages/index');
});

app.post('/storeauth', (req, res) => {
    var code_secret = req.body
    console.log(req.body)
    res.send("asdf")
})

app.listen(5656, () => {
    console.log('http://localhost:5656')
})

