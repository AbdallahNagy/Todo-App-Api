const express = require("express");
const listRouter = express.Router();

const List = require("../Models/list");
const User = require("../Models/user");
const Todo = require("../Models/todo");
const { authorizeUser } = require("../userHelpers");
const customError = require("../ErrorHandling");

// create list
listRouter.post("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        // create list
        const list = await List.create({ title });

        // link list to user
        const user = await User.findById(id);
        user.lists.push(list._id);
        user.save();

        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
});

//get all user lists
listRouter.get("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        const popUser = await user.populate("lists");

        res.send(popUser.lists); // array of lists
    } catch (error) {
        next(error);
    }
});

// edit list by id
listRouter.patch("/:listId", authorizeUser, async (req, res, next) => {
    try {
        const { listId } = req.params;
        const { title } = req.body;

        if (!title) throw customError(401, "title is required");

        const updatedList = await List.findByIdAndUpdate(
            listId,
            { title },
            { new: true }
        );
        if (!updatedList) throw customError(404, "list not found");

        res.send(updatedList);
    } catch (error) {
        next(error);
    }
});

// delete list by id
listRouter.delete("/:listId", authorizeUser, async (req, res, next) => {
    try {
        const { listId, id } = req.params;

        const user = await User.findById(id);
        await Todo.deleteMany({ list: listId });

        const deletedList = await List.findByIdAndDelete(listId);
        if (!deletedList) throw customError(404, "list not found");

        const updatedList = user.lists.filter(list => list != listId);
        user.lists = updatedList;
        user.save();

        res.send(updatedList);
    } catch (error) {
        next(error);
    }
});

module.exports = listRouter;
