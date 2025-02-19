const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const testPdfPath = path.join(__dirname, "test.pdf");

try {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(testPdfPath));
    doc.fontSize(12).text("Hello, this is a test PDF.", 100, 100);
    doc.end();
    console.log("✅ PDF test file created successfully!");
} catch (err) {
    console.error("❌ PDF creation failed:", err);
}
