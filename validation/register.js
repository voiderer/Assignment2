var joi = require("joi");
module.exports= {
    body:{
        fname:joi.string().required(),
        lname:joi.string().required(),
        address:joi.string().required(),
        city:joi.string().required(),
        state:joi.string().required(),
        zip:joi.string().required(),
        email:joi.string().email().required()
    }
};