const express = require('express')
const app = express()
const port = 3000
const fs = require("fs")
const path = require("path"); // Require the path module
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port} test`)
});