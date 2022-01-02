const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
const config = require("./config/key");

const { User } = require("./models/User");
const mongoose = require("mongoose");

// application/x-www-form-urlencoded 에 대한 정보를 분석해서 가져오는 것
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB conntected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", (req, res) => {
  // 회원가입할 때 필요한 정보들을 client에서 가져오면 데이터베이스에 넣어준다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    // 실패했을 때
    if (err) return res.json({ success: false, err });
    // 성공했을 때
    return res.status(200).json({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example App listening on port ${port}`));
