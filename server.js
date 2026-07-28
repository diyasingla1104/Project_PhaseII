const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Path to Excel file
const filePath = path.join(__dirname, "registrations.xlsx");

function readWorkbook() {
    if (fs.existsSync(filePath)) {
        return XLSX.readFile(filePath);
    }
    return XLSX.utils.book_new();
}

function readSheet(sheetName) {
    const workbook = readWorkbook();
    if (!workbook.SheetNames.includes(sheetName)) {
        return [];
    }
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

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

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function getField(row, fieldNames) {
    for (const fieldName of fieldNames) {
        if (row[fieldName] !== undefined) {
            return row[fieldName];
        }
    }
    return "";
}

// ------------------- ROUTES --------------------

app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});

app.post("/api/register", async (req, res) => {
    try {
        const requiredFields = ["name", "email", "password", "phone", "age", "gender", "weight", "goal", "domain", "program"];
        for (const field of requiredFields) {
            if (!req.body[field] || String(req.body[field]).trim() === "") {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        const email = normalizeEmail(req.body.email);
        const users = readSheet("Users");
        const alreadyExists = users.some((user) =>
            normalizeEmail(getField(user, ["email", "Email"])) === email
        );

        if (alreadyExists) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(String(req.body.password), 10);
        const userToSave = {
            name: String(req.body.name).trim(),
            email,
            passwordHash,
            phone: String(req.body.phone).trim(),
            age: String(req.body.age).trim(),
            gender: String(req.body.gender).trim(),
            weight: String(req.body.weight).trim(),
            goal: String(req.body.goal).trim(),
            domain: String(req.body.domain).trim(),
            program: String(req.body.program).trim(),
            createdAt: new Date().toISOString()
        };

        saveToExcel("Users", userToSave);
        const { passwordHash: _ignored, ...safeUser } = userToSave;
        res.status(201).json({ success: true, message: "Registration successful", user: safeUser });
    } catch (error) {
        res.status(500).json({ error: "Unable to register user" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const users = readSheet("Users");
        const user = users.find((row) => normalizeEmail(getField(row, ["email", "Email"])) === email);
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const storedHash = String(getField(user, ["passwordHash", "PasswordHash", "password", "Password"]));
        const isValidPassword = storedHash ? await bcrypt.compare(password, storedHash) : false;
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const safeUser = {
            name: getField(user, ["name", "Name"]) || "",
            email: getField(user, ["email", "Email"]) || "",
            phone: getField(user, ["phone", "Phone"]) || "",
            age: getField(user, ["age", "Age"]) || "",
            gender: getField(user, ["gender", "Gender"]) || "",
            weight: getField(user, ["weight", "Weight"]) || "",
            goal: getField(user, ["goal", "Goal"]) || "",
            domain: getField(user, ["domain", "Domain"]) || "",
            program: getField(user, ["program", "Program"]) || ""
        };

        res.json({ success: true, message: "Login successful", user: safeUser });
    } catch (error) {
        res.status(500).json({ error: "Unable to login" });
    }
});

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
