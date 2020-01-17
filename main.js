var http = require('http');
var express = require('express');
var Session = require('express-session');
<<<<<<< Updated upstream
var {google} = require('googleapis');
=======
let ejs = require('ejs')
var { google } = require('googleapis');


//Def's
>>>>>>> Stashed changes
var OAuth2 = google.auth.OAuth2;
const ClientId = "966739472863-dqp2890nk3io6at5pa3l3gatalffst1o.apps.googleusercontent.com";
const ClientSecret = "-NpxE7x-Qqx9k9STFcsr135w";
const RedirectionUrl = "http://localhost:5656/oauthCallback";
 
var app = express();
app.use(Session({
    secret: 'RoryLikesBoys',
    resave: true,
    saveUninitialized: true
}));
 
function getOAuthClient () {
    return new OAuth2(ClientId ,  ClientSecret, RedirectionUrl);
}
 
function getAuthUrl () {
    var oauth2Client = getOAuthClient();
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    var scopes = [
       'https://www.googleapis.com/auth/classroom.courses.readonly'
    ];
 
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes // If you only need one scope you can pass it as string
    });
 
    return url;
}
 
app.use("/oauthCallback", function (req, res) {
    var oauth2Client = getOAuthClient();
    var session = req.session;
    var code = req.query.code;
    oauth2Client.getToken(code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(!err) {
        oauth2Client.setCredentials(tokens);
        session["tokens"]=tokens;
        res.send(`
            <h3>Login successful!!<h3>
            <a href="/details"> Go to details page</a>
        `);
      }
      else{
        res.send(`
            &lt;h3&gt;Login failed!!&lt;/h3&gt;
        `);
      }
    });
});
 
app.use("/details", function (req, res) {
    var oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(req.session["tokens"]);
    listCourses(oauth2Client, res);
 
    // var p = new Promise(function (resolve, reject) {
    //     plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
    //         resolve(response || err);
    //     });
    // }).then(function (data) {
    //     res.send(`
    //         &lt;img src=${data.image.url} /&gt;
    //         &lt;h3&gt;Hello ${data.displayName}&lt;/h3&gt;
    //     `);
    // })
});

/**
 * Lists the first 10 courses the user has access to.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listCourses(auth, page_res) {
  const classroom = google.classroom({version: 'v1', auth});
  classroom.courses.list({
    pageSize: 10,
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const courses = res.data.courses;
    var output = "";
    if (courses && courses.length) {
      console.log('Courses:');
      courses.forEach((course) => {
        // console.log(`${course.name} (${course.id})`);
        output += `${course.name} (${course.id})`;
      });
    } else {
      console.log('No courses found.');
    }
    console.log(output);
    page_res.send(output)
  });
}
 
app.use("/", function (req, res) {
    var url = getAuthUrl();
    res.send(`
        <h1> Authentication using google oAuth</h1>
        <a href=${url}>Login</a>
    `)
});
 
 
var port = 5656;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
    console.log(`listening to ${port}`);
});

