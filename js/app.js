const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'pug');
app.use('/static', express.static('css'));
app.use('/static', express.static('images'));

const routes = require('./routes');
app.use(routes);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
app.use((err, req, res, next) => {
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});
  
app.listen(3000, () => {
    console.log('The server is running on port 3000');
});
