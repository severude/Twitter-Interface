const express = require('express');
const config = require('./config');
const Twit = require('twit');

const app = express();

app.set('view engine', 'pug');
app.use('/static', express.static('css'));
app.use('/static', express.static('images'));

let T = new Twit({
    consumer_key:         config.consumer_key,
    consumer_secret:      config.consumer_secret,
    access_token:         config.access_token,
    access_token_secret:  config.access_token_secret,
});

let user = {};

T.get('account/verify_credentials', { skip_status: true })
.catch(function (err) {
    console.log('caught error', err.stack)
})
.then(function (result) {
    user.name = result.data.name;
    user.screenName = '@' + result.data.screen_name;
    user.profileImage = result.data.profile_image_url;
    user.bannerImage = result.data.profile_banner_url;
});

app.get('/', (req, res) => {
    res.render('index', user);
});

app.listen(3000, () => {
    console.log('The server is running on port 3000');
});
