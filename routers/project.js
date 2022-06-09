const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const ProjectController = require("../controllers/project");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы проектов
 * @author Nikita Sarychev
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/create", 
            [
                AuthMiddleware,
                ValidatorUtils.project.title,
                ValidatorUtils.project.description,
                ValidatorUtils.project.tasks,
                ProjectController.create.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->создание успешно добавлен`);

        this.router.get(
            "/getList", 
            [
                AuthMiddleware,
                ProjectController.getList.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->получение_списка_проектов успешно добавлен`);

        this.router.get(
            "/getInfo", 
            [
                AuthMiddleware,
                ValidatorUtils.project.projectId,
                ProjectController.getInfo.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->получение_подробной_информации успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.project.projectId,
                ValidatorUtils.project.title,
                ValidatorUtils.project.description,
                ProjectController.edit.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->редактирование_основной_информации успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.project.projectId,
                ProjectController.remove.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->удаление успешно добавлен`);

        this.router.post(
            "/createClientAccount", 
            [
                AuthMiddleware,
                ValidatorUtils.project.projectId,
                ValidatorUtils.account.firstName,
                ValidatorUtils.account.lastName,
                ValidatorUtils.account.email,
                ValidatorUtils.account.loginNotRequired,
                ProjectController.createClientAccount.bind(ProjectController)
            ]
        );

        console.log(`Метод Проект->создание_аккаунта_для_клиента успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/project", this.router);
    }
}