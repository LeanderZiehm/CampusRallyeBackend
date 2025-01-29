const express = require("express");
const https = require("https");
const dotenv = require("dotenv");
const cors = require('cors');


dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const sheetIdDE = process.env.SHEET_ID_DE;
const sheetIdEN = process.env.SHEET_ID_EN;

const getSheetUrl = (language) => {
    const sheetId = language === "de" ? sheetIdDE : sheetIdEN;
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
};

const fetchSheetData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let csvData = "";

            res.on("data", (chunk) => {
                csvData += chunk;
            });

            res.on("end", () => {
                resolve(csvToJson(csvData));
            });
        }).on("error", (err) => {
            reject("Error fetching Google Sheets: " + err.message);
        });
    });
};

function csvToJson(data) {
    const lines = data.split("\n").map(line => line.trim()).filter(line => line);
    const jsonData = { questions: [] };

    lines.slice(1).forEach(line => {
        const parts = line.split(/,(.+)/);
        if (parts.length < 2) return;

        const key = parts[0].replace('"', '').replace('"', '');
        let value = parts[1].trim().replace(/^"|"$/g, "").replace(/""/g, '"');

        if (key.startsWith("question_")) {
            const parts = key.split("_");
            const index = parseInt(parts[1], 10);
            const field = parts.slice(2).join("_");

            if (!jsonData.questions[index]) {
                jsonData.questions[index] = {};
            }
            jsonData.questions[index][field] = value;
        } else {
            jsonData[key] = value;
        }
    });

    return jsonData;
}


app.get("/", async (req, res) => {
    try {
        const data = await fetchSheetData(getSheetUrl("de"));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
});


// German Sheet Endpoint
app.get("/de", async (req, res) => {
    try {
        const data = await fetchSheetData(getSheetUrl("de"));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
});

// English Sheet Endpoint
app.get("/en", async (req, res) => {
    try {
        const data = await fetchSheetData(getSheetUrl("en"));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});