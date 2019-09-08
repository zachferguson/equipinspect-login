const express = require('express');
const Datastore = require('nedb');
const bodyParser = require('body-parser');

const app = express();

app.use('/assets', express.static('assets'));

let urlencodedParser = bodyParser.urlencoded({ extended: false });

const inspectors = new Datastore({filename: './db/inspectors.db', autoload: true});
const companies = new Datastore({filename: './db/companies.db', autoload: true});

function newCompany(company, addressmain, addresssecondary, city, usstate, zip, phone, username, pw, first, last, email) {
  let uq = company.toLowerCase() + zip;
  let compVar = {unique: uq, company: company, addressMain: addressmain, addressSecondary: addresssecondary, city: city, USstate: usstate, zipCode: zip, phoneNumber: phone, userName: username, pw: pw, adminFirstName: first, adminLastName: last, level: '', inspectors: [], expiration: {}, verified: false, email: email};

  companies.findOne({unique: uq}, function(err, verify) {
    if (err) {
      console.log(err);
      return;
    }
    if (verify != null) {
      if (uq == verify.unique) {
        console.log('company already exists');
        return;
      }
    }
    else {
      companies.insert(compVar, function(err, data) {
        console.log('created: ' + data.company);
        console.log('Administrator: ' + data.adminFirstName + ' ' + data.adminLastName);
        console.log('User Name: ' + data.userName + ', Password: ' + data.pw);
        console.log('Address: ' + data.addressMain);
        console.log('         ' + data.city + ', ' + data.USstate + ' ' + data.zipCode);
        console.log('Phone Number: ' + data.phoneNumber);
        console.log('E-Mail: ' + data.email);
      })
    }
  });
}

function newUser (userName, passWord, firstName, lastName, compan, eMail, typ, iid) {
  let userVar = {username: userName, pw: passWord, firstname: firstName, lastname: lastName, companyID: compan, email: eMail, type: typ, inspectorID: iid};
  inspectors.findOne({username: userName}, function(err, verify) {
    if (err) {
      console.log(err);
      return;
    }
    if (verify != null) {
      if (userName == verify.username) {
        console.log('user already exists');
        return;
      }
    }
    else {
      inspectors.insert(userVar, function(err, data) {
        console.log('created' + data.type + ': ' + data.username + ', ' + data.firstname + ' ' + data.lastname + ', email: ' + data.email + ', password: ' + data.pw);
      });
    }
  });
}

function logInCheck(userName, passWord) {
  users.findOne({username: userName}, function(err, data) {
    if (err) {
      console.log('username incorrect.');
    }
    if (passWord != data.pw) {
      console.log('password incorrect');
    }
    else {
      console.log('welcome, ' + data.username);
    }
  });
}

function checker(fieldName, inputValue) {
  console.log('database query values:');
  console.log(fieldName + ': ' + inputValue);
  companies.findOne({fieldName: inputValue}, function(err, data) {
    console.log('checking if ' + fieldName + ' ' + inputValue + ' already exists.');
    console.log(data);
    if (err) {
      console.log('error message:');
      console.log(err);
      return;
    }
    if (data == null) {
      console.log(fieldName + ' ' + inputValue + ' does not exist.');
      return false;
    }
    else {
      console.log('user ' + data.userName + ' already exists');
      return true;
    }
  });
  let fuquery = {userName: 'zachferguson'};
  companies.findOne(fuquery, function(err, verify) {
    console.log('the FU, database check:');
    console.log(verify.userName);
  });
}
//newUser('zachferguson', 'pants47', 'Zach', 'Ferguson', 'AETechnologies', 'zach.ferguson@yahoo.com', 'inspector', null);
//newUser('purplePeopleEater', 'password', 'Purple', 'Eater', 'PPE Inc', 'ppe@ppeinc.com', 'inspector', null);
//logInCheck('zachferguson', 'pants47');
newCompany('AETechnologies', '1082 School House Rd.', '', 'Harveys Lake', 'PA', '18618', '5706392344', 'zachferguson', 'adminPassword', 'Zach', 'Ferguson', 'zach.ferguson@yahoo.com');

app.set('view engine', 'ejs');


// PAGE ROUTING
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/contact', function(req, res){
  res.send('this is the contact page');
});


// THIS IS HOW ALL SHOULD BE
app.get('/companysignup', function(req, res){
  res.sendFile(__dirname + '/companysignup.html');
});

app.get('/profile/:name', function(req, res){
  let tempObj = {age: 29, job: 'street fighter', hobbies: ['fighting', 'rivalry with Ken', 'shopping for gis', 'training']};
  res.render('profile', {person: req.params.name, tempObj: tempObj});
});

// POST HANDLING
app.post('/companysignup', urlencodedParser, function (req, res) {
  console.log('POST Data:');
  console.log(req.body);
  // run checker function on each item in looplist, update unexisting if value isn't already registered, and if no values are registered, add new user to database
  // if values already used, send to failed registration screen
  let unexisting = {checkCompanyName: true, checkUserName: true, checkEmail: true, checkPhone: true};
  let looplist = [['company', req.body.companyName, 'checkCompanyName'], ['userName', req.body.companyUserName, 'checkUserName'], ['email', req.body.companyEmail, 'checkEmail'], ['phoneNumber', req.body.companyAreaCode + req.body.companyPhone, 'checkPhone']]

  for (let i = 0; i < looplist.length; i++) {
    console.log('running checker...');
    if (checker(looplist[i][0], looplist[i][1]) == false) {
      unexisting[looplist[i][2]] = false;
    }

  }
  console.log('check response:');
  setTimeout(function(){console.log(unexisting);},2000);

  /*
  newCompany(req.body.companyName, req.body.companyAddressPrimary, req.body.companyAddressSecondary, req.body.companyCity, req.body.companyState, req.body.companyZip, req.body.companyAreaCode + req.body.companyPhone, req.body.companyUserName, req.body.companyPassword, req.body.companyFirstName, req.body.companyLastName);
  console.log('New company ' + req.body.companyName + ' created from website.');
  */
})

app.listen(3000);
