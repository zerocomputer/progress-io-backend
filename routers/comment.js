const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const CommentController = require("../controllers/comment");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы комментариев
 * @author Nikita Sarychev
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/send", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                ValidatorUtils.project.text,
                CommentController.send.bind(CommentController)
            ]
        );

        console.log(`Метод Комментарий->отправка успешно добавлен`);

        this.router.get(
            "/getList", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                CommentController.getList.bind(CommentController)
            ]
        );

        console.log(`Метод Комментарий->получение_списка успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                ValidatorUtils.project.text,
                CommentController.edit.bind(CommentController)
            ]
        );

        console.log(`Метод Комментарий->редактирование успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.project.taskId,
                CommentController.remove.bind(CommentController)
            ]
        );

        console.log(`Метод Комментарий->удаление успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/comment", this.router);
    }
}