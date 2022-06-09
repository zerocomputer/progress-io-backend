const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const AccountController = require("../controllers/account");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы аккаунтов
 * @author Nikita Sarychev
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/register", 
            [
                ValidatorUtils.account.email,
                ValidatorUtils.account.login,
                ValidatorUtils.account.password,
                AccountController.register.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->регистрация успешно добавлен`);

        this.router.post(
            "/login", 
            [
                ValidatorUtils.account.login,
                ValidatorUtils.account.password,
                AccountController.login.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->авторизация успешно добавлен`);

        this.router.get(
            "/getInfo", 
            [
                AuthMiddleware,
                AccountController.getInfo.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->авторизация успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/account", this.router);
    }
}