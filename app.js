
const express = require('express')
const app = express()
const port = 3000
const fs = require("fs")
const path = require("path"); // Require the path module
const basicAuth = require('express-basic-auth')




const clearPasswordAuthorizer  = (username, password, cb) => {
  if (!username || !password) {
    return cb(new Error("Username or password were not defined"), false);
  }
  // Parse the CSV file: this is very similar to parsing students!
  parseCsvWithHeader("./users.csv", (err, users) => {
    console.log(users);
    // Check that our current user belong to the list
    const storedUser = users.find((possibleUser) => {
      if (!possibleUser.username) {
        console.warn(
          "Found a user with no username in users.csv",
          possibleUser
        );
        return false;
      }
      // NOTE: a simple comparison with === is possible but less safe
      return basicAuth.safeCompare(username, possibleUser.username);
    });

    if (!storedUser) {
      cb(null, false);
    } else if (!storedUser.password) {
      console.warn(
        "Found a user with no password in users.csv",
        storedUser
      );
      cb(null, false);
    } else if (!basicAuth.safeCompare(password, storedUser.password)) {
      cb(null, false);
    } else {
      // success: user is found and have the right password
      cb(null, true);
    }
  });
};

const encryptedPasswordAuthorizer = (username, password, cb) => {
  if (!username || !password) {
    return cb(new Error("Username or password were not defined"), false);
  }
  // Parse the CSV file: this is very similar to parsing students!
  parseCsvWithHeader("./users_encrypted.csv", (err, users) => {
    // Check that our current user belong to the list
    const storedUser = users.find((possibleUser) => {
      if (!possibleUser.username) {
        console.warn(
          "Found a user with no username in users.csv",
          possibleUser
        );
        return false;
      }
      // NOTE: a simple comparison with === is possible but less safe
      return basicAuth.safeCompare(possibleUser.username, username);
    });
    if (!storedUser) {
      cb(null, false);
    } else if (!storedUser.password) {
      console.warn(
        "Found a user with no password in users.csv",
        storedUser
      );
      cb(null, false);
    } else {
      // now we check the password
      // bcrypt handles the fact that storedUser password is encrypted
      // it is asynchronous, because this operation is long
      // so we pass the callback as the last parameter
      bcrypt.compare(password, storedUser.password, cb);
    }
  });
};

app.use(basicAuth({
  authorizer: encryptedPasswordAuthorizer,
  challenge: true,
  authorizeAsync: true,

}))

app.use(express.urlencoded({ extended: true })); // This line enables parsing of URL-encoded data

app.set('views','./views'); 
app.set('view engine','ejs');
app.use(express.static('public')); 

app.use(express.json());

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  // Send the home.html file when accessing the root URL
  res.sendFile(path.join(__dirname, "./views/home.html"));
});

// ADD STUDENTS

const storeStudentInCsvFile = (student, cb) => {
  const csvLine = `\n${student.name},${student.school}`;
  console.log(csvLine);
  fs.writeFile("./students.csv", csvLine, { flag: "a" }, (err) => {
    cb(err, "ok");
  });
};

app.get('/students/create', (req, res) => {
  res.render('create-student');
});

app.post("/students/create", (req, res) => {
  console.log(req.body);
  const student = req.body;
  storeStudentInCsvFile(student, (err, storeResult) => {
    if (err) {
      res.redirect("/students/create?error=1");
    } else {
      res.redirect("/students/create?created=1");
    }
  });
});

// 

app.post("/api/login", (req, res) => {
  console.log("current cookies:", req.cookies);
  // We assume that you check if the user can login based on "req.body"
  // and then generate an authentication token
  const token = "FOOBAR";
  const tokenCookie = {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
  };
  res.cookie("auth-token", token, tokenCookie);
  res.send("OK");
});

app.get('/students', (req, res) => {
  // Read student data from the CSV file
  const rowSeparator = "\n";
  const cellSeparator = ";"

  fs.readFile('Book1.csv', 'utf8', function(err, data){
    const rows=data.split(rowSeparator);
    const [headerRow, ...contentRows] = rows;
    const header = headerRow.split(cellSeparator).map(cell => cell.trim()); // Trim each header cell

    const students = contentRows.map((row) => {
      const cells = row.split(cellSeparator);
      const student = {
        [header[0]]: cells[0],
        [header[1]]: cells[1],
      };      
      return student;
    })

    console.log(students);

    res.render('students', { students: students });
  });
});


app.get('api/students/create', (req, res) => {
  console.log(req.body)
  const csvLine = `\n${req.body.name}, ${req.body.school}`; 
  console.log(csvLine)
  const stream = fs.writeFile(
    "./students.csv",
    csvLine,
    { flag:"a" },
    (err) => {
      res.send("ok")
    }
  )
  return "Student created"
})


app.get('/api/students', (req, res) => {
  const rowSeparator = "\n";
  const cellSeparator = ",";

  fs.readFile('Book1.csv', 'utf8', function(err, data){
    const rows=data.split(rowSeparator);
    const [headerRow, ...contentRows] = rows;
    const header = headerRow.split(cellSeparator);

    const students = contentRows.map((row) => {
      const cells = row.split(cellSeparator);
      const student = {
        [header[0]]: cells[0],
        [header[1]]: cells[1],
      };
      return student;
    })

    console.log(data);


    res.send(students)
  });




});


const parseCsvWithHeader = (filepath, cb) => {
  const rowSeparator = "\n";
  const cellSeparator = ",";
  // example based on a CSV file
  fs.readFile(filepath, "utf8", (err, data) => {
    const rows = data.split(rowSeparator);
    // first row is an header I isolate it
    const [headerRow, ...contentRows] = rows;
    const header = headerRow.split(cellSeparator);

    const items = contentRows.map((row) => {
      const cells = row.split(cellSeparator);
      const item = {
        [header[0]]: cells[0],
        [header[1]]: cells[1],
      };
      return item;
    });
    return cb(null, items);
  });
};


app.listen(port, () => {
  console.log(`Example app listening on port ${port} test`)
});