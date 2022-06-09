const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const StartupArgumentsUtils = require("../utils/startupArguments");

const AccountModel = require("../models/account");
const AccountRoleModel = require("../models/accountRole");
const AccountSessionModel = require("../models/accountSession");

/**
 * Методы системы аккаунтов
 * @author Nikita Sarychev
 */
module.exports = {
    JWT_SECRET_KEY: false,

    /**
     * Генерация новой автризацонной сессии
     * 
     * @param {object} account 
     * @param {Number} expiresIn 
     * @returns 
     */
    generateSession: async function (account, expiresIn = 60 * 60 * 24 * 7 * 4) {
        const responseExpiresIn = Math.floor(Date.now()/1000) + expiresIn;

        // Получение секретного ключа для генерации JWT
        if (!this.JWT_SECRET_KEY) {
            if (!(this.JWT_SECRET_KEY = StartupArgumentsUtils.getArgument("JWT_SECRET_KEY"))) {
                throw Error ("Не указан JWT_SECRET_KEY");
            }
        }

        const createdSession = await AccountSessionModel.create(
            {
                accountId: account._id, 
                expiresIn: responseExpiresIn
            }
        );

        const jwtToken = jwt.sign(
            { sessionId: createdSession._id }, 
            this.JWT_SECRET_KEY, 
            { expiresIn }
        );

        return {
            token: jwtToken,
            expiresIn: responseExpiresIn
        }
    },

    /**
     * Регистрация аккаунтов пользователей
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    register: async function (req, res) {
        const {
            login,
            email,
            password
        } = req.body;

        if ((await AccountModel.findOne({$or: [{email}, {login}]}))) {
            return res.status(400).json({message: "Аккаунт с указанным логином или эл. почтой уже существует"}).end();
        }

        let foundRole;
        if (!(foundRole = await AccountRoleModel.findOne({name: "user"}))) {
            return res.status(404).json({message: "Роль пользователя не найдена"}).end();
        }

        const passwordHash = bcrypt.hashSync(password, 2);

        let createdAccount;
        if (!(createdAccount = await AccountModel.create({accountRoleId: foundRole._id, login, email, passwordHash}))) {
            return res.status(500).json({message: "Ошибка записи аккаунта в БД"}).end();
        }

        this.generateSession(createdAccount)
            .then((sessionData) => {
                return res.status(200).json(sessionData).end();
            })
            .catch((e) => {
                console.log(`Критическая ошибка генерации сессии: ${e}`);
            });
    },

    /**
     * Авторизация в аккаунт
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    login: async function (req, res) {
        const {
            login,
            password
        } = req.body;

        let foundAccount;
        if (!(foundAccount = await AccountModel.findOne({$or: [{email: login}, {login}]}))) {
            return res.status(400).json({message: "Аккаунт с указанным логином или эл. почтой не найден"}).end();
        }

        if (!bcrypt.compareSync(password, foundAccount.passwordHash)) {
            return res.status(403).json({message: "Введённый пароль неверен"}).end();
        }

        this.generateSession(foundAccount)
            .then((sessionData) => {
                return res.status(200).json(sessionData).end();
            })
            .catch((e) => {
                console.log(`Критическая ошибка генерации сессии: ${e}`);
            });
    },

    /**
     * Получение информации об аккаунте
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getInfo: async function (req, res) {
        return res.status(200).json({account: req.account}).end();
    }
}