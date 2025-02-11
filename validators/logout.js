import fastify from 'fastify';

import joi from 'joi';

const app=fastify({
    logger:true
});

const userLogoutValidation=joi.object({

    authorization:joi.string().
    pattern(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,'JWT Token').required()
    

  
       
    
})

export default userLogoutValidation