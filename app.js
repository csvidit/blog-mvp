const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const $ = require("jquery");
const _ = require("lodash");
const npg = require("node-postgres");
const pgp = require('pg-promise')( /* options */ );
const cn = {
  host: 'localhost',
  port: 5432,
  database: 'vidit',
  user: 'vidit',
  password: 'qwerty',
  max: 30 // use up to 30 connections
};
const db = pgp(cn);

const app = express();

var posts = [];
var count;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res)
{
  posts = [];
  db.any('SELECT COUNT(*) FROM posts', [true])
    .then(numPosts => {
        db.any('SELECT name, body FROM posts', [true])
        .then(data => {
          count = parseInt(numPosts[0].count);
          for(var i = 0; i<count; i++)
          {
            var newPost = {
              title: data[i].name,
              content: data[i].body
            }
            console.log(newPost);
            posts.push(newPost);
          }
          console.log(posts);
          res.render("home", {
            posts: posts
          });
        })
    });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/posts/:title", function(req, res) {
  var reqTitle = _.lowerCase(req.params.title);
  posts.forEach(function(post) {
    postTitle = _.lowerCase(post.title)
    if (postTitle === reqTitle) {
      console.log("Post Found");
      res.render("post", {
        title: post.title,
        content: post.content
      });
      return;
    }
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {
  const newPost = {
    title: req.body.NewPostTitle,
    content: req.body.NewPostContent
  };
  var query = 'INSERT INTO posts("id", "name", "body", "joined") VALUES('+count+',"'+newPost.title+'", "'+newPost.content+'", "'+new Date()+'");';
  console.log(query);
  db.none(query, [true])
    .then(() => {
      res.redirect("/");
    })
    .catch(error => {
        console.log(error);
    });

  // const newPost = {
  //   title: req.body.NewPostTitle,
  //   content: req.body.NewPostContent
  // };
  // posts.push(newPost);
  // console.log(posts);
  // res.redirect("/");
});


app.listen(3000, function() {
  console.log("Server running on port 3000.");
});
