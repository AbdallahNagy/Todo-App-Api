const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");

const signAsync = util.promisify(jwt.sign);
const verifyAsync = util.promisify(jwt.verify);

const customError = require("./ErrorHandling");

const secretKey = process.env.SECRET_KEY || "kdeimco";

const comparePasswd = async (password, hash) => {
    const isMath = await bcrypt.compare(password, hash);
    if (!isMath) throw customError(401, "invalid email or password");
};

// grand token to user
const signUserToken = (id) => signAsync({ id }, secretKey);

// verify authorize user (middleware)
const authorizeUser = async (req, res, next) => {
    // const { id } = req.params
    const { authorization: token } = req.headers;
    try {
        const payload = await verifyAsync(token, secretKey);
        req.params.id = payload.id;
        next();
    } catch (error) {
        next(customError(403, "unauthorized"));
    }
};

module.exports = {
    comparePasswd,
    signUserToken,
    authorizeUser,
};
