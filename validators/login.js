import fastify from 'fastify';

import joi from 'joi';

const app = fastify({
    logger: true
});


const userLoginvalidation=joi.object({


    username:joi.string().alphanum().min(3).max(15).required(),
    password:joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z\\d\\W_]{8,30}$')).required(),
});



userLoginvalidation.requiredFieldsValidation = (data) => {
    const requiredFields = ['username', 'password'];
    for (let field of requiredFields) {
        if (!data[field]) {
            return {
                error: {
                    message: 'Missing required fields in the body'
                }
            };
        }
    }
    return { error: null };
};


export default userLoginvalidation