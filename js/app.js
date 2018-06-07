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
let following = [];
let messages = [];

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
    if(!err) {
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
    }
});

T.get('friends/list', { count:5 }, function(err, data, response) {
    if(!err) {
        for(let index = 0; index < data.users.length; index++) {
            let follow = {};
            follow.name = data.users[index].name;
            follow.screenName = '@' + data.users[index].screen_name;
            follow.profileImage = data.users[index].profile_image_url;
            following.push(follow);
        }
    }
});

T.get('direct_messages/events/list', { count:5 }, function(err, data, response) {
    if(err) {
        let message = {};
        message.text = data.errors[0].message;
        messages.push(message);
    } else {
        console.log(data);
    }
});

app.get('/', (req, res) => {
    res.render('index', {user, tweets, following, messages} );
});

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
