/**
 * Утилита генерации данных
 * @author Nikita Sarychev
 */
module.exports = {
    /**
     * Генерация случайного пароля
     * (стандартно 6 символов)
     * 
     * @param {number} length 
     * @returns 
     */
    password: (length = 6) => {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}{?>&^*%$#!@";
        for (let i = 0; i < length; i++)
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        
        return result;
    },

    /**
     * Генерация случайного логина
     * (на основе почты)
     * 
     * @param {string} email 
     * @returns 
     */
    login: async (email) => {
        const AccountModel = require("../models/account");

        const mainPartEmail = email.split("@")[0];
        let unique = false;
        let index = 0;
        let result = mainPartEmail;
        while (unique === false) {
            if (index > 0) {
                result += index.toString();
            }

            if (!(await AccountModel.findOne({login: result}))) {
                unique = true;
            }
            
            index++;
        }
        return result;
    }
}