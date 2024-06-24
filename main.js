import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // To handle large HTML content

app.post("/html2pdf", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send({ error: "HTML content is required" });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A3",
      printBackground: true,
      timeout: 60000,
    });

    await browser.close();

    res.type("application/pdf").send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to generate PDF" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
