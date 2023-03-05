const express = require("express");
const todoRouter = express.Router();

const customError = require("../ErrorHandling");
const { authorizeUser } = require("../userHelpers");
const Todo = require("../Models/todo");
const List = require("../Models/list");

const redis = require('redis');
const client = redis.createClient();
client.connect();
console.log("connected? ",client.isOpen); // this is true

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
            user: id,
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

        client.setEx("todos", 3600,"hamada");
        client.get('todos', (error, data) => {
            if(error) console.log(error);
            if(data) console.log(data)
        })
        res.json(todos);
    } catch (err) {
        next(err);
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

        const deletedTodo = await Todo.findByIdAndDelete(todoId, { new: true });
        if (!deletedTodo) throw customError(404, "todo not found");
        const list = await List.findById(deletedTodo.list);
        console.log(list);

        const i = list.todos.indexOf(todoId);
        list.todos.splice(i, 1);
        list.save();

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
