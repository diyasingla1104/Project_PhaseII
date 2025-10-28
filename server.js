const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Path to Excel file
const filePath = path.join(__dirname, "registrations.xlsx");

// Save user to Excel (with overwrite if same email exists)
function saveToExcel(sheetName, data) {
    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
    } else {
        workbook = XLSX.utils.book_new();
    }

    let users = [];
    if (workbook.SheetNames.includes(sheetName)) {
        const worksheet = workbook.Sheets[sheetName];
        users = XLSX.utils.sheet_to_json(worksheet);
    }

    // check if email already exists
    const existingIndex = users.findIndex(
        u => u.email?.toLowerCase() === data.email.toLowerCase()
    );

    if (existingIndex >= 0) {
        users[existingIndex] = data; // update user
    } else {
        users.push(data); // add new user
    }

    const newSheet = XLSX.utils.json_to_sheet(users);
    workbook.Sheets[sheetName] = newSheet;

    if (!workbook.SheetNames.includes(sheetName)) {
        XLSX.utils.book_append_sheet(workbook, newSheet, sheetName);
    }

    XLSX.writeFile(workbook, filePath);
}

// Read users from Excel
function readFromExcel(sheetName) {
    if (!fs.existsSync(filePath)) return [];
    const workbook = XLSX.readFile(filePath);
    if (!workbook.SheetNames.includes(sheetName)) return [];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

// ------------------- ROUTES --------------------

// Signup
app.post("/api/signup", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password required" });
    }

    saveToExcel("Signup", req.body);
    res.json({ success: true, message: "Signup successful!" });
});

// Login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const users = readFromExcel("Signup");

    const user = users.find(
        u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, error: "Invalid email or password" });
    }
});

// ------------------------------------------------
const PORT = 4000; // use this port
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
