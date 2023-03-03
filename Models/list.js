const mongoose = require("mongoose");
const { Schema } = mongoose;

const listsSchema = new Schema({
    title: String,
    todos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Todo",
        },
    ]
});

const List = mongoose.model("List", listsSchema);

module.exports = List;
