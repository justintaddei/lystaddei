const express = require("express");

const app = express();

app.use("/", express.static("./static"));

app.listen(80, "0.0.0.0", err => {
  if (err) console.error(err);
});
