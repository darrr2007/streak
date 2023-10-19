const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const archiver = require("archiver");
const { Readable } = require("stream");
const handlebars = require("handlebars");
var https = require("https");

const app = express();
const port = process.env.PORT || 443;

let browser;

puppeteer
  .launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable--accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  })
  .then((res) => {
    browser = res;
  });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const certificates = [
  {
    path: "./templates/OutstandingCertificate.html",
    id: "OutstandingCertificate",
  },
  {
    path: "./templates/ParticipationCertificate.html",
    id: "ParticipationCertificate",
  },
  {
    path: "./templates/ReportsWOTax.html",
    id: "ReportsWOTax",
  },
  {
    path: "./templates/ReportsWTax.html",
    id: "ReportsWTax",
  },
];

app.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const buffer = req.file.buffer;

  const data = await parseCSVBuffer(buffer);
  console.log(data);
  const promises = data.map(async (csvRowData) => {
    const pdfPromises = certificates.map(async (certificate) => {
      const certificateHtml = await generateCertificateHtml(
        certificate,
        csvRowData
      );
      const pdfFilePath = `./certificates/${csvRowData.rank}.${certificate.id}.pdf`;
      await convertHTMLToPDF(certificateHtml, pdfFilePath);
    });

    await Promise.all(pdfPromises);
  });

  await Promise.all(promises);

  const zipFileName = `${data[0].name}_certificates.zip`;

  createAndSendZip(res, zipFileName);
});

async function generateCertificateHtml(certificate, csvRowData) {
  const data = await fs.promises.readFile(certificate.path, "utf8");
  const template = handlebars.compile(data);
  return template(csvRowData);
}

async function convertHTMLToPDF(content, outputFilePath) {
  const page = await browser.newPage();
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
    // printBackground: true,
  });
}

async function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    const bufferStream = new Readable();
    bufferStream._read = () => {};
    bufferStream.push(buffer);
    bufferStream.push(null);

    bufferStream
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function createAndSendZip(res, zipFileName) {
  const directoryPath = "./certificates";
  const zip = archiver("zip", {
    zlib: { level: 9 },
  });

  zip.pipe(res);
  zip.on("error", (err) => {
    res.status(500).send("Error creating the zip file");
  });

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      res.status(500).send("Error reading the directory");
    } else {
      files.forEach((file) => {
        const filePath = `${directoryPath}/${file}`;
        zip.file(filePath, { name: file });
      });

      zip.finalize();
      res.attachment(zipFileName);
    }
  });
}

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

https
  .createServer(
    {
      key: fs.readFileSync("./certs/server.key"),
      cert: fs.readFileSync("./certs/server.cert"),
    },
    app
  )
  .on("connection", function (socket) {
    socket.setTimeout(10000);
  })
  .listen(port, function () {
    console.log(`server is running on port ${port}`);
  });
