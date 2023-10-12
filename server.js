const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const puppeteer = require('puppeteer');

const app = express();
const port = 9000;

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileContent = req.file.buffer.toString();

  // Convert the string to an HTML file
  const htmlFilePath = 'uploaded.html';
  fs.writeFileSync(htmlFilePath, fileContent);

  // Function to convert HTML to PDF using Puppeteer
  async function convertHTMLToPDF(inputFilePath, outputFilePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const content = fs.readFileSync(inputFilePath, 'utf8');
    await page.setContent(content);

    await page.pdf({ path: outputFilePath, format: 'A4' });
    await browser.close();
  }

  try {
    const outputFilePath = 'server.pdf'
    await convertHTMLToPDF(htmlFilePath, outputFilePath);
    res.download(outputFilePath);
  } catch (error) {
    res.status(500).send('Error converting to PDF');
  }
});

// app.get('/api/get-pdf', (req, res) => {
//   const filePath = 'server.pdf';

//   // Check if the PDF file exists
//   if (fs.existsSync(filePath)) {
//     res.download(filePath);
//   } else {
//     res.status(404).send('File not found');
//   }
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
