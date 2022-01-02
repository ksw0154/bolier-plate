const express = require("express");
const app = express();
const port = 4000;

const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://sangs:wldnjs9!20@boilerplate.a7lf0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB conntected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example App listening on port ${port}`));
