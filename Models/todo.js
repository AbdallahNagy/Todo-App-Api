const mongoose = require("mongoose");
const { Schema } = mongoose;

const todoSchema = new Schema({
    title: String,
    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
    },
    list: {
        type: Schema.Types.ObjectId,
        ref: "List",
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    dateDue: Date
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
