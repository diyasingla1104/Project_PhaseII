const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = './registrations.xlsx';

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.send("Server is working!");
});

// ✅ Registration route
app.post('/api/register', (req, res) => {
  const data = req.body;

  let workbook, worksheet;

  if (fs.existsSync(FILE_PATH)) {
    workbook = XLSX.readFile(FILE_PATH);
    worksheet = workbook.Sheets['Registrations'];
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
  }

  const existingData = XLSX.utils.sheet_to_json(worksheet);
  existingData.push(data);

  const newWorksheet = XLSX.utils.json_to_sheet(existingData);
  workbook.Sheets['Registrations'] = newWorksheet;
  XLSX.writeFile(workbook, FILE_PATH);

  res.status(200).json({ message: 'Registration saved to Excel' });
});

// ✅ Login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync(FILE_PATH)) {
    return res.status(400).json({ message: 'No users registered yet.' });
  }

  const workbook = XLSX.readFile(FILE_PATH);
  const worksheet = workbook.Sheets['Registrations'];
  const users = XLSX.utils.sheet_to_json(worksheet);

  const user = users.find(u => 
  (u.email || u.Email) === email && 
  (u.password || u.Password) === password
);

  if (user) {
  return res.status(200).json({
    message: 'Login successful',
    user: {
      name: user.name || user.Name,
      email: user.email || user.Email,
      goal: user.goal || user.Goal,
      age: user.age || user.Age,
      domain: user.domain || user.Domain,
      weight: user.weight || user.Weight,
      height: user.height || user.Height
    }
  });
}
 else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
});

// ✅ Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
