const cors = require("cors");
const express = require("express");

const StartupArgumentsUtils = require("./utils/startupArguments");

const AccountRouter = require("./routers/account");
const ProjectRouter = require("./routers/project");
const TaskRouter = require("./routers/task");
const CommentRouter = require("./routers/comment");

module.exports = {
    app: express(),

    arguments: {
        WEBSERVER_IP: false,
        WEBSERVER_PORT: false
    },

    init: function () {
        for (let key in this.arguments) {
            const argumentValue = StartupArgumentsUtils.getArgument(key);

            if (argumentValue) {
                this.arguments[key] = argumentValue;
            } else {
                throw Error(`Ошибка получения аргумента "${key}"`);
            }
        }

        this.app.use(cors());
        this.app.use(express.json());

        // Подключение роутера "Аккаунт"
        AccountRouter.attach(this.app);
        // Подключение роутера "Проект"
        ProjectRouter.attach(this.app);
        // Подключение роутера "Задача"
        TaskRouter.attach(this.app);
        // Подключение роутера "Комментарий"
        CommentRouter.attach(this.app);
    },

    start: function () {
        this.app.listen(this.arguments.WEBSERVER_PORT, this.arguments.WEBSERVER_IP, () => {
            console.log(`Веб-сервер запущен: http://localhost:${this.arguments.WEBSERVER_PORT}`);
        });
    }
}