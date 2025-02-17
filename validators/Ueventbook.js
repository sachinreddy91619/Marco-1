import fastify from 'fastify';

import joi from 'joi';

const app = fastify({

    logger: true
});


// export const authorizationValidation

//     authorization:joi.string().
//         pattern(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,'JWT Token').required(),


const authorizationValidation = joi.object({
    authorization: joi.string()
        .pattern(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/, 'JWT Token')
        .required()

})

const userNoOfSeatsValidation = joi.object({

    NoOfSeatsBooking: joi.number().min(1).required().strict()

})


export const UeventbookValidation = {

    authorizationValidation,
    userNoOfSeatsValidation

};