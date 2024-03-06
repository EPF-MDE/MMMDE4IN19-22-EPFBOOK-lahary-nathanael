const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!,')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port} test`)
})

app.get('/student', (req, res) => {
  res.send([{ name: "Eric Burel", school: "EPF" }, { name: "Harry Potter", school: "Poudlard"}])
})
