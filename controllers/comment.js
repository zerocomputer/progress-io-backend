const { Types } = require("mongoose");

const References = require("../models");
const AccountModel = require("../models/account");
const ProjectTaskModel = require("../models/projectTask");
const CommentModel = require("../models/comments");

/**
 * Пак методов для работы с комментариями
 * @author Nikita Sarychev
 */
module.exports = {
/**
     * Отправка комментария
     * 
     * @param {object} req 
     * @param {object} res
     * @returns
     */
    send: async function (req, res) {
        const {
            taskId,
            text
        } = req.body;

        if (!(await ProjectTaskModel.findById(new Types.ObjectId(taskId)))) {
            return res.status(404).json({message: "Задача с указанным ID не найдена"}).end();
        }

        let createdComment;
        if (!(createdComment = await CommentModel.create(
            {
                projectTaskId: taskId,
                authorAccountId: req.account._id,
                text
            }
        ))) {
            return res.status(500).json({message: "Ошибка записи комментария в БД"}).end();
        }

        return res.status(200).json({commentId: createdComment._id}).end();
    },

    /**
     * Получение списка комментариев к задаче 
     * (и т.д. в будущем)
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    getList: async function (req, res) {
        const {
            taskId
        } = req.query;

        let foundComments;
        if ((foundComments = await CommentModel.aggregate(
            [
                {
                    $match: {
                        projectTaskId: new Types.ObjectId(taskId)
                    }
                },
                {
                    $lookup: {
                        from: References.account.name,
                        localField: "authorAccountId",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $limit: 1
                            }
                        ],
                        as: "authorAccount"
                    }
                },
                {
                    $unwind: "$authorAccount"
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Комментарии не найдены"}).end();
        }

        return res.status(200).json({comments: foundComments}).end();
    },

    /**
     * Редактирование комментариев
     * 
     * @param {object} req 
     * @param {object} res
     * @returns
     */
    edit: async function (req, res) {
        const {
            commentId,
            text
        } = req.body;

        let foundComment;
        if (!(foundComment = await CommentModel.findById(new Types.ObjectId(commentId)))) {
            return res.status(404).json({message: "Комментарий с указанным ID не найден"}).end();
        }

        if (!(await foundComment.update({text}))) {
            return res.status(500).json({message: "Ошибка записи изменений комментария в БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Удаление комментариев
     * 
     * @param {object} req 
     * @param {object} res
     * @returns
     */
    remove: async function (req, res) {
        const {
            commentId
        } = req.body;

        let foundComment;
        if (!(foundComment = await CommentModel.findById(new Types.ObjectId(commentId)))) {
            return res.status(404).json({message: "Комментарий с указанным ID не найден"}).end();
        }

        if (!(await foundComment.delete())) {
            return res.status(500).json({message: "Ошибка удаления комментария из БД"}).end();
        }

        return res.status(200).end();
    }
}