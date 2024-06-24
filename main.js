// ESM
import Fastify from "fastify";
import puppeteer from "puppeteer";
import fastifyCors from "@fastify/cors";
import dotenv from "dotenv"
dotenv.config()

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCors, {
  origin: "*", // Allow requests from any origin
});

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});
fastify.post("/html2pdf", async (request, reply) => {
  try {
    const { html } = request.body; // Extract HTML from the request body

    if (!html) {
      reply.status(400).send({ error: "HTML content is required" });
      return;
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Add these args to prevent sandbox issues in some environments
      timeout: 60000, // Increase the launch timeout to 60 seconds
    });
    const page = await browser.newPage();

    // Set the content of the page to the received HTML
    await page.setContent(html, { waitUntil: "networkidle0" }); // Wait until the network is idle

    // Generate PDF from the content
    const pdfBuffer = await page.pdf({
      format: "A3",
      printBackground: true,
      timeout: 10000, // Increase the PDF generation timeout to 60 seconds
    });

    await browser.close();

    // Send the PDF file as response
    reply.type("application/pdf").send(pdfBuffer);
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to generate PDF" });
  }
});

fastify.listen({ port: process.env.PORT || 3001 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
