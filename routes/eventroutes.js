
import fastify from 'fastify';
const app = fastify({
  logger: true
});
import { createEvent, getevent, getbyid, deleteevent, updateevent, loc, eventbook, getallbookings, booking, eventdelete } from '../controllers/eventopera.js';
import createEventSchema from '../schemas/createEventSchema.js';
import updateEventSchema from '../schemas/createEventSchema.js';
import getbyidEventSchema from '../schemas/getbyidEventSchema.js';
import posteventidSchema from '../schemas/posteventidSchema.js';
import auth from '../middleware/authmiddle.js';
import roleauth from '../middleware/roleauth.js';


import joi from 'joi';





import EMcreateEventValidation from '../validators/EMcreateEvent.js';
import EMgetEventsValidation from '../validators/EMgetEvents.js';
import EMgetbyidEventsValidation from '../validators/EMgetbyidEvent.js';

import { EMupdateValidation } from '../validators/EMupdateValidation.js';

import { EMzDeleteValidation } from '../validators/EMzdeleteEvent.js';


import { UlocValidation } from '../validators/Uloc.js'

import { UeventbookValidation } from '../validators/Ueventbook.js';

import UgetAll from '../validators/Ugetall.js';

import { UeventbookEditValidation } from '../validators/Uupdate.js';

import { UeventbookDeleteValidation } from '../validators/Udelete.js';



async function eventRoutes(fastify, options) {


  // ROUTES FOR THE EVENT-MANGER :

  // this route is to create the create the event 

  // fastify.post('/create', { schema: createEventSchema, preHandler: [auth, roleauth(['admin'])] }, createEvent);

  fastify.post('/create', {
    schema: createEventSchema, preHandler: async (request, reply) => {


      const {error:missingFieldsError}=EMcreateEventValidation.requiredFieldsValidation(request.body);
      console.log(request.body,"Iam doig good")

      if (missingFieldsError) {
        console.log(request.body,"Iam doig bad")

        console.log("iam sachin ")
          return reply.status(400).send({
              error: 'Bad Request',
              message: 'Missing required fields in the body$$$AS'
          });
      }
      
      const { error :validateError} = EMcreateEventValidation.validate(request.body);

      if (validateError) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Validation failed! body requirement not matching',
        });
      }



      //roleauth(['admin']
      await auth(request, reply)

      await roleauth(['admin'])(request, reply)

    }

  }, createEvent);


















  // This route is to get all  the  events of the particular event manager
  //fastify.get('/get', { preHandler: auth }, getevent);

  fastify.get('/get', {
    preHandler: async (request, reply) => {

      const { error } = EMgetEventsValidation.validate({
        authorization: request.headers['authorization'], // Accessing the header value
      });

      if (error) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The authorization header is required, to get the events of the particular event manager',
          //message:error.details[0].message,
        });
      }

      await auth(request, reply);
    }

  }, getevent);



  // This route is to get a particular event based on Id
  fastify.get('/get/:id', {
    schema: getbyidEventSchema, preHandler: async (request, reply) => {

      const { error } = EMgetbyidEventsValidation.validate({
        authorization: request.headers['authorization'], // Accessing the header value
      });

      if (error) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The authorization header is required, to get the events of the particular event manager based on the id',
        })
      }

      await auth(request, reply)
    }

  }, getbyid);



















  //fastify.put('/update/:id', { preHandler: [auth, roleauth(['admin'])] }, updateevent);

  //This route is to update the event 
  fastify.put('/update/:id', {
    preHandler: async (request, reply) => {




      const { error: authError } = EMupdateValidation.authorizationValidation.validate({
        authorization: request.headers['authorization']// Accessing the header value
      });




      console.log('Authorization header:', request.headers['authorization']);

      if (authError) {

        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The authorization header is required, to update the events of the particular event manager'
        })



      }

      const { error: paramsIdError } = EMupdateValidation.usergivenparams.validate(request.params)

      if (paramsIdError) {

        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The id is required, to update the events of the particular event manager'
        })

      }



      const { error: bodyError } = EMupdateValidation.EMbodyEditValidation.validate(request.body);

      if (bodyError) {

        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The body is not matching has per  requirements, to update the events of the particular event manager'
        })

      }


      const { error: BodyUneditError } = EMupdateValidation.EMbodyUNEditValidation.validate(request.body);

      if (BodyUneditError) {

        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The body is not matching has per  requirements, "totalseats", "availableseats", and "bookedseats" cannot be updated'
        })

      }




      await auth(request, reply),
        await roleauth(['admin'])(request, reply)
    }

  }, updateevent);


  // This route is to delete the event

  fastify.delete('/delete/:id', {
    preHandler:

      async (request, reply) => {


        const { error: authError } = EMzDeleteValidation.authorizationValidation.validate({
          authorization: request.headers['authorization']// Accessing the header value
        });
        console.log('Authorization header:', request.headers['authorization']);

        if (authError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The authorization header is required, to delete the events of the particular event manager'
          })



        }

        const { error: paramsIdError } = EMzDeleteValidation.usergivenparams.validate(request.params)

        if (paramsIdError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The id is required, to delete the events of the particular event manager'
          })

        }





        await auth(request, reply),
          await roleauth(['admin'])(request, reply)
      }



  }, deleteevent);


  // ROUTES FOR THE USER 

  // this is the provide the location
  fastify.post('/location', {
    preHandler:


      async (request, reply) => {
        await auth(request, reply)
        console.log("user authenticated for giveing the location and GOing to NEXT ")

        const { error: authError } = UlocValidation.authorizationValidation.validate({
          authorization: request.headers['authorization'], // Accessing the header value
        });

        if (authError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The authorization header is required, to provide the location of the user'
          })

        }

        const { error: bodyError } = UlocValidation.userLocationValidation.validate(request.body);

        if (bodyError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The body is not matching has per  requirements, to provide the location of the user'
          })

        }





      }
  }, loc);





  // this route is book the event
  fastify.post('/eventit/:id', {
    preHandler:
      async (request, reply) => {

        const { error: authError } = UeventbookValidation.authorizationValidation.validate({

          authorization: request.headers['authorization'], // Accessing the header value

        })

        if (authError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The authorization header is required, while booking the no of seats for the event'
          })
        }

        const { error: NoSeatsError } = UeventbookValidation.userNoOfSeatsValidation.validate(request.body)

        if (NoSeatsError) {

          return reply.status(400).send({

            error: 'BAD Request',
            message: 'The  body is missing the required format'

          })
        }

        await auth(request, reply)
      }



  }, eventbook);




















  // this is is to get all  the bookings of the user 
  fastify.get('/all', {
    preHandler: async (request, reply) => {

      const { error } = UgetAll.validate({

        authorization: request.headers['authorization'], // Accessing the header value

      })

      if (error) {


        return reply.status(400).send({
          error: 'Bad Request',
          message: 'The authorization header is required, to all of the bookings '
        })




      }



      await auth(request, reply);
    }




  }, getallbookings);




  // this route is to update the update a booking 
  fastify.put('/bookings/:id', {
    preHandler:


      async (request, reply) => {



        const { error: authError } = UeventbookEditValidation.authorizationValidation.validate({

          authorization: request.headers['authorization'], // Accessing the header value

        })

        if (authError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The authorization header is required, while booking the no of seats for the event'
          })
        }


        const { error: UserUpdationError } = UeventbookEditValidation.userNoOfSeatsEditValidation.validate(request.body)

        if (UserUpdationError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The Body is not Matching has per the requirements, give correct body for updation'
          })
        }


        const { error: UserparamsgivenError } = UeventbookEditValidation.usergivenparams.validate(request.params)


        if (UserparamsgivenError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The params is not Matching has per the requirements, give correct params id for updation'
          })

        }








        await auth(request, reply);
      }


  }, booking);


  // this route is to delete the event 


  fastify.delete('/cc/:id', {
    preHandler:

      async (request, reply) => {

        const { error: authError } = UeventbookDeleteValidation.authorizationValidation.validate({

          authorization: request.headers['authorization']// Accessing the header value
        })

        if (authError) {

          return reply.status(400).send({
            error: 'Bad Request',
            message: 'The authorization header is required, to delete the event'
          })

        }

        const { error: UserparamsgivenError } = UeventbookDeleteValidation.usergivenparams.validate(request.params);

        if (UserparamsgivenError) {

          return reply.status(400).send({

            error: 'Bad Request',
            message: 'The params is not Matching has per the requirements, give correct params id for deletion'
          })
        }

        await auth(request, reply);
      }



  }, eventdelete);
}

export default eventRoutes;

