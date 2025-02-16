import app from '../../app.js'; // Your Fastify app

import Users from '../../models/Users.js'; // Users model
import Logs from '../../models/Logs.js';
import Events from '../../models/Events.js';
import EventLoc from '../../models/EventLoc.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';



jest.mock('jsonwebtoken');
jest.mock('../../models/Users.js'); // Mock Users model
jest.mock('../../models/Logs.js');
jest.mock('../../models/Events.js');
jest.mock('../../models/EventLoc.js');
jest.mock('bcrypt');



dotenv.config();

process.env.SEC = 'SACHIN'

beforeAll(async () => {
    await app.listen(3044); // Ensure the Fastify app is running on port 3044
});

afterAll(async () => {
    await app.close(); // Close the app after tests

});

afterEach(() => {
    jest.clearAllMocks();
})



// import app from '../app.js';
// import jwt from 'jsonwebtoken';
// import Logs from '../models/Logs.js';

// jest.mock('jsonwebtoken');
// jest.mock('../models/Logs.js');




describe("Event Creation API - Header Validation checking for the header is in correct format or not", () => {
    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });

    test("should return 400 if header validation is not in correct format:", async () => {
        const testCases = [
            
                {eventname: "Event A", eventdate: "2025-06-05", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: 50, availableseats: 30, bookedseats: 20 }
               
            ];


            const invalidHeadersTestCases = [
                {}, // No Authorization header
                { Authorization: "" }, // Empty Authorization
                { Authorization: "Bearer" }, // Missing token
                { Authorization: "Bearer " }, // Missing token after space
                { Authorization: "Bearer.invalid.token" }, // Invalid format
                { Authorization: "RandomToken 12345" }, // Wrong prefix
                { Authorization: "Bearer12345" }, // No space after Bearer
                { Authorization: "Bearer mockedToken" }, // Only one part of JWT
            ];
            
        for (let i = 0; i < invalidHeadersTestCases.length; i++) {
            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: testCases[i],
                headers: invalidHeadersTestCases[i]
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Validation failed in the header requirement not matching 123 123');
        }
    });
});










describe("Event Creation API - Token Validation and Missing Fields", () => {
    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });

    test("should return 400 if any required field is missing", async () => {
        const testCases = [
            
                { eventdate: "2025-06-05", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: 50, availableseats: 30, bookedseats: 20 }, // Missing eventname
                { eventname: "Event A", eventlocation: "Location A", amountrange: 100, eventtime: "10:12:00", totalseats: 100, availableseats: 80, bookedseats: 60 }, // Missing eventdate
                { eventname: "Event B", eventdate: "2025-04-20", amountrange: 200, eventtime: "15:11:00", totalseats: 150, availableseats: 100, bookedseats: 50 }, // Missing eventlocation
                { eventname: "Event C", eventdate: "2025-05-10", eventlocation: "Location C", eventtime: "18:09:00", totalseats: 120, availableseats: 100, bookedseats: 20 }, // Missing amountrange
                { eventname: "Event D", eventdate: "2025-07-15", eventlocation: "Location E", amountrange: 80, totalseats: 90, availableseats: 60, bookedseats: 30 }, // Missing eventtime
                { eventname: "Event E", eventdate: "2025-08-20", eventlocation: "Location F", amountrange: 70, eventtime: "20:00", availableseats: 50, bookedseats: 20 }, // Missing totalseats
                { eventname: "Event F", eventdate: "2025-09-25", eventlocation: "Location G", amountrange: 60, eventtime: "21:00", totalseats: 80, bookedseats: 40 }, // Missing availableseats
                { eventname: "Event G", eventdate: "2025-10-30", eventlocation: "Location H", amountrange: 90, eventtime: "22:00", totalseats: 110, availableseats: 70 }, // Missing bookedseats
                { eventname: "Event H", eventdate: "2025-11-15", eventlocation: "Location I", eventtime: "23:00", totalseats: 130, availableseats: 90, bookedseats: 40 }, // Missing amountrange
                { eventname: "Event I", eventdate: "2025-12-10", eventlocation: "Location J", amountrange: 85, eventtime: "10:30", bookedseats: 25 }, // Missing totalseats, availableseats
                { eventname: "Event J", eventdate: "2026-01-05", eventlocation: "Location K", amountrange: 95, eventtime: "11:30", availableseats: 50 }, // Missing totalseats, bookedseats
                { eventname: "Event K", eventdate: "2026-02-20", eventlocation: "Location L", amountrange: 55, eventtime: "12:30", totalseats: 75 }, // Missing availableseats, bookedseats
                { eventname: "Event L", eventdate: "2026-03-15", eventlocation: "Location M", amountrange: 65, eventtime: "13:30" }, // Missing totalseats, availableseats, bookedseats
                { eventname: "Event M", eventdate: "2026-04-10", eventlocation: "Location N", amountrange: 75 }, // Missing eventtime, totalseats, availableseats, bookedseats
                { eventname: "Event N", eventdate: "2026-05-05", eventlocation: "Location O" }, // Missing amountrange, eventtime, totalseats, availableseats, bookedseats
                { eventname: "Event O", eventdate: "2026-06-01" }, // Missing eventlocation, amountrange, eventtime, totalseats, availableseats, bookedseats
                { eventname: "Event P" }, // Missing eventdate, eventlocation, amountrange, eventtime, totalseats, availableseats, bookedseats
                {} // Missing all fields
            ];
            
        for (let i = 0; i < testCases.length; i++) {
            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: testCases[i],
                headers: {
                    'Authorization': `Bearer ${mockToken}`
                }
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Missing required fields in the body when creating an event');
        }
    });
});


describe("testing the validation of event fields", () => {


    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });
    test("should respond with a status code of 400 if any field is invalid", async () => {
        // Test data with invalid field formats
        const bodydata = [
            { eventname: "Event A", eventdate: "invalid-date", eventlocation: "Location A", amountrange: 100, eventtime: "10:00", totalseats: 100, availableseats: 80, bookedseats: -5 }, // Invalid date format, negative bookedseats
            { eventname: "Event B", eventdate: "2025-03-15", eventlocation: "Location B", amountrange: "invalid-range", eventtime: "15:00", totalseats: 100, availableseats: 80, bookedseats: 20 }, // Invalid amountrange (should be a number)
            { eventname: "Event C", eventdate: "2025-06-10", eventlocation: "Location C", amountrange: 150, eventtime: "invalid-time", totalseats: 150, availableseats: 130, bookedseats: 20 }, // Invalid eventtime format
            { eventname: "Event D", eventdate: "2025-07-25", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: -50, availableseats: 40, bookedseats: 10 }, // Invalid totalseats (should be >= 10)
            
            
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 }, // Invalid availableseats (should not be negative)
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 0, eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 }, // Invalid amountrange  should be min 1
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 5, availableseats: -10, bookedseats: 10 },
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: "50", eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 },
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: "50", availableseats: -10, bookedseats: 10 },
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: "10", bookedseats: 10 } ,
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: 10, bookedseats: "10" }     





        ];

        for (let i = 0; i < bodydata.length; i++) {
            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: bodydata[i],

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Validation failed body requirement not matching when creating an event');
        }
    });


  
});



describe("testing wheather the date is in the future or not", () => {


    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });
    test("should respond with a status code of 400 if date is not in the future ", async () => {
        // Test data with invalid field formats
    //    const pastDate=new Date();
    //    pastDate.setDate(pastDate.getDate()-1)
          
       const bodydata= { eventname: "Event B", 
        eventdate: "2012-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24", totalseats: 100, availableseats: 80, bookedseats: 20 }
            

        const eventDateObj = new Date(bodydata.eventdate);
        const currentDate = new Date();

        if (eventDateObj < currentDate) {
            console.log("you provided the date has past date so check it , thats why you are gettin the 400 error ")

            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Event date must be in the future.');
        }
        else{
            console.log(" the event date is in the future ! so it is ok")
        }
    });


    

});





describe("testing wheather the Event is succefully created or not ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

         Logs.findOne.mockResolvedValue(mockUserLog);

        Events.prototype.save = jest.fn().mockResolvedValue({
            _id: "log123",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location B",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        });
    });
    test("should respond with a status code of 200 if the event is successfully created ", async () => {
     
          
       const bodydata= { eventname: "Event F", 
        eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:30", totalseats: 100, availableseats: 100, bookedseats: 0 }
            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

         
            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toEqual({
                _id: "log123",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location B",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0

            });
          
       
    });



});



describe("testing for the CATCH block errors while creating the Event by Emanager : ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

       
    });
    test("should respond with a status code of 400 if i got cathch block error while the event is created ", async () => {
     
          
       const bodydata= { eventname: "Event F", 
        eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:30", totalseats: 100, availableseats: 100, bookedseats: 0 }

        Events.prototype.save = jest.fn().mockRejectedValue(new Error("Database save failed"));
            const response = await app.inject({
                method: 'POST',
                url: '/event/create',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

         
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toEqual({error: "Database save failed,Error creating the Event" });
           
           

    });
   

});

// ======================================================================================================================================================================================================
///TEST CASES FOR THE , GET METHOD : ROLE:ADMIN

// test case for the successfull working of the get method
describe("testing wheather the Get method is working for the  admin  succefully or not ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        // Events.prototype.save = jest.fn().mockResolvedValue([{
            Events.find.mockResolvedValue([{
            _id: "log123",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location B",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        },{
        _id: "log1234",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "Location B",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0
    }
    ]);
    });
    test("should respond with a status code of 200 if the working for the  admin  succefully or not ", async () => {
     
          
    //    const bodydata= { eventname: "Event F", 
    //     eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:30", totalseats: 100, availableseats: 100, bookedseats: 0 }

            const response = await app.inject({
                method: 'GET',
                url: '/event/get',
               // payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

         
            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody).toEqual(
                
                [{
                    _id: "log123",
                    amountrange: 10,
                    eventname: "Event F",
                    eventdate: "2027-02-10T00:00:00.000Z",
                    eventlocation: "Location B",
                    eventtime: "15:30:30",
                    totalseats: 100,
                    availableseats: 100,
                    bookedseats: 0,
                    userId: "mockUserId",
                    __v: 0
                },{
                _id: "log1234",
                amountrange: 10,
                eventname: "Event F",
                eventdate: "2027-02-10T00:00:00.000Z",
                eventlocation: "Location B",
                eventtime: "15:30:30",
                totalseats: 100,
                availableseats: 100,
                bookedseats: 0,
                userId: "mockUserId",
                __v: 0
            }
            ]
        
        );
             
    });
    
});



// test case for the catch block errors for both the admin and user  when Events model fails  
describe("testing the catch block errors for the Get method ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        Events.find = jest.fn(); 
       
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        // Events.prototype.save = jest.fn().mockResolvedValue([{
           
    });
    
        test("should respond with a status code of 400 if the working for the  admin  succefully or not ", async () => {
     
        //Event.find.mockRejectedValue(new Error("Database error"));
        Events.find.mockRejectedValueOnce(new Error("Database error")); 
    
            const response = await app.inject({
                method: 'GET',
                url: '/event/get',
                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toEqual({error: "Database failed while getting the events data,Error triggering the catch block" });   
       
    });
    

});




// ======================================================================================================================================================================================================
///TEST CASES FOR THE , GETBYID METHOD :





describe("Event Creation API - Header Validation checking for the header is in correct format or not for the GET BY ID route", () => {
    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });

    test("should return 400 if header validation is not in correct format:", async () => {
        
            const invalidHeadersTestCases = [
                {}, // No Authorization header
                { Authorization: "" }, // Empty Authorization
                { Authorization: "Bearer" }, // Missing token
                { Authorization: "Bearer " }, // Missing token after space
                { Authorization: "Bearer.invalid.token" }, // Invalid format
                { Authorization: "RandomToken 12345" }, // Wrong prefix
                { Authorization: "Bearer12345" }, // No space after Bearer
                { Authorization: "Bearer mockedToken" }, // Only one part of JWT
            ];
            
        for (let i = 0; i < invalidHeadersTestCases.length; i++) {
            const response = await app.inject({
                method: 'GET',
                url: '/event/get/67ab179b5ae8f11485a9bd35',
              
                headers: invalidHeadersTestCases[i]
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('The authorization header is required, to get the events of the particular event manager based on the id');
        }
    });
});



describe("Event Creation API - Params  Validation checking for the params in is in correct format or not for the GET BY ID route", () => {
    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
     });

    test("should return 400 if header validation is not in correct format:", async () => {
        
        const invalidParamsTestCases = [
            "", // Empty ID
            "123", // Too short
            "invalid-id", // Non-hex characters
            "67ab179b5ae8f11485a9bd3", // 23 characters (should be 24)
            "67ab179b5ae8f11485a9bd3555", // 25 characters (should be 24)
            "67ab179b5ae8f11485a9bd3g", // Contains a non-hex character (g)
        ];
            
        for (let i = 0; i < invalidParamsTestCases.length; i++) {
            const response = await app.inject({
                method: 'GET',
                url: `/event/get/${invalidParamsTestCases[i]}`,
              
                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            expect(response.statusCode).toBe(500);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
       
            expect(responseBody.error).toMatch('params.id should match pattern \"^[0-9a-fA-F]{24}$\"');
        }
    });
});


//=====================================================================================================================================================================================================

// / test case for the successfull working of the getbyid method

describe("Event Retrieval API - Get Event by ID", () => {
    let mockToken;
    let mockUserId;
    let validEventId;
    let anotherUserId;
    let eventData;
   
    let mockUserLog;


    beforeEach(() => {
       
       

        validEventId = "67ab179b5ae8f11485a9bd35"; // Valid Event ID

        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        // Mock Event data do not needed but keep it 
        Events.find.mockResolvedValue([{
            _id: "67ab179b5ae8f11485a9bd35",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location F",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        },{
        _id: "67ab17b75ae8f11485a9bd38",
        amountrange: 10,
        eventname: "Event B",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "Location B",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0
    }
    ]);
    });



    eventData = {
        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "Location F",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0
    };

    test(" Should return event details for a valid event ID", async () => {
        Events.findById.mockResolvedValue(eventData); // Mock DB call

        const response = await app.inject({
            method: 'GET',
            url: `/event/get/${validEventId}`,


            headers: {
                'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
            }

        });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toContain('application/json');
        expect(JSON.parse(response.body)).toEqual(
            eventData);
    });

})


// / test case for the unsuccessfull working of the getbyid method here event not found error:





describe("Event Not Found Error test case - Get Event by ID", () => {
    let mockToken;
    let mockUserId;
    let validbutNotFoundEventId;

  
 
   
    let mockUserLog;


    beforeEach(() => {
       
       

        validbutNotFoundEventId = "67ab179b5ae8f11485a9bd39"; // Valid Event ID but not in the data-base

        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        // Mock Event data do not needed but keep it 
        Events.find.mockResolvedValue([{
            _id: "67ab179b5ae8f11485a9bd35",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location F",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        },{
        _id: "67ab17b75ae8f11485a9bd38",
        amountrange: 10,
        eventname: "Event B",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "Location B",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0
    }
    ]);
    });

    test(" Should return event details for a valid event ID", async () => {
        Events.findById.mockResolvedValue(null); // Mock DB call

        const response = await app.inject({
            method: 'GET',
            url: `/event/get/${validbutNotFoundEventId}`,


            headers: {
                'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
            }

        });

        expect(response.statusCode).toBe(404);
        expect(response.headers['content-type']).toContain('application/json');
        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toMatch("event not found")
       
    });

})


// / test case for the catch block for  working of the getbyid method , cathc block error:





describe("Catch block  test case Error  - Get Event by ID", () => {
    let mockToken;
 
    let validEventId;

    let  mockUserLog;

  


    beforeEach(() => {
       
       

        validEventId = "67ab179b5ae8f11485a9bd35"; // Valid Event ID but not in the data-base

        mockToken = 'mockedToken.mockedToken.mockedToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
        
        // Mock Event data do not needed but keep it 
        Events.find.mockResolvedValue([{
            _id: "67ab179b5ae8f11485a9bd35",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "Location F",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        },{
        _id: "67ab17b75ae8f11485a9bd38",
        amountrange: 10,
        eventname: "Event B",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "Location B",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0
    }
    ]);
    });

    test(" Should return event details for a valid event ID", async () => {
        Events.findById.mockRejectedValue(new Error ("Database Error qqq")); // Mock DB call

        const response = await app.inject({
            method: 'GET',
            url: `/event/get/${validEventId}`,


            headers: {
                'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
            }

        });

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toContain('application/json');
        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toMatch("Database Error qqq")
       
    });

})

// =============================================================================================================
// ===============================================================================================================
// =================================================================================================================
// ====================================================================================================================


// TEST CASES FOR THE UPDATE OF THE EVENTS :




describe("Event Updation Creation API - Header Validation checking for the header is in correct format or not for the Update the event  BY ID route", () => {
    let mockToken;
   let  mockUserLog

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        
        
       
    });

    test("should return 400 if header validation is not in correct format:", async () => {
        
            const invalidHeadersTestCases = [
                {}, // No Authorization header
                { Authorization: "" }, // Empty Authorization
                { Authorization: "Bearer" }, // Missing token
                { Authorization: "Bearer " }, // Missing token after space
                { Authorization: "Bearer.invalid.token" }, // Invalid format
                { Authorization: "RandomToken 12345" }, // Wrong prefix
                { Authorization: "Bearer12345" }, // No space after Bearer
                { Authorization: "Bearer mockedToken" }, // Only one part of JWT
            ];
            
        for (let i = 0; i < invalidHeadersTestCases.length; i++) {
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
              
                headers: invalidHeadersTestCases[i]
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('The authorization header is required, to update the events of the particular event manager');
        }
    });
});



describe("Event Updation API - Params  Validation checking for the params in is in correct format or not for the UpdateT BY ID route", () => {
    let mockToken;

    let mockUserLog;
   
    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';

        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
        
     });

    test("should return 400 if params validation is not in correct format:", async () => {
        
        const invalidParamsTestCases = [
            "", // Empty ID
            "123", // Too short
            "invalid-id", // Non-hex characters
            "67ab179b5ae8f11485a9bd3", // 23 characters (should be 24)
            "67ab179b5ae8f11485a9bd3555", // 25 characters (should be 24)
            "67ab179b5ae8f11485a9bd3g", // Contains a non-hex character (g)
        ];
            
        for (let i = 0; i < invalidParamsTestCases.length; i++) {
            const response = await app.inject({
                method: 'PUT',
                url: `/event/update/${invalidParamsTestCases[i]}`,
              
                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
       


             expect(responseBody.error).toBe('Bad Request');
          //  expect(responseBody.message).toMatch('The authorizati
            expect(responseBody.message).toMatch('The id is required, to update the events of the particular event manager');
        }
    });
});

// body validation for updating :



describe("testing the validation of event fields", () => {


    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';


        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        Events.findById.mockResolvedValue({

            _id: "67ab179b5ae8f11485a9bd35",
            amountrange: 10,
            eventname: "Event F",
            eventdate: "2027-02-10T00:00:00.000Z",
            eventlocation: "location f",
            eventtime: "15:30:30",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0
        })
       
        
       
    });
    test("should respond with a status code of 400 if any field is invalid", async () => {
        // Test data with invalid field formats
        const bodydata = [
            { eventname:123},
        {eventdate: "78:90:90"},
            {eventlocation: 33545},
            {amountrange: 0},
            { eventname: "Event A", eventdate: "invalid-date", eventlocation: "Location A", amountrange: 100, eventtime: "10:00:10"}, // Invalid date format
            { eventname: "Event B", eventlocation: "Location B", amountrange: "invalid-range", eventtime: "15:00:10" }, // Invalid amountrange (should be a number)
            { eventname: "Event C", eventlocation: "Location C", amountrange: 150, eventtime: "invalid-time" }, // Invalid eventtime format
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50}, // Invalid availableseats (should not be negative)
            { eventname: "Event E", eventlocation: "Location E", amountrange: 0, eventtime: "18:00",  availableseats: -10, bookedseats: 10 }, // Invalid amountrange  should be min 1
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00",  bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: "50", eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00:00", totalseats: 50, availableseats: 10, bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00:00", totalseats: 50, availableseats: 10, bookedseats: 10 } ,
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00:10", totalseats: 50, availableseats: 10, bookedseats: 10 }     
        ];

        for (let i = 0; i < bodydata.length; i++) {
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata[i],

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('The body is not matching has per  requirements, to update the events of the particular event manager');
        }
    });


  
});



describe("testing wheather the date is in the future or not  while updating the events date", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });
    test("should respond with a status code of 400 if date is not in the future ", async () => {
        
    
          
       const bodydata= { eventname: "Event B", 
        eventdate: "2012-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"}
            

        const eventDateObj = new Date(bodydata.eventdate);
        const currentDate = new Date();

        if (eventDateObj < currentDate) {
            console.log("you provided the date has past date so check it , thats why you are gettin the 400 error ")

            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Event date must be in the future.');
        }
        else{
            console.log(" the event date is in the future ! so it is ok")
        }
    });




})



//// ===================================================== >



describe("testing wheather the given id event is present in the events model or not while updating the events date", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });
    test("should respond with a status code of 400 if the event id is not in the events model.", async () => {
        Events.findById = jest.fn().mockResolvedValue(null);

    
          
       const bodydata= { eventname: "Event B", 
        eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"}
            

        
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody.error).toMatch('event not found');
        
    });

})





//// ===================================================== >



describe("testing wheather the given id event is present in the events model or not while updating the events date", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        Events.findById = jest.fn().mockResolvedValue({
            _id: '67ab179b5ae8f11485a9bd35',
            userId: 'mockUserId',  // Ensure this matches request.user.id
        });



    });
    test("should respond with a status code of 400 if the event id is not in the events model.", async () => {
        Events.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

    
          
       const bodydata= { eventname: "Event B", 
        eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"}
            

        
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody.error).toMatch('Event updating failed !This is what i found');
        
    });

})




// for successfully event updation status code :200





describe("testing wheather  the give  fields are updating correctly or not", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        
  Events.findById.mockResolvedValue({

    _id: "67ab179b5ae8f11485a9bd35",
    amountrange: 10,
    eventname: "Event F",
    eventdate: "2027-02-10T00:00:00.000Z",
    eventlocation: "location f",
    eventtime: "15:30:30",
    totalseats: 100,
    availableseats: 100,
    bookedseats: 0,
    userId: "mockUserId",
    __v: 0
})





    });
    test("should respond with a status code of 200 if the event id is found and successfully updated.", async () => {
        Events.findByIdAndUpdate = jest.fn().mockResolvedValue({
            _id: "67ab179b5ae8f11485a9bd35",
            amountrange: 100,
            eventname: "AMC-KITE-FESTIVAL",
            eventdate: "2025-02-10T00:00:00.000Z",
            eventlocation: "AHMEDABAD",
            eventtime: "15:30:24",
            totalseats: 100,
            availableseats: 100,
            bookedseats: 0,
            userId: "mockUserId",
            __v: 0

        });

    
          
       const bodydata= { eventname: "AMC-KITE-FESTIVAL", 
        eventdate: "2025-08-10", eventlocation: "AHMEDABAD", amountrange: 100, eventtime: "15:30:24"}
            

        
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody).toEqual({
                "_id": "67ab179b5ae8f11485a9bd35",
                "amountrange": 100,
                "eventname": "AMC-KITE-FESTIVAL",
                "eventdate": "2025-02-10T00:00:00.000Z",
                "eventlocation": "AHMEDABAD",
                "eventtime": "15:30:24",
                "totalseats": 100,
                "availableseats": 100,
                "bookedseats": 0,
                "userId": "mockUserId",
                "__v": 0
            })
        
    });

})


// catch block Error  test code for the while updation of the event here, 



describe("testing catch block Error  the give  fields are updating correctly or not", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        
  Events.findById.mockResolvedValue({

    _id: "67ab179b5ae8f11485a9bd35",
    amountrange: 10,
    eventname: "Event F",
    eventdate: "2027-02-10T00:00:00.000Z",
    eventlocation: "location f",
    eventtime: "15:30:30",
    totalseats: 100,
    availableseats: 100,
    bookedseats: 0,
    userId: "mockUserId",
    __v: 0
})





    });
    test("should respond with a status code of 400 if the catch block error raised.", async () => {
        // Events.findByIdAndUpdate = jest.fn().mockResolvedValue(new Error("Database Connection Error"));

        Events.findByIdAndUpdate.mockRejectedValueOnce(new Error("Database Connection Error"));

    
          
       const bodydata= { eventname: "AMC-KITE-FESTIVAL", 
        eventdate: "2025-08-10", eventlocation: "AHMEDABAD", eventtime: "15:30:24"}
            

        
            const response = await app.inject({
                method: 'PUT',
                url: '/event/update/67ab179b5ae8f11485a9bd35',
                payload: bodydata,

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody.error).toEqual("Database Connection Error"
               
            )
        
    });

})



/// DELETE TEST CASE EVENT MANAGER :



describe("Event deletion  Creation API - Header Validation checking for the header is in correct format or not for the delete the event  BY ID route", () => {
    let mockToken;
   let  mockUserLog

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        
        
       
    });

    test("should return 400 if header validation is not in correct format while deletion of the event :", async () => {
        
            const invalidHeadersTestCases = [
                {}, // No Authorization header
                { Authorization: "" }, // Empty Authorization
                { Authorization: "Bearer" }, // Missing token
                { Authorization: "Bearer " }, // Missing token after space
                { Authorization: "Bearer.invalid.token" }, // Invalid format
                { Authorization: "RandomToken 12345" }, // Wrong prefix
                { Authorization: "Bearer12345" }, // No space after Bearer
                { Authorization: "Bearer mockedToken" }, // Only one part of JWT
            ];
            
        for (let i = 0; i < invalidHeadersTestCases.length; i++) {
            const response = await app.inject({
                method: 'DELETE',
                url: '/event/delete/67ab179b5ae8f11485a9bd35',
              
                headers: invalidHeadersTestCases[i]
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('The authorization header is required, to delete the events of the particular event manager');
        }
    });
});





describe("Event deletion API - Params  Validation checking for the params in is in correct format or not for the UpdateT BY ID route", () => {
    let mockToken;

    let mockUserLog;
   
    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';

        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
        
     });

    test("should return 400 if params validation is not in correct format:", async () => {
        
        const invalidParamsTestCases = [
            "", // Empty ID
            "123", // Too short
            "invalid-id", // Non-hex characters
            "67ab179b5ae8f11485a9bd3", // 23 characters (should be 24)
            "67ab179b5ae8f11485a9bd3555", // 25 characters (should be 24)
            "67ab179b5ae8f11485a9bd3g", // Contains a non-hex character (g)
        ];
            
        for (let i = 0; i < invalidParamsTestCases.length; i++) {
            const response = await app.inject({
                method: 'DELETE',
                url: `/event/delete/${invalidParamsTestCases[i]}`,
              
                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
       


             expect(responseBody.error).toBe('Bad Request');
          //  expect(responseBody.message).toMatch('The authorizati
            expect(responseBody.message).toMatch('The id is required, to delete the events of the particular event manager');
        }
    });
});





describe("testing wheather the given id event is present in the events model or not while deleting the event from the events model", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });
    test("should respond with a status code of 400 if the event id is not in the events model while deletion.", async () => {
        Events.findById = jest.fn().mockResolvedValue(null);

    
          
      

        
            const response = await app.inject({
                method: 'DELETE',
                url: '/event/delete/67ab179b5ae8f11485a9bd35',
              

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody.error).toMatch('event not found');
        
    });

})




describe("testing wheather the given id event is present in the events model and deleting the event from the events model is successfully ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
    });

    const mockEvent = {
        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 100,
        bookedseats: 0,
        userId: "mockUserId",
        __v: 0,
        deleteOne: jest.fn().mockResolvedValue(true) 
    };

    // Ensure Events.findById returns mockEvent
    Events.findById = jest.fn().mockResolvedValue(mockEvent);
    

    test("should respond with a status code of 400 if the event id is present in the events model  and deletion is successfully.", async () => {

        
            const response = await app.inject({
                method: 'DELETE',
                url: '/event/delete/67ab179b5ae8f11485a9bd35',
              

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        
            const event = await Events.findById("67ab179b5ae8f11485a9bd35");

            // expect(Events.findById).toHaveBeenCalledWith("67ab179b5ae8f11485a9bd35");
             expect(Events.findById).toHaveBeenCalledTimes(0);


             
            expect(Events.findById).toHaveBeenCalledWith("67ab179b5ae8f11485a9bd35");

            expect(mockEvent.deleteOne).toHaveBeenCalledTimes(1);
    

            expect(response.statusCode).toBe(200);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody).toHaveProperty('message', 'event deleted successfully');
        
    });

})



//catch block Error  test code for the while deletion of the event here, 



describe("testing catch block Error  while the give  fields are deleting correctly or not", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);

        
  Events.findById.mockResolvedValue({

    _id: "67ab179b5ae8f11485a9bd35",
    amountrange: 10,
    eventname: "Event F",
    eventdate: "2027-02-10T00:00:00.000Z",
    eventlocation: "location f",
    eventtime: "15:30:30",
    totalseats: 100,
    availableseats: 100,
    bookedseats: 0,
    userId: "mockUserId",
    __v: 0
})





    });
    test("should respond with a status code of 400 if the catch block error raised.", async () => {
        // Events.findByIdAndUpdate = jest.fn().mockResolvedValue(new Error("Database Connection Error"));

        Events.findById.mockRejectedValueOnce(new Error("Database Connection Error while deletion of the event"));

    
          
       
            

        
            const response = await app.inject({
                method: 'DELETE',
                url: '/event/delete/67ab179b5ae8f11485a9bd35',

                headers: {
                    'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
                }
            });
        

            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            expect(responseBody.error).toEqual("Database Connection Error while deletion of the event"
               
            )
        
    });

})












































































































































// ======================================================================================================================================================================================================



// describe("CREATE -EVENT- testing when required fields are missing", () => {


//     let token;

//     beforeAll(async() => {
//         jest.clearAllMocks();
//         Users.findOne.mockResolvedValue(null);


//         const mockSave = jest.fn().mockResolvedValue({});
//         Users.prototype.save = mockSave;

      


//         const registerResponse = await app.inject({
//             method: 'POST',
//             url: '/auth/register',
//             payload: { username: 'testuser', password: 'Pass1Q@word', email: 'test@gmail.com', role: 'admin' }
//         });
//         expect(registerResponse.statusCode).toBe(201);
//         //expect(mockSave).toHaveBeenCalledTimes(1);


//         Users.findOne.mockResolvedValue({
//             _id: '1',
//             username: 'testuser',
//             email: 'test@gmail.com',
//             password: 'hashedpassword',
//             role: 'admin' // Ensure admin role
//         });
//         bcrypt.compare.mockResolvedValue(true);
               
//                token = 'mockedToken.mockedToken.mockedToken';

//                jwt.sign.mockReturnValue(token);

//                Logs.findOne.mockResolvedValue(
//               null
//                ); // No existing log
//                Logs.prototype.save = jest.fn().mockResolvedValue({
//                 UserId: 'mockUserId',
//                 UserToken: token
//             });


//                const loginResponse = await app.inject({
//                 method: 'POST',
//                 url: '/auth/login',
//                 payload: { username: 'testuser', password: 'Pass1Q@word' }
//             });
    
//             expect(loginResponse.statusCode).toBe(200);

//             const loginBody = JSON.parse(loginResponse.body);
//         expect(loginBody).toHaveProperty('token');
//         token = loginBody.token; 


//         jwt.verify.mockImplementation((receivedToken, secret, callback) => {
//             if (receivedToken === token) {
//                 console.log("this is correct token only")
//                 callback(null, { id: 'mockUserId', role: 'admin' });
//             } else {
//                 callback(new Error("Invalid Token"), null);
//             }
//         });


//         Logs.findOne.mockResolvedValue({
//             UserId: 'mockUserId',
//             UserToken: token
           
//         });
//     });




//     test("should respond with a status code of 400 if any required field is missing", async () => {
//         // Test data with various missing fields
//         const bodydata = [
//             { eventname: "Event Q",eventdate: "2025-06-05", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: 50, availableseats: 30, bookedseats: 20 }, // Missing eventname
//             { eventname: "Event A", eventdate: "2025-03-15", eventlocation: "Location A", amountrange: 100, eventtime: "10:12:00", totalseats: 100, availableseats: 80 }, // Missing bookedseats
//             { eventname: "Event B", eventdate: "2025-04-20", eventlocation: "Location B", amountrange: 200, eventtime: "15:11:00", totalseats: 150, bookedseats: 50 }, // Missing availableseats
//             { eventname: "Event C", eventdate: "2025-05-10", eventlocation: "Location C", amountrange: 150, eventtime: "18:09:00", bookedseats: 20 }, // Missing totalseats, availableseats
//             { eventdate: "2025-06-05", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: 50, availableseats: 30, bookedseats: 20 }, // Missing eventname
//             {} // Missing all fields
//         ];
//         // const mockToken = "mockBearerToken";
//         // jwt.verify.mockImplementation((token, Process, callback) => {
//         //     // Mock the decoded token data (you can adjust this to suit your test case)
//         //     callback(null, { id: 'mockUserId', role: 'admin' });
//         // });

//         // Logs.findOne.mockResolvedValue({
//         //     UserToken: mockToken,
//         //     UserId: 'mockUserId',
//         // });
        

//         for (let i = 0; i < bodydata.length; i++) {
//             const response = await app.inject({
//                 method: 'POST',
//                 url: '/event/create',
//                 payload: bodydata[i],
//                 headers: {
//                     'Authorization': `Bearer ${token}`  // Include the mock Authorization header
//                 }
//             });

//             // When any required field is missing, it should return 400
//             expect(response.statusCode).toBe(403);
//             expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

//             const responseBody = JSON.parse(response.body);
//             expect(responseBody.error).toBe('Bad Request');
//             expect(responseBody.message).toMatch('Missing required fields in the body when creating an event');
//         }
//     });



//     afterAll(async () => {
//         await app.close(); 
// });

// });

// describe("testing the validation of event fields", () => {


//     let token;

//     beforeAll(() => {

//         token = 'mockedToken.mockedToken.mockedToken';


//         jwt.verify.mockImplementation((receivedToken, secret, callback) => {
//             if (receivedToken === token) {
//                 callback(null, { id: 'mockUserId', role: 'admin' });
//             } else {
//                 callback(new Error("Invalid Token"), null);
//             }
//         });
//         Logs.findOne.mockResolvedValue({
//             UserToken: token,
//             UserId: 'mockUserId',
//         });
//     });
//     test("should respond with a status code of 400 if any field is invalid", async () => {
//         // Test data with invalid field formats
//         const bodydata = [
//             { eventname: "Event A", eventdate: "invalid-date", eventlocation: "Location A", amountrange: 100, eventtime: "10:00", totalseats: 100, availableseats: 80, bookedseats: -5 }, // Invalid date format, negative bookedseats
//             { eventname: "Event B", eventdate: "2025-03-15", eventlocation: "Location B", amountrange: "invalid-range", eventtime: "15:00", totalseats: 100, availableseats: 80, bookedseats: 20 }, // Invalid amountrange (should be a number)
//             { eventname: "Event C", eventdate: "2025-06-10", eventlocation: "Location C", amountrange: 150, eventtime: "invalid-time", totalseats: 150, availableseats: 130, bookedseats: 20 }, // Invalid eventtime format
//             { eventname: "Event D", eventdate: "2025-07-25", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: -50, availableseats: 40, bookedseats: 10 }, // Invalid totalseats (should be >= 10)
            
            
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 }, // Invalid availableseats (should not be negative)
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 0, eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 },
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 5, availableseats: -10, bookedseats: 10 },
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: "50", eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 },
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: "50", availableseats: -10, bookedseats: 10 },
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: "10", bookedseats: 10 } ,
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: 10, bookedseats: "10" }     





//         ];

//         for (let i = 0; i < bodydata.length; i++) {
//             const response = await app.inject({
//                 method: 'POST',
//                 url: '/event/create',
//                 payload: bodydata[i],

//                 headers: {
//                     'Authorization': `Bearer ${token}`  // Include the mock Authorization header
//                 }
//             });

//             // When any field is invalid, it should return 400
//             expect(response.statusCode).toBe(400);
//             expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

//             const responseBody = JSON.parse(response.body);
//             expect(responseBody.error).toBe('Bad Request');
//             expect(responseBody.message).toMatch('Validation failed body requirement not matching when creating an event');
//         }
//     });


//     afterAll(async () => {
//         await app.close(); 
// });

// });
