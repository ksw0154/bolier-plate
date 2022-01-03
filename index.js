const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");
const mongoose = require("mongoose");

// application/x-www-form-urlencoded 에 대한 정보를 분석해서 가져오는 것
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log("MongoDB conntected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hi");
});

// 회원가입
app.post("/api/users/register", (req, res) => {
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

app.post("/api/users/login", (req, res) => {
  // 요청된 email을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 요청한 email이 데이터베이스에 있다면 비밀번호가 같은지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      // 비밀번호까지 같다면 Token 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? (쿠키, 로컬스토리지, 세션 등)
        res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

// auth라는 미들웨어를 추가한다.
app.get("/api/users/auth", auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 얘기는 authentication이 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => console.log(`Example App listening on port ${port}`));
