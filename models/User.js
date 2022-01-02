const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

const User = mongoose.model("User", userSchema);

module.exports = { User };
