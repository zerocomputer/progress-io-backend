const {Schema, Types, model} = require("mongoose");
const { account, projectTask, comments } = require("./index");

const CommentSchema = new Schema (
    {
        projectTaskId: {
            type: Types.ObjectId,
            ref: projectTask.name
        },

        authorAccountId: {
            type: Types.ObjectId,
            ref: account.name
        },

        text: {
            type: String,
            required: true
        }
    }
);

module.exports = model(comments.name, CommentSchema);