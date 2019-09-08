const express = require("express");
const Datastore = require("nedb");  //for databases
const bodyParser = require("body-parser");  // for post requests data access
const session = require("express-session");  // session manager

const spawn = require("child_process").spawn;  // for markovifythis

const app = express();

app.use("/assets", express.static("assets"));
app.use(session({secret: "3dfniydru8zfslrjkh7q", resave: false,
                saveUninitialzed: true}));

app.set("view engine", "ejs");

let urlencodedParser = bodyParser.urlencoded({ extended: false });

const inspectors = new Datastore({filename: "./db/inspectors.db",
                                  autoload: true});
const companies = new Datastore({filename: "./db/companies.db",
                                 autoload: true});

function newCompany(company, addressmain, addresssecondary, city, usstate, zip,
                    phone, username, pw, first, last, email) {
  let uq = "";
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let uqarr = company.toLowerCase().split("");
  for (i = 0; i < uqarr.length; i++) {
    if (letters.indexOf(uqarr[i]) != -1) {
      uq += uqarr[i];
    }
  }
  uq += zip;
  console.log("unique company identifier: " + uq);
  let compVar = {unique: uq, company: company, addressPrimary: addressmain,
                addressSecondary: addresssecondary, city: city, state: usstate,
                zipCode: zip, phoneNumber: phone, userName: username, password:
                pw, firstName: first, lastName: last, level: "", inspectors: [],
                expiration: {}, verified: false, email: email,
                customersRef: []};

  companies.findOne({unique: uq}, function(err, verify) {
    if (err) {
      console.log(err);
      return;
    }
    if (verify !== null) {
      if (uq == verify.unique) {
        console.log("company already exists");
        return;
      }
    }
    else {
      companies.insert(compVar, function(err, data) {
        console.log("created: " + data.company);
        console.log("Administrator: " + data.firstName + " " + data.lastName);
        console.log("User Name: " + data.userName + ", Password: "
                    + data.password);
        console.log("Address: " + data.addressPrimary);
        console.log("         " + data.city + ", " + data.state + " "
                    + data.zipCode);
        console.log("Phone Number: " + data.phoneNumber);
        console.log("E-Mail: " + data.email);
      });
    }
  });
}

function newUser (userName, passWord, firstName, lastName, compan, eMail, iid) {
  let userVar = {userName: userName, password: passWord, firstName: firstName,
                lastName: lastName, company: compan, email: eMail, inspectorID:
                iid, expiration: {}, inspectionsRef: [], incompletesRef: []};
  inspectors.findOne({userName: userName}, function(err, verify) {
    if (err) {
      console.log(err);
      return;
    }
    if (verify !== null) {
      if (userName == verify.userName) {
        console.log("user already exists");
        return;
      }
    }
    else {
      inspectors.insert(userVar, function(err, data) {
        console.log("created inspector username" + ": " + data.userName + ", "
                    + data.firstName + " " + data.lastName + ", email: " +
                    data.email + ", password: " + data.password);
      });
    }
  });
}

function logInCheck(username, password, type) {
  type.findOne({userName: username}, function(err, data) {
    if (err) {
      console.log("username incorrect.");
    }
    if (passWord != data.pw) {
      console.log("password incorrect");
    }
    else {
      console.log("welcome, " + data.username);
    }
  });
}

function subscriber (uniqueID) {
  // ******* function to, when received payment, activate company, search for
  // ******* any already assigned inspectors, and activate them also
  return;
}

function unsubscriber (uniqueID) {
  // ******* on every successful login, run this function to check if the
  // ******* expiration date has arrived. If it has, disable all buttons and
  // ******* add a link to renew subscription. If it"s less than oen month away
  // ******* add a notification
  return;
}

function accountActivator (inuqueID) {
  // ******* called when a new account has been created, and the confirmation
  // ******* link has been accessed.
  return;
}
newUser("zachferguson", "pants47", "Zach", "Ferguson", "AETechnologies",
        "zach.ferguson@yahoo.com", null);
//newUser("purplePeopleEater", "password", "Purple", "Eater", "PPE Inc", "ppe@ppeinc.com", "inspector", null);
//logInCheck("zachferguson", "pants47");

newCompany("AETechnologies", "1082 School House Rd.", "", "Harveys Lake", "PA",
          "18618", "5706392344", "zachferguson", "adminPassword", "Zach",
          "Ferguson", "zach.ferguson@yahoo.com");


// PAGE ROUTING
app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

app.post("/index", urlencodedParser, function(req, res) {

  let logCheck = new Promise((resolve, reject) => {
    console.log("logCheck function called.");
    switch (req.body.loginType) {
      case "inspector":
        inspectors.findOne({userName: req.body.username}, function(err, data) {
          if (data !== null) {
            console.log("login data result:");
            console.log(data);

            if (data.userName == req.body.username && data.password !=
                req.body.password) {
              let message = {messageText: "Password Incorrect"};
              res.render("index", {message});
            }
            else {
              resolve(data);
            }
          }
          else {
            let message = {messageText: "Username " + req.body.username +
                          " does not exist. Please try again."};
            res.render("index", {message});
          }
        });
        break;
      case "administrator":
        companies.findOne({userName: req.body.username}, function(err, data) {
          if (data !== null) {
            console.log("login data result:");
            console.log(data);

            if (data.userName == req.body.username && data.password !=
                req.body.password) {
              let message = {messageText: "Password Incorrect"};
              res.render("index", {message});
            }
            else {
              resolve(data);
            }
          }
          else {
            let message = {messageText: "Username " + req.body.username +
                          " does not exist. Please try again."};
            res.render("index", {message});
          }
        });
        break;
    }
    let db = req.body.loginType;

  })

  function loginRoute(data) {
    req.session.user = data.userName;
    req.session.company = data.company;
    let output = {userName: data.userName, company: data.company};
    switch(req.body.loginType) {
      case "inspector":
        res.render("inspector", {output});
        return;
      case "administrator":
        res.render("administrator", {output});
        return;
      case "equipment":
        res.render("equipment", {output});
        return;
    }
  }

  logCheck.then(function(data) {
    loginRoute(data);
  });
});


// THIS IS HOW ALL SHOULD BE
app.get("/companysignup", function(req, res){
  res.sendFile(__dirname + "/companysignup.html");
});

app.get("/markovifythis", function(req, res){
  res.sendFile(__dirname + "/markovifyThis.html");
});

app.post("/markovifythis", urlencodedParser, function(req, res) {
  let pcall = new Promise((resolve, reject) => {
    let pargs = "books/" + Object.values(req.body) + ".txt";
    console.log("spawning python call");
    const pythonProcess = spawn("python", ["markovifyThisOnline.py", pargs]);
    pythonProcess.stdout.on("data", (data) => {
      if (data) {
        let tweets = JSON.parse(data.toString());
        resolve(tweets);
      }

    });
  })

  pcall.then((tweets) => {
    let message = {tweeta: tweets["0"], tweetb: tweets["1"], tweetc:
                  tweets["2"], tweetd: tweets["3"], tweete: tweets["4"]};
    res.render("markovifyThis", {message});
  });
})




// ******* !!!!!!! WORKING HERE !!!!!!! *******
app.get("/createnewinspector", function(req, res){
  if (!req.session.user) {
    return res.status(401).send();
  }
  else {
    let output = {company: req.session.company, userName: req.session.user}
    res.render("createnewinspector", {output});
  }
});

// EXAMPLE FOR HOW TO DYNAMICALLY USE EJS
app.get("/profile/:name", function(req, res){
  let tempObj = {age: 29, job: "street fighter", hobbies: ["fighting", "rivalry with Ken", "shopping for gis", "training"]};
  res.render("profile", {person: req.params.name, tempObj: tempObj});
});

// POST HANDLING
app.post("/companysignup", urlencodedParser, function(req, res) {

  // assumes the company info is all already used: company, username, email, and phone number
  let existing = {checkCompanyName: true, checkUserName: true, checkEmail: true,
                  checkPhone: true};

  function registrationDecision (inval) {
    // checks whether any of the company information already exists.

    // ******* ADD TO FAILURE PAGE REASON FOR FAILURE *******

    // if any of the company data the user input has already been used, fail
    // registrationDecision
    // prevents duplicate companies, email addresses, usernames, and phone numbers
    if (Object.values(inval).includes(true)) {
      console.log("something already existed...");
      console.log(inval);
      res.sendFile(__dirname + "/failedaccountcreation.html");
    }
    // creates a new company if the new fields are all uniquie
    // ******* ADD FUNCTIONALITY TO SEND A CONFIRMATION EMAIL *******
    // ******* CREATE A TEMPORARY PAGE THAT IF ACCESSED CHANGES VERIFIED TO true *******
    // ******* INSPECTOR AND ADMIN LOGINS SHOULD BE DECLINED IF COMPANY IS NOT VERIFIED: true *******
    else {
      newCompany(req.body.companyName,
        req.body.companyAddressPrimary,
        req.body.companyAddressSecondary,
        req.body.companyCity,
        req.body.companyState,
        req.body.companyZip,
        req.body.companyAreaCode + req.body.companyPhone,
        req.body.companyUserName,
        req.body.companyPassword,
        req.body.companyFirstName,
        req.body.companyLastName,
        req.body.companyEmail);
      res.sendFile(__dirname + "/emailconfirmation.html");
    }
  }
  // company name verification promise
  let checkCompanyName = new Promise((resolve, reject) => {
    companies.findOne({company: req.body.companyName}, function(err, verify) {
      if (verify != null && verify.company == req.body.companyName) {
        console.log("");
        console.log("company " + verify.company + " already exists.");
      }
      else {
        existing["checkCompanyName"] = false;
      }
      resolve(verify);
    });
  })
  // username verification Promise
  let checkUserName = new Promise((resolve, reject) => {
    companies.findOne({userName: req.body.companyUserName}, function(err, verify) {
      if (verify != null && verify.userName == req.body.companyUserName) {
        console.log("");
        console.log("username " + verify.userName + " already exists.");
      }
      else {
        existing["checkUserName"] = false;
      }
      resolve(verify);
    });
  })
  // email verification promise
  let checkEmail = new Promise((resolve, reject) => {
    companies.findOne({email: req.body.companyEmail}, function(err, verify) {
      if (verify != null && verify.email == req.body.companyEmail) {
        console.log("");
        console.log("email address " + verify.email + " already in use.");
      }
      else {
        existing["checkEmail"] = false;
      }
      resolve(verify);
    });
  })
  //phonenumber verification Promise
  let checkPhoneNumber = new Promise((resolve, reject) => {
    companies.findOne({phoneNumber: req.body.companyAreaCode +
                      req.body.companyPhone}, function(err, verify) {
      if (verify != null && verify.userName == req.body.companyUserName) {
        console.log("");
        console.log("phone number " + verify.phoneNumber+ " already in use.");
      }
      else {
        existing["checkPhone"] = false;
      }
      resolve(verify);
    });
  })

  checkCompanyName.then(
    checkUserName.then(
      checkEmail.then(
        checkPhoneNumber.then( function () {
          registrationDecision(existing);
        }))));

  /*
  newCompany(req.body.companyName, req.body.companyAddressPrimary, req.body.companyAddressSecondary, req.body.companyCity, req.body.companyState, req.body.companyZip, req.body.companyAreaCode + req.body.companyPhone, req.body.companyUserName, req.body.companyPassword, req.body.companyFirstName, req.body.companyLastName);
  console.log("New company " + req.body.companyName + " created from website.");
  */
})

app.listen(49477);
