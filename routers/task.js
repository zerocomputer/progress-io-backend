const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const TaskController = require("../controllers/task");

const AuthMiddleware = require("../middlewares/auth");
const MulterMiddleware = require("../middlewares/multer");

/**
 * Роутер системы задач
 * @author Nikita Sarychev
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.put(
            "/add", 
            [
                AuthMiddleware,
                ValidatorUtils.project.projectId,
                ValidatorUtils.project.title,
                ValidatorUtils.project.description,
                TaskController.add.bind(TaskController)
            ]
        );

        console.log(`Метод Задача->добавление успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                ValidatorUtils.project.title,
                ValidatorUtils.project.description,
                TaskController.edit.bind(TaskController)
            ]
        );

        console.log(`Метод Задача->редактирование успешно добавлен`);

        this.router.patch(
            "/changeStatus", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                TaskController.changeStatus.bind(TaskController)
            ]
        );

        console.log(`Метод Задача->изменение_статуса успешно добавлен`);

        this.router.post(
            "/addAttachment", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                MulterMiddleware.single("file"),
                TaskController.addAttachment.bind(TaskController)
            ]
        );

        console.log(`Метод Задача->добавление_вложения успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                TaskController.remove.bind(TaskController)
            ]
        );

        console.log(`Метод Задача->удаление успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/task", this.router);
    }
}