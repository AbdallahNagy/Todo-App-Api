const express = require("express");
const todoRouter = express.Router();

const customError = require("../ErrorHandling");
const { authorizeUser } = require("../userHelpers");
const Todo = require("../Models/todo");
const List = require("../Models/list");

//create todo by list id
todoRouter.post("/:listId", authorizeUser, async (req, res, next) => {
    try {
        const { listId, id } = req.params;
        const { title, status } = req.body;

        if (!title) throw customError(401, "title is required");
        if (!status) throw customError(401, "status is required");

        const todo = await Todo.create({
            title,
            status,
            list: listId,
            user: id,
        });

        // add todo to list
        const list = await List.findById(listId);
        list.todos.push(todo);
        list.save();

        res.json(todo);
    } catch (err) {
        next(err);
    }
});

//create todo without list
todoRouter.post("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, status } = req.body;
        const todo = await Todo.create({
            title,
            status,
            user:id
        });

        res.json(todo);
    } catch (err) {
        next(err);
    }
});

//get all user todos
todoRouter.get("/", authorizeUser, async (req, res, next) => {
    try {
        const { id } = req.params;
        const todos = await Todo.find({ user: id });
        res.json(todos);
    } catch (err) {
        res.next(err);
    }
});

// edit todo by id
todoRouter.patch("/:todoId", authorizeUser, async (req, res, next) => {
    try {
        const { todoId } = req.params;
        const { title, status } = req.body;

        if (!title) throw customError(401, "title is required");
        if (!status) throw customError(401, "status is required");

        const todoItem = {
            title,
            status,
        };
        const updatedTodo = await Todo.findByIdAndUpdate(todoId, todoItem, {
            new: true,
        });
        res.json(updatedTodo);
    } catch (error) {
        next(error);
    }
});

//delete todo by id
todoRouter.delete("/:todoId", authorizeUser, async (req, res, next) => {
    try {
        const { todoId } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        res.json(deletedTodo);
    } catch (error) {
        next(error);
    }
});

// get todo by id
todoRouter.get("/:todoId", authorizeUser, async (req, res, next) => {
    try {
        const { todoId } = req.params;
        const todo = await Todo.findById(todoId);
        res.json(todo);
    } catch (error) {
        next(error);
    }
});

module.exports = todoRouter;
