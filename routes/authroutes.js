

import fastify from 'fastify';
import joi from 'joi';

const app = fastify({
    logger: true
});

import { register, login } from '../controllers/authopera.js';
import auth from '../middleware/authmiddle.js';
import registerUserSchema from '../schemas/registerUserSchema.js';
import loginUserSchema from '../schemas/loginUserSchema.js';

import { logout } from '../controllers/authopera.js';

import userRegisterValidation from '../validators/registration.js';

import userLoginvalidation from '../validators/login.js';

import userLogoutValidation from '../validators/logout.js';

async function authroutes(fastify, options) {




    fastify.post('/register', {
        schema: registerUserSchema, preHandler:
            async (request, reply) => {


                const { error: missingFieldsError } = userRegisterValidation.requiredFieldsValidation(request.body);
                if (missingFieldsError) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Missing required fields in the body'
                    });
                }


                const { error: validationError } = userRegisterValidation.validate(request.body);
                if (validationError) {
                    return reply.status(400).send({
                        error: 'Bad Request',
                        message: 'Validation failed body requirement not matching'
                    });
                }
            }
    }, register); // register route

    fastify.post('/login', {
         preHandler: async (request, reply) => {


            // const { error: missingFieldsError } = userRegisterValidation.requiredFieldsValidation(request.body);
            // if (missingFieldsError) {
            //     return reply.status(400).send({
            //         error: 'Bad Request',
            //         message: 'Missing required fields in the body'
            //     });
            // }


            const { error:validationError} = userLoginvalidation.validate(request.body);
            if (validationError) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Validation failed body requirement not matching',
                })
            }


        }
    }, login); // login route



    // fastify.post('/logout', { preHandler: auth }, async(request,reply)=>{
    //     const {error}=userLogoutValidation.validate(request.headers);
    //     if(error){
    //         return reply.status(400).send({

    //             error:'Bad Request',
    //             message:'The authorization header is required',
    //             })
    //     }
    // },logout); // logout route

    fastify.post('/logout', {
        preHandler: async (request, reply) => {
            // const {error}=userLogoutValidation.validate(request.headers);

            const { error } = userLogoutValidation.validate({
                authorization: request.headers['authorization'], // Accessing the header value
            });




            if (error) {
                return reply.status(400).send({

                    error: 'Bad Request',
                    message: 'Validation failed in the header requirement not matching',
                });
            }

            await auth(request, reply);
        }
    }, logout); // logout route



}

export default authroutes;
