const {Schema, Types, model} = require("mongoose");
const { projectTask, projectTaskAttachment } = require("./index");

const ProjectTaskAttachmentSchema = new Schema (
    {
        projectTaskId: {
            type: Types.ObjectId,
            ref: projectTask.name
        },

        path: {
            type: String,
            required: true
        }
    }
);

module.exports = model(projectTaskAttachment.name, ProjectTaskAttachmentSchema);