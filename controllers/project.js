const bcrypt = require("bcrypt");
const { Types } = require("mongoose");

const DataGeneratorUtils = require("../utils/dataGenerator");

const References = require("../models/index");
const AccountModel = require("../models/account");
const AccountRoleModel = require("../models/accountRole");
const ProjectModel = require("../models/project");
const ProjectTaskModel = require("../models/projectTask");
const CommentModel = require("../models/comments");

/**
 * Контроллер проекта
 * @author Nikita Sarychev
 */
module.exports = {
    /**
     * Создание проекта
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    create: async function (req, res) {
        const {
            title,
            description,
            tasks
        } = req.body;

        let createdProject;
        if (!(createdProject = await ProjectModel.create({title, description, authorAccountId: req.account._id}))) {
            return res.status(500).json({message: `Неизвестная ошибка записи в БД`});
        }

        let taskIds = [];
        for (let task of tasks) {

            let createdTask;
            if (
                task.title.length === 0 ||
                !(createdTask = await ProjectTaskModel.create(
                    {
                        title: task.title, 
                        description: task.description ?? "", 
                        projectId: createdProject._id
                    }
                ))
            ) {
                console.log(`Критическая ошибка добавления задачи (${JSON.stringify(task)}) в БД`);
                continue;
            }

            taskIds.push(createdTask._id);
        }

        return res.status(200).json({projectId: createdProject._id, taskIds});
    },

    /**
     * Получение списка проектов
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getList: async function (req, res) {
        let foundProjects;
        if (req.account.role.isSubscriber) {
            foundProjects = await ProjectModel.find({authorAccountId: req.account._id})
        }

        if (foundProjects.length === 0) {
            return res.status(404).json({message: "Проекты не найдены"});
        } else {
            return res.status(200).json({projects: foundProjects});
        }
    },

    /**
     * Получение подробной информации о проекте
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getInfo: async function (req, res) {
        const {
            projectId
        } = req.query;

        let foundProject;
        if (!(foundProject = await ProjectModel.aggregate(
            [
                {
                    $match: {
                        _id: new Types.ObjectId(projectId),
                        $or: [
                            {
                                authorAccountId: req.account._id
                            },
                            {
                                accessAccountIds: {
                                    $in: [req.account._id]
                                }
                            }
                        ]
                    }
                },
                {
                    $lookup: {
                        localField: "_id",
                        foreignField: "projectId",
                        from: References.projectTask.name,
                        as: "tasks",
                        pipeline: [
                            {
                                $lookup: {
                                    localField: "_id",
                                    foreignField: "projectTaskId",
                                    from: References.projectTaskAttachment.name,
                                    as: "attchments"
                                }
                            }
                        ]
                    }  
                },
                {
                    $limit: 1
                }
            ]
        ))) {
            return res.status(404).json({message: "Проект не найден"});
        }

        let passedTasks = 0;
        for (let task of foundProject[0].tasks) {
            if (task.status.isPassed || task.status.isSuccess) {
                passedTasks++;
            }
        }

        return res.status(200).json({project: foundProject[0], projectTaskCount: foundProject[0].tasks.length, projectTaskPassedCount: passedTasks});
    },

    /**
     * Редактирование основной информации проекта
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    edit: async function (req, res) {
        const {
            projectId,
            title,
            description
        } = req.body;

        let foundProject;
        if (!(foundProject = await ProjectModel.findById(new Types.ObjectId(projectId)))) {
            return res.status(404).json({message: "Проект c указанным ID не найден"});
        }

        let projectData = {title};
        if (description || description !== "") {
            projectData = Object.assign(projectData, {description});
        }

        if (!(await foundProject.update(projectData))) {
            return res.status(500).json({message: "Ошибка изменения проекта в БД"});
        }

        return res.status(200).end();
    },

    /**
     * Удаление проекта
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    remove: async function (req, res) {
        const {
            projectId
        } = req.body;

        let foundProject;
        if (!(foundProject = await ProjectModel.findById(new Types.ObjectId(projectId)))) {
            return res.status(404).json({message: "Проект с указанным ID не найден"}).end();
        }

        if (!(await foundProject.delete())) {
            return res.status(500).json({message: "Ошибка удаления проекта из БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Создание аккаунта для клиентов
     * или открытие доступа уже существующему
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    createClientAccount: async function (req, res) {
        const {
            projectId,
            login,
            email,
            firstName,
            lastName
        } = req.body;

        let foundProject;
        if (!(foundProject = await ProjectModel.findById(new Types.ObjectId(projectId)))) {
            return res.status(404).json({message: "Проект с указанным ID не найден"}).end();
        }

        let accessAccountId;
        let createdAccountData = {};
        let foundAccount;
        if (!(foundAccount = await AccountModel.findOne({$or: [{login}, {email}]}))) {
            if (!email) {
                return res.status(400).json({message: "Электронная почта не была отправлена"}).end();
            }

            let foundRole;
            if (!(foundRole = await AccountRoleModel.findOne({name: "user"}))) {
                return res.status(500).json({message: "Роль 'user' отсутствует в системе"}).end();
            }

            const accountEmail = email;
            const accountLogin = (login.length > 0) ? login : await DataGeneratorUtils.login(accountEmail);
            const accountPassword = DataGeneratorUtils.password();
            createdAccountData = {
                accountRoleId: foundRole._id,
                email: accountEmail,
                login: accountLogin,
                passwordHash: bcrypt.hashSync(accountPassword, 2),
                firstName: firstName ?? "",
                lastName: lastName ?? ""
            };

            let createdAccount;
            try {
                if (!(createdAccount = await AccountModel.create(createdAccountData))) {
                    return res.status(500).json({message: "Ошибка записи аккаунта клиента в БД"}).end();
                }
            } catch (e) {
                console.log(`Критическая ошибка создания аккаунта: ${e}`);
                return res.status(500).json({message: "Ошибка записи аккаунта клиента в БД"}).end();
            }

            delete createdAccountData.passwordHash;
            createdAccountData.password = accountPassword;
            accessAccountId = createdAccount._id;
        } else {
            accessAccountId = foundAccount._id;
        }

        if (
            foundProject.authorAccountId === accessAccountId ||
            foundProject.accessAccountIds.indexOf(accessAccountId) !== -1
        ) {
            return res.status(500).json({message: "Указанный аккаунт уже имеет доступ к проекту"}).end();
        }

        if (!(await foundProject.update({$push: {accessAccountIds: accessAccountId}}))) {
            return res.status(500).json({message: "Ошибка записи доступа аккаунта в БД"}).end();
        }

        let responseObject = {};
        if (Object.keys(createdAccountData).length > 0) {
            responseObject = Object.assign(responseObject, {clientAccount: createdAccountData});
        }

        return res.status(200).json(responseObject).end();
    },
}