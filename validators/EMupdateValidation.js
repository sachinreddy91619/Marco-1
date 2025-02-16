import fastify from 'fastify';

import joi from 'joi';

const app = fastify({
    logger: true
})




const authorizationValidation = joi.object({
    authorization: joi.string()
        .pattern(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/, 'JWT Token')
        .required()

})

const EMbodyEditValidation = joi.object({

    eventname: joi.string(),
    eventdate: joi.date(),
    eventlocation: joi.string(),
    amountrange: joi.number().min(1).strict(),
    eventtime: joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),

    //    totalseats: joi.forbidden(),
    //     availableseats: joi.forbidden(),
    //    bookedseats: joi.forbidden(),

    //eventtime:joi.string()

    //    totalseats:joi.number().min(10).strict(),
    //    availableseats:joi.number().strict(),
    //    bookedseats:joi.number().strict(),

    ///////////////////////







})


const usergivenparams = joi.object({



    id: joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId')  // Regex for 24-character hex string
        .required()

})

export const EMupdateValidation = {

    authorizationValidation,
    EMbodyEditValidation,

    usergivenparams

};











