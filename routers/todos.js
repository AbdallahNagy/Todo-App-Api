const express = require("express");
const todoRouter = express.Router();

const customError = require("../ErrorHandling");
const { authorizeUser } = require("../userHelpers");
const Todo = require("../Models/todo");
const List = require("../Models/list");

/**
 * list 1 -> todo1, todo2, todo3
 * list 2
 * list 3
 * list 4
 */

//create todo by list id
todoRouter.post("/:listId", authorizeUser, async (req, res, next) => {
    try {
        const { listId } = req.params;
        const { title, status } = req.body;

        if (!title) throw customError(401, "title is required");
        if (!status) throw customError(401, "status is required");

        const todo = await Todo.create({
            title,
            status,
            list: listId,
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

// get all todos by list id
todoRouter.get("/:listId", authorizeUser, async (req, res, next) => {
    try {
        const { listId } = req.params;

        const todos = await Todo.find({ list: listId });
        res.json(todos);
    } catch (error) {
        next(error);
    }
});

//create todo
todoRouter.post("/", async (req, res, next) => {
    try {
        const { title, status } = req.body;
        const todoItem = new Todo({
            title,
            status,
            list,
        });
        
        await todoItem.save();
        res.send(todoItem);
    } catch (err) {
        next(err);
    }
});

//get all todos
todoRouter.get("/", async (req, res, next) => {
    try {
        const allTodos = await Todo.find({});
        res.send(allTodos);
    } catch (err) {
        res.next(err);
    }
});

// get todo by id
todoRouter.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const todoItem = await Todo.find({ _id: id });
        res.send(todoItem);
    } catch (error) {
        next(error);
    }
});

// edit todo by id
todoRouter.patch("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, status } = req.body;
        const todoItem = {
            title,
            status,
        };
        const query = await Todo.updateOne({ _id: id }, todoItem);
        res.send(query);
    } catch (error) {
        next(error);
    }
});

//delete todo by id
todoRouter.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = await Todo.deleteOne({ _id: id });
        res.send(query);
    } catch (error) {
        next(error);
    }
});

module.exports = todoRouter;
