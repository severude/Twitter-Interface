const express = require('express');
const router = express.Router();
const Twit = require('twit');
const config = require('./config');

// User authentication information stored in config.js
let T = new Twit({
    consumer_key:         config.consumer_key,
    consumer_secret:      config.consumer_secret,
    access_token:         config.access_token,
    access_token_secret:  config.access_token_secret,
});

// Storage for user information
let user = {};
let tweets = [];
let following = [];
let messages = [];

// Get the user profile
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

// Get the user's last 5 tweets
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

// Get five of the user's friends
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

// Get five of the user's direct messages
T.get('direct_messages/events/list', { count:5 }, function(err, data, response) {
    if(err) {
        let message = {};
        message.text = data.errors[0].message;
        messages.push(message);
    } else {
        console.log(data);
    }
});

// Post a new tweet when form button is clicked
router.post('/', (req, res) => {
    const tweet = req.body.status;
    T.post('statuses/update', { status: tweet }, function(err, data, response) {
    });
    res.redirect('/');
});

// Render home page route with all captured user data
router.get('/', (req, res) => {
    res.render('index', {user, tweets, following, messages} );
});

module.exports = router;