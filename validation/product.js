var joi = require("joi");
module.exports= joi.object().keys({
    asin: joi.string().required(),
    productName: joi.string().required(),
    productDescription: joi.string().required(),
    group: joi.string().required()
});
