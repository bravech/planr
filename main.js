//Imports
var http = require('http');
var express = require('express');
var Session = require('express-session');
let ejs = require('ejs')
var { google } = require('googleapis');

//Def's
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

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

function getOAuthClient() {
  return new OAuth2(ClientId, ClientSecret, RedirectionUrl);
}

function getAuthUrl() {
  var oauth2Client = getOAuthClient();
  var scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters',
    'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
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
  oauth2Client.getToken(code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
      session["tokens"] = tokens;
      // res.send(`
      //     <h3>Login successful!!<h3>
      //     <a href="/details"> Go to details page</a>
      // `);
      res.redirect('/details')
    }
    else {
      res.send(`
        <h3>Login/redirect failed!!! Try clearing cache and reloading</h3>
        `);
    }
  });
});



app.use("/details", function (req, res) {
  var oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session["tokens"]);
  listCourses(oauth2Client, res);
});

/**
 * Lists the first 10 courses the user has access to.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listCourses(auth, page_res) {
  const classroom = google.classroom({ version: 'v1', auth });
  var res = await classroom.courses.list({ pageSize: 0, courseStates: "ACTIVE" }); // , (err, res) => {
  const courses = res.data.courses;
  var teachers;
  var assignments;
  if (courses && courses.length) {
    console.log('Courses:');
    // courses.forEach((course) => {
    const promises = courses.map(async course => {
      console.log(`${course.name} (${course.id})`);
      var res = await classroom.courses.teachers.list({ courseId: course.id });
      return res.data.teachers[0].profile.name.fullName;
    });

    teachers = await Promise.all(promises);
    console.log(teachers)

    // for (var i = 0; i < courses.length; i++) {
    //   console.log(`${courses[i].name} (${courses[i].id})`);
    //   var res = await classroom.courses.teachers.list({ courseId: courses[i].id });
    //   console.log(res.data.teachers[0].profile.name)
    //   teachers.push(res.data.teachers[0].profile.name.fullName)
    // }

    // });
    const ass_promises = courses.map(async course => {
      var res = await classroom.courses.courseWork.list({ courseId: course.id, orderBy: "dueDate desc", pageSize: 3 });
      // console.log(res);
      var cw_list = [];
      if (res.data.courseWork) {
        res.data.courseWork.forEach(async cw => {
          if (cw.dueDate) {
            var dd = "" + cw.dueDate.month + "/" + cw.dueDate.day;
          } else {
            var dd = "Never";
          }
          // cw_list.push({
          //   name: cw.title,
          //   dueDate: dd,
          //   cw_id: cw.id
          // });
          cw_list.push([cw.title, dd, cw.id, cw.courseId]);
        });
      }
      console.log(cw_list);
      return cw_list;
    });
    assignments = await Promise.all(ass_promises);
    console.log('Courses loaded successfully')
  } else {
    console.log('No courses found.');
  }
  page_res.render('pages/planner', {
    courses: courses,
    names: teachers,
    assignments: assignments
    // async: true
  });
}

app.use("/info", function (req, res) {
  var oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(req.session["tokens"]);
  var work_id = req.query.id;
  var course_id = req.query.courseId;
  console.log("Course ID:", course_id)
  console.log("ClassWork ID:", work_id)
  get_keywords(oauth2Client, res, course_id, work_id);
});

async function get_keywords(auth, page_res, course_id, work_id) {
  const classroom = google.classroom({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });
  const docs = google.docs({ version: 'v1', auth });


  var class_cw = await classroom.courses.courseWork.get({ courseId: course_id, id: work_id });
  var class_mats = class_cw.data.materials;
  console.log(class_mats)
  const doc_promises = class_mats.map(async mat => {
    var doc = await drive.files.get({
      fileId: mat.driveFile.driveFile.id
    })
    return doc;
  });
  console.log(class_mats[0].driveFile.driveFile.id)

  const class_files = await Promise.all(doc_promises);

  console.log(class_files);

  const text_promises = class_files.map(async cf => {
    // var output_text = "";
    switch (cf.data.mimeType) {
      case 'application/vnd.google-apps.document':
        return await drive.files.export({
          fileId: cf.data.id,
          mimeType: 'text/plain'
        }, {
          responseType: 'text'
        })
    }
  });

  const files_text_form = await Promise.all(text_promises);
  const extracted_text = files_text_form.forEach(dl_file => {
    return dl_file.data;
  });

  // console.log(files_text_form)
  console.log(files_text_form[0].data)



  page_res.render('pages/info', {

  })
}


//Login page 
app.use("/", function (req, res) {
  var url = getAuthUrl();
  // res.render()
  // res.send(`
  //     <h1> Authentication using google oAuth</h1>
  //     <a href=${url}>Login</a>
  // `)
  // res.send(ejs.render('pages/index'))
  res.render('pages/index', {
    login_url: url
  })
});


var port = 5656;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
  console.log(`listening to ${port}`);
});

