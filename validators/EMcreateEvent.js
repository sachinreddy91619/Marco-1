import fastify from  'fastify';

import joi from 'joi';

const app=fastify({
    logger:true
})

const EMcreateEventValidation=joi.object({
    
    eventname:joi.string().required(),
    //eventdate: Joi.date().greater('now').required(),  // Ensures the date is in the future
    eventdate:joi.date().required(),
    eventlocation:joi.string().required(),
    amountrange:joi.number().min(1).required().strict(),
    eventtime: joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
    totalseats:joi.number().min(10).required().strict(),
    availableseats:joi.number().min(0).required().strict(),
    bookedseats:joi.number().min(0).required().strict(),


});

EMcreateEventValidation.requiredFieldsValidation = (data) => {
    const requiredFields = ['amountrange','eventname','eventdate','eventlocation','eventtime','totalseats','availableseats','bookedseats'];
    for (let field of requiredFields) {
     //   if (!data[field]) {
        if (!(field in data)) {
            return {
                error: {
                    message: 'Missing required fields in the body@@@'
                }
            };
        }
    }
    return { error: null };
};



export default EMcreateEventValidation





// In JavaScript, 0 is falsy, so your check treats amountrange: 0 as a missing field, even though it exists.
// Other falsy values like "" (empty string) or null would also cause this issue.

// Modify the function to explicitly check if a key is undefined instead of just falsy:


// Uses if (!(field in data)) instead of if (!data[field])
//     This ensures that 0 and other falsy values like "" or false are still considered provided, but undefined is treated as missing.
    