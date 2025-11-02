import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false, // required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Error parsing form data");

    const message = fields.message;
    const file = files.image;

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.TO_EMAIL,
        subject: "New Form Submission",
        text: message,
        attachments: file
          ? [
              {
                filename: file.originalFilename,
                path: file.filepath,
              },
            ]
          : [],
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send("<h3>Email sent successfully!</h3>");
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to send email.");
    } finally {
      if (file) await fs.unlink(file.filepath).catch(() => {});
    }
  });
}
