# Twitter-Interface

Use Node.js and Express to retrieve information from your Twitter account. Use Twitter's REST API to communicate with Twitter, retrieve JSON data, and display the results using a HTML template.

# Instructions
1) Create a config.js file in the root folder.  Paste in the following code inserting your own Twitter Keys and Access Tokens:

```JavaScript
const config = {
  consumer_key: 'Your Consumer Key',
  consumer_secret: 'Your Consumer Secret',
  access_token: 'Your Access Token',
  access_token_secret: 'Your Access Token Secret'
};
module.exports = config;
```
2) npm install
3) nodemon or npm start

