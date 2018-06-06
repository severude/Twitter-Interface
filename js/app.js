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
let tweets = [];

T.get('account/verify_credentials', { skip_status: true })
.catch(function (err) {
    console.log('caught error', err.stack)
})
.then(function (result) {
    user.name = result.data.name;
    user.screenName = '@' + result.data.screen_name;
    user.following = result.data.friends_count;
    user.profileImage = result.data.profile_image_url;
    user.bannerImage = result.data.profile_banner_url;
});

T.get('statuses/user_timeline', { screen_name: user.screenName, count:5 }, function(err, data, response) {
    for(let index = 0; index < data.length; index++) {
        let tweet = {};
        let date = data[index].created_at;
        tweet.date = date.slice(4, 10);
        tweet.text = data[index].text;
        tweet.retweet = data[index].retweet_count;
        tweet.favorite = data[index].favorite_count;
        tweet.name = data[index].user.name;
        tweet.screenName = '@' + data[index].user.screen_name;
        tweet.profileImage = data[index].user.profile_image_url;
        tweets.push(tweet);
    }
});

app.get('/', (req, res) => {
    res.render('index', {user, tweets} );
});

app.listen(3000, () => {
    console.log('The server is running on port 3000');
});
