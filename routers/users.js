const express = require("express");
const userRouter = express.Router();

const bcrypt = require("bcrypt");
const User = require("../Models/user");

const {
    comparePasswd,
    signUserToken,
    authorizeUser,
} = require("../userHelpers");
const customError = require("../ErrorHandling");

// login
userRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) throw customError(401, "email is required");
        if (!password) throw customError(401, "password is required");

        const user = await User.findOne({ email });
        if (!user) throw customError(401, "invalid email or password");

        await comparePasswd(password, user.password);

        const genToken = await signUserToken(user._id);
        res.status(200).json({ accessToken: genToken });
    } catch (error) {
        next(error);
    }
});

// sign up
userRouter.post("/", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username) throw customError(401, "username is required");
        if (!email) throw customError(401, "email is required");
        if (!password) throw customError(401, "password is required");

        const userExist = await User.findOne({ email });
        if (userExist) throw customError(401, "user already exist");

        const hashedPasswd = await bcrypt.hash(password, 7);

        const createdUser = await User.create({
            username,
            email,
            password: hashedPasswd,
        });

        const token = await signUserToken(createdUser._id);
        res.status(200).json({ accessToken: token });
    } catch (err) {
        next(err);
    }
});

//get all users
userRouter.get("/", async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.next(err);
    }
});

// get user by id
userRouter.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.send(user);
    } catch (error) {
        next(error);
    }
});

// edit user
userRouter.patch("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const hashedPasswd = await bcrypt.hash(password, 7);

        const user = {
            username,
            email,
            password: hashedPasswd,
        };
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

//delete user by id
userRouter.delete("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.send("done");
    } catch (error) {
        next(error);
    }
});

module.exports = userRouter;
