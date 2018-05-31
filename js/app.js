const express = require('express');

const app = express();

app.set('view engine', 'pug');
app.use('/static', express.static('css'));
app.use('/static', express.static('images'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('The server is running on port 3000');
});
