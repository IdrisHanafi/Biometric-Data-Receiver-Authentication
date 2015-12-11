var express        =         require("express");
var bodyParser     =         require("body-parser");
var path    	   = 		 require("path");
var app            =         express();
var pg 			   = 		 require('pg');
var conString 	   = 		 "postgres://postgres:sesamestreet1@localhost/idris";
var client 		   = 		 new pg.Client(conString);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Login
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/project.html'));
});

app.post('/login',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var keystroke=req.body.keystroke;
  connect(username,password,keystroke, req, res, function(isSuccess,res){
	if(isSuccess){
		res.send("home");
		res.end();
	}else{
		res.end("no");
	}});
});

// Home
app.get('/home', function (req, res) {
  res.sendFile(path.join(__dirname+'/home.html'));
});

// Sign Up
app.get('/signup', function (req, res) {
  res.sendFile(path.join(__dirname+'/signup.html'));
});

app.post('/create',function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var keystroke=req.body.keystroke;
  connectSignUp(username,password,keystroke, res, function(res){res.end("yes");});
  console.log("User name = "+username+", password is "+password+", keystroke is "+keystroke);
});

// Listen on port
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

// Login
function connect(username,password,keystroke, req, res, functionend){
	client.connect(function(err) {
	  if(err) {
		return console.error('could not connect to postgres', err);
	  }
	  client.query('SELECT * FROM "userTable" where username = \''+username+'\'', function(err, result) {
		if(err) {
		  return console.error('error running query', err);
		}
		
		if(result.rows.length > 0) {	// Username exist
			if(password == result.rows[0].password) {	// Right Password
				var correctKeystrokeValues = result.rows[0].keystroke.split(" ");
				var enteredKeystrokeValues = keystroke.split(" ");
				var j = 0;
				for(var i = 0; i < correctKeystrokeValues.length; i++) {
					if(((parseInt(correctKeystrokeValues[i])-200) < parseInt(enteredKeystrokeValues[i])) && ((parseInt(correctKeystrokeValues[i])+200) > parseInt(enteredKeystrokeValues[i]))) {
						j++;
					}
					console.log("Correct Value: " + correctKeystrokeValues[i] + " Entered Value: " + enteredKeystrokeValues[i]);
				}
				if((j == (correctKeystrokeValues.length-1)) || j == correctKeystrokeValues.length) { 
					console.log("LOGIN SUCCESSFUL");
					client.end();
					functionend(true, res);
					return;
				} else {
					console.log("WRONG PERSON BY KEYSTROKE");
					client.end();
					functionend(false, res);
				}
				//console.log("LOGIN SUCCESSFUL" + );
				client.end();
				functionend(false, res);
			} else {								// Wrong Password
				console.log("WRONG PASSWORD");
				client.end();
				functionend(false, res);
			}
		} else {	// Username doesn't exist
			console.log("ACCOUNT DOESN'T EXIST");
		}
		client.end();
		functionend(false, res);
		client.end();
	  });
	});
}

// Sign up
function connectSignUp(username,password,keystroke, res, functionend){
	client.connect(function(err) {
	  if(err) {
		return console.error('could not connect to postgres', err);
	  }
	  client.query('INSERT INTO "userTable" VALUES(\''+username+'\',\''+password+'\',\''+keystroke+'\')', function(err, result) {
		console.log("CREATED");
		client.end();
		functionend(res);
		client.end();
	  });
	});
}