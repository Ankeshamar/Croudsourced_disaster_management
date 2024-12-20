const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Serve static files like CSS, JS
app.use(express.static(path.join(__dirname, 'public/')));

// Mock user data for demonstration
const users = [
    { email: "user@example.com", password: "password123", role: "user" },
    { email: "admin@example.com", password: "adminpass", role: "editor" }
];

// Mock disaster data
const disasterReports = [];

// Handle login POST request
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.status(200).json({ success: true, message: "Login successful", role: user.role });
    } else {
        res.status(401).json({ success: false, message: "Invalid email or password" });
    }
});

// Editor check middleware
const checkEditor = (req, res, next) => {
    const { email } = req.query; // Use token-based authentication in production
    const user = users.find(u => u.email === email);

    if (user && user.role === "editor") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Unauthorized access" });
    }
};

// Report disaster route with file upload
app.post("/reportDisaster", upload.single("image"), (req, res) => {
    console.log(req.body);  // Check the form data
    console.log(req.file);  // Check the file data
    const { name, email, phone, description, latitude, longitude } = req.body;

    if (name && email && phone && description && latitude && longitude) {
        // Optionally store file info from req.file
        const fileInfo = req.file;

        disasterReports.push({
            name,
            email,
            phone,
            description,
            latitude,
            longitude,
            imageUrl: fileInfo ? fileInfo.path : null
        });

        res.status(200).json({ success: true, message: "Disaster report submitted!" });
    } else {
        res.status(400).json({ success: false, message: "All fields are required!" });
    }
});

// Get all disaster reports (Editor only)
app.get("/getDisasters", checkEditor, (req, res) => {
    res.status(200).json(disasterReports);
});

// Serve dashboard.html after successful login
app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});