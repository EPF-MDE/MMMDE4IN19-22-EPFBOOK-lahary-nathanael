const express = require('express')
const app = express()
const port = 3000
const fs = require("fs")

app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello World!,')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port} test`)
});

app.get('/students/create', (req, res) => {
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


app.get('/students', (req, res) => {
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
