  
  
  
  import fastify from 'fastify';
  import joi from 'joi';
  const app=fastify({
      logger:true
  });
  const usergivenparams = joi.object({
       
           id: joi.string()
               .pattern(/^[0-9a-fA-F]{24}$/, 'MongoDB ObjectId')  // Regex for 24-character hex string
               .required()
       
       })
export default usergivenparams;




