const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const JustWatch = require('./script.js');
const fetch = require('node-fetch');
var path = require('path');
let db;

const url = "mongodb://localhost:27017/Watchlist";
const port = 3000;



app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

// app.use(bodyParser.urlencoded())
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/home/index.html');
});

app.post('/addUser', function(req, res){
  db.collection("Accounts").insertOne(req.body, function(err, result){
    if (err) throw err;
    console.log("Saved");
    res.redirect('/');
  });
});

// app.get("/profile", function(req, res){
//   res.send('/Watchlist/Profile/www/index.html')
// });

app.post("/login", function(req, res){
  const data = req.body;
  db.collection("Accounts").findOne({Username: data.username}, function(err, document){
    // if err (throw) err;
    if(data.password === document.Password){
      res.redirect('/profile/index.html')
      console.log("login Successful")
    } else {
      res.redirect("/")
    }
  })
})

app.get('/getUser', function(req, res){
  db.collection("Accounts").find().toArray(function(err, result){
      if (err) throw err;
      res.send(result);
  });
});

//Profile page code
app.post('/addMovies', function(req, res){
  db.collection("Movies").insertOne(req.body, function(err, result){
    if (err) throw err;
    console.log("Saved");
    res.redirect('/profile/index.html');
  })
})

app.get('/getMovies', function(req, res){
  db.collection("Movies").find().toArray(function(err, result){
      if (err) throw err;
      res.send(result);
  });
});

//Home page code
app.get('/retrievedata', function(req, res){
  db.collection("Results").find().toArray(function(err, result){
    if (err) throw err;
    res.send(result);
    console.log(result);
  })
})


function print_result(name, result)
{
	console.log(name+":");
	console.log(JSON.stringify(result, null, 4));
	console.log("\n\n\n\n");
}

app.post('/search', async function (req, res) {
  console.log('data', req.body.name)
  var justwatch = new JustWatch();
  var userSearch = req.body.name;
  var searchResult = await justwatch.search({query: userSearch});
  const cleanedData = searchResult.items.map((item, index) => {
    return {
      title: item.title,
      cinema_release_date: item.cinema_release_date,
      offers: item.offers,
      runtime: item.runtime + " mintues"
    }
  })
    console.log(cleanedData)
  return res.json(cleanedData)
})

//Connect to Watchlist Datababse
MongoClient.connect(url, function(err, client){
  if (err) throw err;
  console.log("Connection to DB Successful");
  db = client.db("Watchlist");
})

app.listen(port, function() {
  console.log(`App Listening on Port ${port}`)
})
