var joi = require("joi");
module.exports= joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required()
});