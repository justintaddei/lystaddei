const express = require("express");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const { v4: uuid } = require("uuid");
const fs = require("fs");

require("dotenv").config();

const nodemailer = require("nodemailer");

// Create the transporter with the required configuration for Outlook
// change the user and pass !
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // hostname
  secureConnection: false, // TLS requires secureConnection to be false
  port: 587, // port for secure SMTP
  tls: {
    ciphers: "SSLv3"
  },
  auth: {
    user: process.env.OUTLOOK_ADDRESS,
    pass: process.env.OUTLOOK_PASSWORD
  }
});

const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: "static/uploads/",
    filename(req, file, cb) {
      cb(null, `${uuid()}${path.extname(file.originalname)}`);
    }
  })
});

const JSON_PATH = `./static/uploads.json`;
function getPortfolioJSON() {
  return new Promise(resolve => {
    fs.readFile(JSON_PATH, (err, data) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      resolve(JSON.parse(data));
    });
  });
}

function auth(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) return res.redirect("/login");

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    res.status(400).send("Invalid Token");
  }
}

app.use(express.json());
app.use(cookieParser());

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USER)
    return res.status(401).send("Invalid username or password");

  const valid = await bcrypt.compare(password, process.env.ADMIN_PASS);

  if (valid !== true)
    return res.status(401).send("Invalid username or password");

  const token = jwt.sign({ loggedIn: true }, process.env.JWT_SECRET);

  res.header("auth-token", token).send(token);
});

app.post(
  "/api/upload",
  auth,
  upload.single("uploadedFile"),
  async (req, res) => {
    if (!req.file) return res.status(400).send("File not received");

    const filename = `/uploads/${req.file.filename}`;

    const json = await getPortfolioJSON();

    json.uploads.unshift(filename);

    fs.writeFile(JSON_PATH, JSON.stringify(json, null, 2), err => {
      if (err) {
        res.sendStatus(500);
        console.error(err);
      }

      res.status(200).send("uploaded");
    });
  }
);

app.delete("/api/upload/:img", auth, async (req, res) => {
  const { img } = req.params;

  const json = await getPortfolioJSON();

  fs.unlink(path.join(__dirname, "/static", img), err => {
    if (err) return res.status(500).send(err.toString());

    json.uploads.splice(json.uploads.indexOf(img), 1);

    fs.writeFile(JSON_PATH, JSON.stringify(json, null, 2), err => {
      if (err) {
        res.sendStatus(500);
        console.error(err);
      }

      res.status(200).send("delete");
    });
  });
});

app.get("/login", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/admin/login.html"));
});

app.use("/admin", auth, express.static("./admin"));

app.post("/submit", async (req, res) => {
  const { name, email, message, recaptchaResponse } = req.body;

  if (!name || !email || !message || !recaptchaResponse)
    return res.status(400).send("Missing fields");

  try {
    const { success } = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaResponse}`,
      {
        method: "POST"
      }
    ).then(res => res.json());

    if (!success) return res.status(400).send("ReCaptcha failed");
  } catch (e) {
    return res.status(500).send("Can't reach google");
  }

  // setup e-mail data, even with unicode symbols
  const mailOptions = {
    from: `"Lys Taddei" <${process.env.OUTLOOK_ADDRESS}>`, // sender address (who sends)
    to: process.env.GMAIL_ADDRESS, // list of receivers (who receives)
    replyTo: email,
    subject: `Website form submission from ${name}`, // Subject line
    html: `
        <h1>Inquiry</h1>
        <ul>
            <li>Name: ${name}</li>
            <li>Email: <a href="mailto:${email}">${email}</a></li>
        </ul>
        <h2>Message:</h2>
        <p>${message}</p>
    `
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error(error);
      return res.status(500).send("Failed to send. Please try again.");
    }
    res.status(200).send("Message sent");
  });
});

app.use("/", express.static("./static"));

const addr = process.env.NODE_ENV === "production" ? "localhost" : "0.0.0.0";
app.listen(process.env.PORT, addr, err => {
  if (err) console.error(err);

  console.log(`Server running on ${addr}:${process.env.PORT}`);
});
