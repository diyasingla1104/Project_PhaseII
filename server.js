const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Path to Excel file
const filePath = path.join(__dirname, "registrations.xlsx");

// Function to save data to a specific sheet
function saveToExcel(sheetName, data) {
    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
    } else {
        workbook = XLSX.utils.book_new();
    }

    // Check if sheet already exists
    let worksheet;
    if (workbook.SheetNames.includes(sheetName)) {
        worksheet = workbook.Sheets[sheetName];
        let existingData = XLSX.utils.sheet_to_json(worksheet);
        existingData.push(data);
        worksheet = XLSX.utils.json_to_sheet(existingData);
    } else {
        worksheet = XLSX.utils.json_to_sheet([data]);
    }

    // Append/Update sheet
    workbook.Sheets[sheetName] = worksheet;
    if (!workbook.SheetNames.includes(sheetName)) {
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // Save workbook
    XLSX.writeFile(workbook, filePath);
}

// ------------------- ROUTES --------------------

// Signup
app.post("/api/signup", (req, res) => {
    saveToExcel("Signup", req.body);
    res.json({ success: true, message: "Signup saved successfully!" });
});

// Live Class Registration
app.post("/api/live", (req, res) => {
    saveToExcel("Live Classes", req.body);
    res.json({ success: true, message: "Live class registration saved!" });
});

// Offline Class Registration
app.post("/api/offline", (req, res) => {
    saveToExcel("Offline Classes", req.body);
    res.json({ success: true, message: "Offline class registration saved!" });
});

// ------------------------------------------------
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
