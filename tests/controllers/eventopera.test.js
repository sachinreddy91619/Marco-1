import app from '../../app.js'; // Your Fastify app
import Users from '../../models/Users.js'; // Users model
import Logs from '../../models/Logs.js';
import Events from '../../models/Events.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


jest.mock('jsonwebtoken');
jest.mock('../../models/Users.js'); // Mock Users model
jest.mock('../../models/Logs.js');
jest.mock('../../models/Events.js');
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
    afterAll(async () => {
        await app.close(); 
});

});

// ======================================================================================================================================================================================================
///TEST CASES FOR THE , GET METHOD : ROLE:ADMIN












































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
