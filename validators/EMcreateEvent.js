import fastify from  'fastify';

import joi from 'joi';

const app=fastify({
    logger:true
})

const EMcreateEventValidation=joi.object({
    
    eventname:joi.string().required(),
    eventdate:joi.date().required(),
    eventlocation:joi.string().required(),
    amountrange:joi.number().min(1).required().strict(),
    eventtime:joi.string().required(),
    totalseats:joi.number().min(10).required().strict(),
    availableseats:joi.number().required().strict(),
    bookedseats:joi.number().required().strict(),


});

// EMcreateEventValidation.requiredFieldsValidation = (data) => {
//     const requiredFields = ['amountrange','eventname','eventdate','eventlocation','eventtime','totalseats','availableseats','bookedseats'];
//     for (let field of requiredFields) {
//         if (!data[field]) {
//             return {
//                 error: {
//                     message: 'Missing required fields in the body@@@'
//                 }
//             };
//         }
//     }
//     return { error: null };
//};



export default EMcreateEventValidation