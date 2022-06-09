const {Schema, Types, model} = require("mongoose");
const { project, projectTask } = require("./index");

const ProjectTaskSchema = new Schema (
    {
        projectId: {
            type: Types.ObjectId,
            ref: project.name,
            required: true
        },

        title: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

        status: {
            isProgress: {
                type: Boolean,
                default: false
            },

            isSuccess: {
                type: Boolean,
                default: false
            },

            isVerify: {
                type: Boolean,
                default: false
            },

            isPassed: {
                type: Boolean,
                default: false
            },
        }
    }
);

module.exports = model(projectTask.name, ProjectTaskSchema);