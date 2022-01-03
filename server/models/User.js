const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  // token 유효기간
  tokenExp: {
    type: Number,
  },
});

// mongoose의 save함수가 돌기 전에(index.js에서 user.save 직전)
userSchema.pre("save", function (next) {
  let user = this;
  // user에서 password가 변경될 때만 아래의 내용을 실행한다.
  // 새로 생성하는 user는 isModified가 무조건 true
  if (user.isModified("password")) {
    // 비밀번호를 암호화 시킨다.
    // salt를 이용해서 비밀번호를 암호화해야 한다.
    // salt를 먼저 생성 (saltRounds: 만들고 싶은 salt 자리수)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      // salt 생성이 됐으면
      // user.password: 내가 입력한 비밀번호
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);

        // hash: 암호화 된 비밀번호
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.generateToken = function (callback) {
  const user = this;
  // jsonwebtoken을 이용해서 token을 생성하기
  // user._id와 'secretToken'을 합해서 token을 생성한다.
  // 'secretToken'을 통해서 user._id를 구할 수 있다.
  const token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
};

userSchema.statics.findByToken = function (token, callback) {
  let user = this;

  // 토큰 decode
  // token 만들 때 사용한 string 필요
  jwt.verify(token, "secretToken", function (err, decoded) {
    // user id를 이용해서 user를 찾은 다음에
    // 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return callback(err);
      callback(err, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
