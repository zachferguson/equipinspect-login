const express = require('express');
const Datastore = require('nedb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

const spawn = require('child_process').spawn;

app.use('/assets', express.static('assets'));
app.use(session({secret: '3dfniydru8zfslrjkh7q', resave: false, saveUninitialzed: true}));

app.set('view engine', 'ejs');

let urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/markovifythis', function(req, res){
  res.sendFile(__dirname + '/markovifyThis.html');
});

app.post('/markovifythis', urlencodedParser, function(req, res) {
  let pcall = new Promise((resolve, reject) => {
    let pargs = "books/" + Object.values(req.body) + '.txt';
    const pythonProcess = spawn('python', ["markovifyThisOnline.py", pargs]);
    pythonProcess.stdout.on('data', (data) => {
      if (data) {
        let tweets = JSON.parse(data.toString());
        resolve(tweets);
      }

    });
  })

  pcall.then((tweets) => {
    let message = {tweeta: tweets['0'], tweetb: tweets['1'], tweetc: tweets['2'], tweetd: tweets['3'], tweete: tweets['4']};
    res.render('markovifythis', {message});
  });
})



/*
const pythonProcess = spawn('python', ['markovifyThisOnline.py', 'Fifty-Shades-of-Gray']);
console.log('call has been initiated...');
pythonProcess.stdout.on('data', (data) => {
  console.log('have I been called yet?');
  console.log(data);
});
*/
// THIS IS HOW ALL SHOULD BE
app.get('/companysignup', function(req, res){
  res.sendFile(__dirname + '/companysignup.html');
});

app.listen(3000);
