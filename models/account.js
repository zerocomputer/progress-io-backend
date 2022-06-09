const {Schema, Types, model} = require("mongoose");
const { account, accountRole } = require("./index");

const AccountSchema = new Schema (
    {
        accountRoleId: {
            type: Types.ObjectId,
            ref: accountRole.name,
            required: true
        },

        firstName: {
            type: String,
        },

        lastName: {
            type: String
        },

        email: {
            type: String,
            required: true
        },

        login: {
            type: String,
            required: true
        },

        passwordHash: {
            type: String,
            required: true
        }
    }
);

module.exports = model(account.name, AccountSchema);