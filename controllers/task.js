const { Types } = require("mongoose");

const ProjectModel = require("../models/project");
const ProjectTaskModel = require("../models/projectTask");
const ProjectTaskAttachment = require("../models/projectTaskAttachment");

/**
 * Пак методов сущности "Задача"
 * @author Nikita Sarychev
 */
module.exports = {
    /**
     * Добавление задач
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    add: async function (req, res) {
        const {
            projectId,
            title,
            description
        } = req.body;

        let foundProject;
        if (!(foundProject = await ProjectModel.findById(new Types.ObjectId(projectId)))) {
            return res.status(404).json({message: "Проект с указанным ID не найден"}).end();
        }

        let createdTask;
        if (!(createdTask = await ProjectTaskModel.create(
            {
                projectId,
                title,
                description
            }
        ))) {
            return res.status(500).json({message: "Ошибка добавления задачи в БД"}).end();
        }

        return res.status(200).json({taskId: createdTask._id}).end();
    },

    /**
     * Редактирование задачи
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    edit: async function (req, res) {
        const {
            taskId,
            title,
            description
        } = req.body;

        let foundTask;
        if (!(foundTask = await ProjectTaskModel.findById(new Types.ObjectId(taskId)))) {
            return res.status(404).json({message: "Задача с указанным ID не найдена"}).end();
        }

        if (!(await foundTask.update(
            {
                title,
                description
            }
        ))) {
            return res.status(500).json({message: "Ошибка обновления задачи в БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Изменение состояния задачи
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    changeStatus: async function (req, res) {
        const {
            taskId,
            isProgress,
            isSuccess,
            isVerify
        } = req.body;

        let foundTask;
        if (!(foundTask = await ProjectTaskModel.findById(new Types.ObjectId(taskId)))) {
            return res.status(404).json({message: "Задача с указанным ID не найдена"}).end();
        }

        if (!(await foundTask.update(
            {
                status: {
                    isProgress: (isSuccess) ? !isSuccess : isProgress ?? foundTask.isProgress,
                    isSuccess: isSuccess ?? foundTask.isSuccess,
                    isVerify: isVerify ?? foundTask.isVerify,
                    isPassed: (isSuccess && isVerify) ? true : false
                }
            }
        ))) {
            return res.status(500).json({message: "Ошибка обновления задачи в БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Удаление задачи
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    remove: async function (req, res) {
        const {
            taskId
        } = req.body;

        let foundTask;
        if (!(foundTask = await ProjectTaskModel.findById(new Types.ObjectId(taskId)))) {
            return res.status(404).json({message: "Задача с указанным ID не найдена"}).end();
        }

        if (!(await foundTask.delete())) {
            return res.status(500).json({message: "Ошибка удаления задачи из БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Добавление вложения к задаче
     * 
     * @param {object} req 
     * @param {object} res 
     */
    addAttachment: async function (req, res) {
        const {
            taskId
        } = req.body;

        const {
            file
        } = req;

        let foundTask;
        if (!(foundTask = await ProjectTaskModel.findById(new Types.ObjectId(taskId)))) {
            return res.status(404).json({message: "Задача с указанным ID не найдена"}).end();
        }

        let createdTaskAttachment;
        if (!(createdTaskAttachment = await ProjectTaskAttachment.create(
            {
                projectTaskId: taskId,
                path: file.path 
            }
        ))) {
            return res.status(500).json({message: "Ошибка записи вложения в БД"}).end();
        }

        return res.status(200).json({taskAttachemntId: createdTaskAttachment._id}).end();
    },
}