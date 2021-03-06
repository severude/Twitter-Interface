// Routing declarations
const express = require('express');
const router = express.Router();
const Twit = require('twit');
const config = require('../config');

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
    console.log('Error retrieving user profile: ', err.stack)
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
    } else {
        console.log('Error retrieving tweets: ' + err.stack);
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
    } else {
        console.log('Error retrieving friends: ' + err.stack);
    }
});

// Get five of the user's direct messages
T.get('direct_messages/events/list', { count: 8 }, function(err, data, response) {
    if(!err) {
        for(let index = 0; index < data.events.length; index++) {
            let message = {};
            message.text = data.events[index].message_create.message_data.text;
            let timestamp = parseInt(data.events[index].created_timestamp);
            let date = new Date(timestamp).toString();
            message.time = date.slice(4,10) + ' ' + date.slice(16,25);
            message.id = data.events[index].message_create.sender_id;
            // Capture message user profile info
            T.get(`https://api.twitter.com/1.1/users/show.json?user_id=${message.id}`, function (err, profile, response) {
                message.user = profile.name;
                message.image = profile.profile_image_url;
              });
            messages.push(message);
        }
    } else {
        console.log('Error retrieving messages: ' + err.stack);
    }
});

// Post a new tweet
router.post('/', (req, res) => {
    let newTweet = req.body.status;
    T.post('statuses/update', { status: newTweet}, function(err, data, response) {
        if(err) {
            console.log('Error posting tweet: ' + err.stack);
        }
    });

    // Render the new tweet
    let tweet = {};
    let date = new Date().toString();
    tweet.date = date.slice(4,10);
    tweet.text = newTweet;
    tweet.retweet = 0;
    tweet.favorite = 0;
    tweet.name = user.name;
    tweet.screenName = user.screenName;
    tweet.profileImage = user.profileImage;
    tweets.pop();
    tweets.unshift(tweet);

    res.redirect('back');
});

// Render home page route with all captured user data
router.get('/', (req, res) => {
    res.render('index', {user, tweets, following, messages} );
});

module.exports = router;