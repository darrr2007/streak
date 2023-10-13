const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const puppeteer = require("puppeteer");


const app = express();
const port = 9000;

//multer is to store files temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

//checking if it is connected or not
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileContent = req.file.buffer.toString();

  // Convert the string to an HTML file
  const htmlFilePath = "uploaded.html";

  fs.writeFileSync(htmlFilePath, fileContent);

  // Function to convert HTML to PDF using Puppeteer
  async function convertHTMLToPDF(inputFilePath, outputFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const content = fs.readFileSync(inputFilePath, "utf8");
    await page.setContent(content);

    
      const contentBox = await page.evaluate(() => {
      const element = document.querySelector("div"); 
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
      };
    });

    const pdfWidth = contentBox.width;
    const pdfHeight = contentBox.height;

    await page.pdf({
      path: outputFilePath,
      width: pdfWidth, 
      height: pdfHeight, 
      printBackground: true
    });

     await page.screenshot({ path: 'output.png' });

    

    await browser.close();
  }

  try {
    const outputFilePath = "server.pdf";
    await convertHTMLToPDF(htmlFilePath, outputFilePath);
    res.download(outputFilePath);
  } catch (error) {
    res.status(500).send("Error converting to PDF");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
