const { check } = require("express-validator");

/**
 * Модуль валидации
 * @author Nikita Sarychev
 */
module.exports = {
    /**
     * Система аккаунтов
     */
    account: {
        firstName: check("firstName")
            .isString()
            .isLength({min: 1, max: 45}),
        lastName: check("lastName")
            .isString()
            .isLength({min: 1, max: 45}),
        login: check("login")
            .exists()
            .isString()
            .trim()
            .isEmpty()
            .isLength({min: 4, max: 30}),
        loginNotRequired: check("login")
            .isString()
            .trim()
            .isEmpty()
            .isLength({min: 4, max: 30}),
        email: check("email")
            .exists()
            .isString()
            .trim()
            .isEmpty()
            .isEmail(),
        emailNotRequired: check("email")
            .isString()
            .trim()
            .isEmpty()
            .isEmail(),
        password: check("password")
            .exists()
            .isString()
            .trim()
            .isEmpty()
            .isLength({min: 6, max: 25}) 
    },

    /**
     * Система проектов
     */
    project: {
        title: check("title")
            .exists()
            .isString()
            .trim()
            .isLength({min: 1, max: 30}),
        description: check("description")
            .isString()
            .trim()
            .isLength({min: 0, max: 300}),
        text: check("description")
            .isString()
            .trim()
            .isLength({min: 0, max: 300}),
        tasks: check("tasks")
            .exists()
            .isJSON()
            .isLength({min: 1}),
        projectId: check("projectId")
            .exists()
            .isString(),
        taskId: check("taskId")
            .exists()
            .isString()
    }
}