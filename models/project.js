const {Schema, Types, model} = require("mongoose");
const { account, project } = require("./index");

const ProjectSchema = new Schema (
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        accessAccountIds: [
            {
                type: Types.ObjectId
            }
        ],

        authorAccountId: {
            type: Types.ObjectId,
            ref: account.name
        }
    }
);

module.exports = model(project.name, ProjectSchema);