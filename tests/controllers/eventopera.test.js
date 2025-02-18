import app from '../../app.js'; // Your Fastify app

import Users from '../../models/Users.js'; // Users model
import Logs from '../../models/Logs.js';
import Events from '../../models/Events.js';
import EventLoc from '../../models/EventLoc.js';

import EMB from '../../models/EMB.js'





import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';



jest.mock('jsonwebtoken');
jest.mock('../../models/Users.js'); // Mock Users model
jest.mock('../../models/Logs.js');
jest.mock('../../models/Events.js');
jest.mock('../../models/EventLoc.js');
jest.mock('../../models/EMB.js')
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

            { eventname: "Event A", eventdate: "2025-06-05", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: 50, availableseats: 30, bookedseats: 20 }

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
            { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: "10", bookedseats: 10 },
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

        const bodydata = {
            eventname: "Event B",
            eventdate: "2012-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24", totalseats: 100, availableseats: 80, bookedseats: 20
        }


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
        else {
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
            _id: "67ab179b5ae8f11485a9bd35",
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


        const bodydata = {
            eventname: "Event F",
            eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:30", totalseats: 100, availableseats: 100, bookedseats: 0
        }
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
            _id: "67ab179b5ae8f11485a9bd35",
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


        const bodydata = {
            eventname: "Event F",
            eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:30", totalseats: 100, availableseats: 100, bookedseats: 0
        }

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
        expect(responseBody).toEqual({ error: "Database save failed,Error creating the Event" });



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
        }, {
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
            }, {
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






// test case for the  user , getting the events data  but no events for the location
describe("testing case for  getting the events data but no events for the location", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        EventLoc.find = jest.fn().mockResolvedValue([]);


        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);
        Events.findOne = jest.fn().mockResolvedValue(null);


    });

    test("should respond with a status code of 400 if the user trying to get the events data but no events for the location", async () => {





        const response = await app.inject({
            method: 'GET',
            url: '/event/get',
            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({ message: "No events found for this location" });

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



    });

    test("should respond with a status code of 400 if the working for the  admin  succefully or not ", async () => {


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
        expect(responseBody).toEqual({ error: "Database failed while getting the events data,Error triggering the catch block" });
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
        }, {
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
        }, {
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

    let mockUserLog;




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
        }, {
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
        Events.findById.mockRejectedValue(new Error("Database Error qqq")); // Mock DB call

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
    let mockUserLog

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
            { eventname: 123 },
            { eventdate: "78:90:90" },
            { eventlocation: 33545 },
            { amountrange: 0 },
            { eventname: "Event A", eventdate: "invalid-date", eventlocation: "Location A", amountrange: 100, eventtime: "10:00:10" }, // Invalid date format
            { eventname: "Event B", eventlocation: "Location B", amountrange: "invalid-range", eventtime: "15:00:10" }, // Invalid amountrange (should be a number)
            { eventname: "Event C", eventlocation: "Location C", amountrange: 150, eventtime: "invalid-time" }, // Invalid eventtime format
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50 }, // Invalid availableseats (should not be negative)
            { eventname: "Event E", eventlocation: "Location E", amountrange: 0, eventtime: "18:00", availableseats: -10, bookedseats: 10 }, // Invalid amountrange  should be min 1
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: "50", eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00:00", totalseats: 50, availableseats: 10, bookedseats: 10 },
            { eventname: "Event E", eventlocation: "Location E", amountrange: 50, eventtime: "18:00:00", totalseats: 50, availableseats: 10, bookedseats: 10 },
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



        const bodydata = {
            eventname: "Event B",
            eventdate: "2012-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"
        }


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
        else {
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



        const bodydata = {
            eventname: "Event B",
            eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"
        }



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



        const bodydata = {
            eventname: "Event B",
            eventdate: "2027-02-10", eventlocation: "Location B", amountrange: 10, eventtime: "15:30:24"
        }



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



        const bodydata = {
            eventname: "AMC-KITE-FESTIVAL",
            eventdate: "2025-08-10", eventlocation: "AHMEDABAD", amountrange: 100, eventtime: "15:30:24"
        }



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



        const bodydata = {
            eventname: "AMC-KITE-FESTIVAL",
            eventdate: "2025-08-10", eventlocation: "AHMEDABAD", eventtime: "15:30:24"
        }



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
    let mockUserLog

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

    afterEach(() => {
        jest.clearAllMocks();
    })
    test("should respond with a status code of 400 if the event id is not in the events model while deletion.", async () => {
        Events.findByIdAndDelete = jest.fn().mockResolvedValue(null);






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




describe("testing wheather the given id event is present in the events model and deleting the event from the events model is successfully doen  ", () => {

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




    test("should respond with a status code of 200 if the event id is present in the events model  and deletion is successfully done .", async () => {

        //Events.findByIdAndDelete = jest.fn().mockResolvedValue(true);


        const mockEvent = { _id: "67ab179b5ae8f11485a9bd35", userId: "mockUserId" };

        Events.findByIdAndDelete.mockResolvedValue(mockEvent);

        const response = await app.inject({
            method: 'DELETE',
            url: '/event/delete/67ab179b5ae8f11485a9bd35',
            headers: {
                'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
            }
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
        expect(responseBody).toHaveProperty('message', 'event deleted successfully');
    });

})



//catch block Error  test code for the while deletion of the event here :

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

        Events.findByIdAndDelete.mockRejectedValueOnce(new Error("Database Connection Error while deletion of the event"));

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

////////////////////////////////////////////
// user location giving test cases


// test case for the  user , getting the events data without giving the location
describe("testing case for  getting the events data without giving the location for the Get method ", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        EventLoc.find = jest.fn();


        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);



    });

    test("should respond with a status code of 400 if the user trying to get the events data before giving the locatoion ", async () => {


        EventLoc.findOne.mockResolvedValue(null);

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
        expect(responseBody).toEqual({ message: "Please provide your location first." });

    });

});

describe("testing while user providing the location", () => {
    let mockToken;
    let mockUserLog;
    beforeEach(() => {
        mockToken = 'mocked1Token.mocked1Token.mocked1Token';


        jwt.verify.mockReturnValue({ id: 'mockUser1Id', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should respond with a status code of 400 if any  error raised for invalid header while giving the location .", async () => {

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
        const testcase = [{ eventneedlocation: "amc" }]

        for (let i = 0; i < invalidHeadersTestCases.length; i++) {

            const response = await app.inject({
                method: 'POST',
                url: '/event/location',
                payload: testcase[0],
                headers: invalidHeadersTestCases[i]
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The authorization header is required, to provide the location of the user")

        }
    });



    test("should respond with a status code of 400 if any  error raised for invalid body validation while giving the location .", async () => {
        const bodydata = [
            { eventneedlocation: "aa" },
            { eventneedlocation: "a" },
            { eventneedlocation: "aadddddddaedwwwwwwwwwdddddddddddddddddddddddddddlfhgkdhgjk" },
            { eventneedlocation: "" },
            {},
        ];
        for (let i = 0; i < bodydata.length; i++) {

            const response = await app.inject({
                method: 'POST',
                url: '/event/location',
                payload: bodydata[i],

                headers: {
                    'Authorization': `Bearer ${mockToken}`
                }
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The body is not matching has per  requirements, to provide the location of the user")
        }
    });

})

test("should respond with a status code of 400 if location already exits for this user while giving the location .", async () => {

    let mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    EventLoc.findOne.mockResolvedValue(true);

    const bodydata = [
        { eventneedlocation: "amc" },
    ];


    const response = await app.inject({
        method: 'POST',
        url: '/event/location',
        payload: bodydata[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`

        }

    })
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual("location already exist")
})




test("should respond with a status code of 200 if location given by user  successfully saved while giving the location .", async () => {

    let mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    EventLoc.findOne.mockResolvedValue(null);

    EventLoc.prototype.save = jest.fn().mockResolvedValue({
        _id: "67b317a2063000cf0ddc7c1a",
        eventneedlocation: "amc",
        userId: "67b2fd578942678d76348472",
        createdAt: new Date("2025-02-17T11:04:02.764Z"),
        updatedAt: new Date("2025-02-17T11:04:02.764Z"),
        __v: 0
    });

    const bodydata = [
        { eventneedlocation: "amc" },
    ];


    const response = await app.inject({
        method: 'POST',
        url: '/event/location',
        payload: bodydata[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`

        }

    })
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    //const responseBody = JSON.parse(response.body);
    const responseBody = JSON.parse(response.body)
    expect(responseBody.message).toEqual("location saved for this user");

    // Ensure the save method was called
    expect(EventLoc.prototype.save).toHaveBeenCalled();
})


test("should respond with a status code of 400  when we get the catch block error given by user giving the location .", async () => {

    let mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    EventLoc.findOne.mockRejectedValue(new Error("Data base Error"));



    const bodydata = [
        { eventneedlocation: "amc" },
    ];


    const response = await app.inject({
        method: 'POST',
        url: '/event/location',
        payload: bodydata[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`

        }

    })
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    //const responseBody = JSON.parse(response.body);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).toEqual("getting the error while giving the event location"

    );

    // Ensure the save method was called

})



// 33333333333333333333333333333333333333333333333333333333333333333333333333333
// event booking all test cases :


describe("testing while user providing the location", () => {
    let mockToken;
    let mockUserLog;
    beforeEach(() => {
        mockToken = 'mocked1Token.mocked1Token.mocked1Token';


        jwt.verify.mockReturnValue({ id: 'mockUser1Id', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should respond with a status code of 400 if any  error raised for invalid header while booking the event  .", async () => {

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
        const testcase = [{ NoOfSeatsBooking: 10 }]

        for (let i = 0; i < invalidHeadersTestCases.length; i++) {

            const response = await app.inject({
                method: 'POST',
                url: '/event/eventit/67ab17b75ae8f11485a9bd38',
                payload: testcase[0],
                headers: invalidHeadersTestCases[i]
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The authorization header is required, while booking the no of seats for the event")

        }
    });


    test("should respond with a status code of 400 if any  error raised for invalid body validation while booking the event.", async () => {
        const bodydata = [
            { NoOfSeatsBooking: "aa" },
            { NoOfSeatsBooking: 0 },
            { NoOfSeatsBooking: "" },
            {},
            //{ NoOfSeatsBooking:1 },
        ];
        for (let i = 0; i < bodydata.length; i++) {

            const response = await app.inject({
                method: 'POST',
                url: '/event/eventit/67ab17b75ae8f11485a9bd38',
                payload: bodydata[i],

                headers: {
                    'Authorization': `Bearer ${mockToken}`
                }
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The  body is missing the required format while booking the event")
        }
    });

})


test("should respond with a status code of 400 because seats for this particular event is completly booked while booking the event.", async () => {

    let mockToken = 'mocked1Token.mocked1Token.mocked1Token';
    Events.findById.mockResolvedValue({

        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 0,
        bookedseats: 0,
        userId: "mockUser1Id",
        __v: 0
    })




    const bodydata = [

        { NoOfSeatsBooking: 10 },

    ];


    const response = await app.inject({
        method: 'POST',
        url: '/event/eventit/67ab179b5ae8f11485a9bd35',
        payload: bodydata[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`
        }
    });
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual("event is fully booked")

});
//;;;;;;;;;;;;;;;;;;;;;;;;;;;

test("should respond with a status code of 400 if NoOfSeatsBooking exceeds available seats", async () => {
    let mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    // Mock the event with 40 available seats
    const mockEvent = {
        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 40,  // 40 available seats
        bookedseats: 0,
        userId: "mockUser1Id",
        __v: 0
    };


    Events.findById.mockResolvedValue(mockEvent);


    const bodydata = [
        { NoOfSeatsBooking: 50 },];


    const response = await app.inject({
        method: 'POST',
        url: '/event/eventit/67ab179b5ae8f11485a9bd35',
        payload: bodydata[0],
        headers: {
            'Authorization': `Bearer ${mockToken}`,
        },
    });


    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));


    const responseBody = JSON.parse(response.body);


    expect(responseBody.message).toEqual("maximum number of seats can be booked :40, so please reduce the number of seats");
});

test("should calculate the correct amount and update event seats", async () => {
    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    // Mock event data
    const mockEvent = {

        "id": "67ab179b5ae8f11485a9bd35",
        "amountrange": 10,
        "eventname": "Event F",
        "eventdate": "2027-02-10T00:00:00.000Z",
        "eventlocation": "location f",
        "eventtime": "15:30:30",
        "totalseats": 100,
        "availableseats": 40,
        "bookedseats": 60,
        "userId": "mockUser1Id",
        "__v": 0

    }

    const data = {


        "eventid": "67ab179b5ae8f11485a9bd35",
        "amountrange": 10,
        "eventname": "Event F",
        "eventdate": "2027-02-10T00:00:00.000Z",
        "eventlocation": "location f",
        "eventtime": "15:30:30",
        "eventManager": "EventManagerUser",
        "eventManagerEmail": "eventmanager@example.com",
        "eventBookedBy": "BookingUser",
        "email": "bookinguser@example.com",
        "NoOfSeatsBooking": 20,
        "AmountNeedPay": 200,
        "userId": "mockUser1Id"
    }


    const EMmockUser = {
        _id: "mockUser1Id",
        username: "EventManagerUser",
        email: "eventmanager@example.com"
    };

    const mockBookingUser = {
        _id: "new ObjectId('67b33a1b13016c9d42605dd3')",
        username: "BookingUser",
        email: "bookinguser@example.com"
    };

    // Mock findById
    Events.findById.mockResolvedValue(mockEvent);
    // Users.findById.mockImplementation((id) => {
    //     if (id === EMmockUser._id) return Promise.resolve(EMmockUser);
    //     if (id === mockBookingUser._id) return Promise.resolve(mockBookingUser);
    //     return null;
    // });
    EMB.findByIdAndUpdate.mockResolvedValue(data)

    // Simulate booking 20 seats
    const bodydata = { NoOfSeatsBooking: 20 };

    const response = await app.inject({
        method: 'POST',
        url: '/event/eventit/67ab179b5ae8f11485a9bd35',
        payload: bodydata,
        headers: { 'Authorization': `Bearer ${mockToken}` },
    });


    expect(response.statusCode).toBe(200);

    console.log("Full Response:", response);



    const responseBody = JSON.parse(response.body);


    console.log("Response Body:", response.body);

    expect(responseBody).toEqual(

        {
            "eventid": "67ab179b5ae8f11485a9bd35",
            "amountrange": 10,
            "eventname": "Event F",
            "eventdate": "2027-02-10T00:00:00.000Z",
            "eventlocation": "location f",
            "eventtime": "15:30:30",
            "eventManager": "EventManagerUser",
            "eventManagerEmail": "eventmanager@example.com",
            "eventBookedBy": "BookingUser",
            "email": "bookinguser@example.com",
            "NoOfSeatsBooking": 20,
            "AmountNeedPay": 200,
            "userId": "mockUser1Id"



        })
});



test("cATCH BLOCK ERROR WHILE BOOKING  THE  EVENT", async () => {
    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';



    // Mock findById
    Events.findById.mockRejectedValue(new Error("data base error"));
    Users.findById.mockRejectedValue(new Error("data base error"));

    // Mock save method for EMB
    EMB.prototype.save = jest.fn().mockRejectedValue(new Error("data base error"));



    // Simulate booking 10 seats
    const bodydata = { NoOfSeatsBooking: 10 };

    const response = await app.inject({
        method: 'POST',
        url: '/event/eventit/67ab179b5ae8f11485a9bd35',
        payload: bodydata,
        headers: { 'Authorization': `Bearer ${mockToken}` },
    });

    // Validate the amount calculation and event update
    expect(response.statusCode).toBe(400);
    const responseBody = JSON.parse(response.body);

    expect(responseBody.error).toEqual("data base error")
});


//


// 33333333333333333333333333333333333333333333333333333333333333333333333333333
// event booking all test cases :


describe("testing while user providing the location", () => {
    let mockToken;
    let mockUserLog;
    beforeEach(() => {
        mockToken = 'mocked1Token.mocked1Token.mocked1Token';


        jwt.verify.mockReturnValue({ id: 'mockUser1Id', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should respond with a status code of 400 if any  error raised for invalid header while getting all the booking   .", async () => {

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
                url: '/event/all',

                headers: invalidHeadersTestCases[i]
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The authorization header is required, to all of the bookings")

        }
    });
})








test("Geting all the bookings of the user successfully :", async () => {
    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    // Mock save method for EMB
    const data = [{
        eventid: "mockEvent._id1",
        eventManager: "EMmockUser.username1",
        eventManagerEmail: "EMmockUser.email1",
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        amountrange: 10,
        eventtime: "15:30:30",
        NoOfSeatsBooking: 10,
        eventBookedBy: "mockBookingUser.username1",
        email: "mockBookingUser.email1",
        AmountNeedPay: 100,
        userId: "mockBookingUser._id1"
    },
    {
        eventid: "mockEvent._id2",
        eventManager: "EMmockUser.username1",
        eventManagerEmail: "EMmockUser.email1",
        eventname: "Event B",
        eventdate: "2027-04-10T00:00:00.000Z",
        eventlocation: "location G",
        amountrange: 20,
        eventtime: "15:30:30",
        NoOfSeatsBooking: 10,
        eventBookedBy: "mockBookingUser.username1",
        email: "mockBookingUser.email1",
        AmountNeedPay: 200,
        userId: "mockBookingUser._id2"

    }];


    EMB.find.mockResolvedValue(data)

    // Simulate booking 10 seats


    const response = await app.inject({
        method: 'GET',
        url: '/event/all',

        headers: { 'Authorization': `Bearer ${mockToken}` },
    });

    // Validate the amount calculation and event update
    expect(response.statusCode).toBe(200);
    const responseBody = JSON.parse(response.body);

    expect(responseBody).toEqual(data





    )
});





test("Catch block Error while Geting all the bookings  :", async () => {
    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    // Mock save method for EMB


    EMB.find.mockRejectedValue(new Error("data base error"))

    // Simulate booking 10 seats


    const response = await app.inject({
        method: 'GET',
        url: '/event/all',

        headers: { 'Authorization': `Bearer ${mockToken}` },
    });

    // Validate the amount calculation and event update
    expect(response.statusCode).toBe(400);
    const responseBody = JSON.parse(response.body);

    expect(responseBody.error).toEqual("data base error")
});




describe("testing while updating the  booking of a user", () => {
    let mockToken;
    let mockUserLog;
    beforeEach(() => {
        mockToken = 'mocked1Token.mocked1Token.mocked1Token';


        jwt.verify.mockReturnValue({ id: 'mockUser1Id', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should respond with a status code of 400 if any  error raised for invalid header while updating the booking   .", async () => {

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
                url: '/event/bookings/67ab4d689ca224decd135353',

                headers: invalidHeadersTestCases[i]
            });
            // When any field is invalid, it should return 400
            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The authorization header is required, while updating the bookings of  the no of seats for the event")

        }
    });
})


test("should respond with a status code of 400 if any  error raised for invalid body validation while updating the event.", async () => {

    const mockToken = "mockedToken.mockedToken.mockedToken"

    const bodydata = [
        { NoOfSeatsBooking: "aa" },
        { NoOfSeatsBooking: 0 },
        { NoOfSeatsBooking: "" },
        {},
        //{ NoOfSeatsBooking:1 },
    ];
    for (let i = 0; i < bodydata.length; i++) {

        const response = await app.inject({
            method: 'PUT',
            url: '/event/bookings/67ab4d689ca224decd135353',
            payload: bodydata[i],

            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });
        // When any field is invalid, it should return 400
        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toEqual("The Body is not Matching has per the requirements, give correct body for updation")
    }
});



test("should respond with a status code of 400 if any  error raised for invalid body validation while updating the event.", async () => {

    const mockToken = "mockedToken.mockedToken.mockedToken"

    const bodydata = [
        { NoOfSeatsBooking: 10 },

    ];


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
            url: `/event/bookings/${invalidParamsTestCases[i]}`,
            payload: bodydata[0],

            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });
        // When any field is invalid, it should return 400
        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toEqual("The params is not Matching has per the requirements, give correct params id for updation")
    }
});




test("should respond with a status code of 400 if any  error raised when event not found while updating the event.", async () => {

    const mockToken = "mockedToken.mockedToken.mockedToken"

    EMB.findByIdAndUpdate.mockResolvedValue(null)

    const bodydata = [

        { NoOfSeatsBooking: 10 },
    ];


    const response = await app.inject({
        method: 'PUT',
        url: '/event/bookings/67ab4d689ca224decd135353',
        payload: bodydata[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`
        }
    });
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);

    expect(responseBody.error).toEqual("event not found here")

});

test("should return an error if requested seats exceed available seats", async () => {
    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    EMB.findByIdAndUpdate.mockResolvedValue(true)
    const mockEvent = {
        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 5,  // Only 5 seats available
        bookedseats: 95,
        userId: "mockUser1Id",
        __v: 0
    };

    // Mock `findByIdAndUpdate` to return the event
    Events.findByIdAndUpdate.mockResolvedValue(mockEvent);



    // Request to book more seats than available (e.g., 10 seats)
    const bodydata = { NoOfSeatsBooking: 10 };



    const response = await app.inject({
        method: 'PUT',
        url: '/event/bookings/67ab179b5ae8f11485a9bd35',
        payload: bodydata,
        headers: { 'Authorization': `Bearer ${mockToken}` },
    });


    expect(response.statusCode).toBe(400);
    const responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual(
        "maximum number of seats can be booked :5, so please reduce the number of seats");


});




test("should return an 200 if NoOfSeatsBooking is unchanged", async () => {

    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';

    const data = [{
        eventid: "mockEvent._id1",
        eventManager: "EMmockUser.username1",
        eventManagerEmail: "EMmockUser.email1",
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        amountrange: 10,
        eventtime: "15:30:30",
        NoOfSeatsBooking: 10,
        eventBookedBy: "mockBookingUser.username1",
        email: "mockBookingUser.email1",
        AmountNeedPay: 100,
        userId: "mockBookingUser._id1"
    }

    ];


    EMB.find.mockResolvedValue(data)

    // Events.findByIdAndUpdate.mockResolvedValue(mockEvent);


    const bodydata = { NoOfSeatsBooking: 10 };
    if (data.NoOfSeatsBooking === bodydata.NoOfSeatsBooking) {



        const response = await app.inject({
            method: 'PUT',
            url: '/event/bookings/67ab179b5ae8f11485a9bd35',
            payload: bodydata,
            headers: { 'Authorization': `Bearer ${mockToken}` },
        });
        expect(response.statusCode).toBe(200);
        let responseBody = JSON.parse(response.body);
        expect(responseBody).toEqual({
            message: "you are given same number of seats,so no changes in your booking"
        });

    }
});



test("should return an 200 if updation of the booking successsfully done", async () => {

    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';


    jest.mock('../../middleware/authmiddle.js', () =>
        jest.fn((request, reply, done) => {
            request.user = { id: "mockBookingUser._id1" }; // Set user ID
            done();
        })
    );




    const data = {
        eventid: "mockEvent._id1",
        eventManager: "EMmockUser.username1",
        eventManagerEmail: "EMmockUser.email1",
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        amountrange: 10,
        eventtime: "15:30:30",
        NoOfSeatsBooking: 5,
        eventBookedBy: "mockBookingUser.username1",
        email: "mockBookingUser.email1",
        AmountNeedPay: 50,
        userId: "mockBookingUser._id1",
        save: jest.fn().mockResolvedValue(true), // Mock save function
    }

    const mockEvent = {
        _id: "67ab179b5ae8f11485a9bd35",
        amountrange: 10,
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        eventtime: "15:30:30",
        totalseats: 100,
        availableseats: 50,
        bookedseats: 50,
        userId: "mockUser1Id",
        save: jest.fn().mockResolvedValue(true),
        __v: 0
    };


    EMB.findByIdAndUpdate.mockResolvedValue(data)

    Events.findByIdAndUpdate.mockResolvedValue(mockEvent);


    const bodydata = { NoOfSeatsBooking: 10 };

    const response = await app.inject({
        method: 'PUT',
        url: '/event/bookings/67ab179b5ae8f11485a9bd35',
        payload: bodydata,
        headers: { 'Authorization': `Bearer ${mockToken}` },
    });

    expect(response.statusCode).toBe(200);

    let responseBody = JSON.parse(response.body);

    expect(responseBody).toEqual({
        eventid: "mockEvent._id1",
        eventManager: "EMmockUser.username1",
        eventManagerEmail: "EMmockUser.email1",
        eventname: "Event F",
        eventdate: "2027-02-10T00:00:00.000Z",
        eventlocation: "location f",
        amountrange: 10,
        eventtime: "15:30:30",
        NoOfSeatsBooking: 10,
        eventBookedBy: "mockBookingUser.username1",
        email: "mockBookingUser.email1",
        AmountNeedPay: 100,
        userId: "mockBookingUser._id1"
    });


});











test("should respond with a status code of 400 if any catch block  error raised for while updating the booking of a user    .", async () => {

    const mockToken = 'mocked1Token.mocked1Token.mocked1Token';
    EMB.findByIdAndUpdate.mockRejectedValue(new Error("data base error"))
    Events.findByIdAndUpdate.mockRejectedValue(new Error("data base error"))


    const body = [{ NoOfSeatsBooking: 20 }]
    const response = await app.inject({
        method: 'PUT',
        url: '/event/bookings/67ab4d689ca224decd135353',
        payload: body[0],

        headers: {
            'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
        }
    });
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);

    expect(responseBody.error).toEqual("data base error")


});



describe("testing while cancling the  booking of a user", () => {
    let mockToken;
    let mockUserLog;
    beforeEach(() => {
        mockToken = 'mocked1Token.mocked1Token.mocked1Token';


        jwt.verify.mockReturnValue({ id: 'mockUser1Id', role: 'user' });

        mockUserLog = {
            _id: 'log123',
            UserId: 'mockUser1Id',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };

        Logs.findOne.mockResolvedValue(mockUserLog);


    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should respond with a status code of 400 if any  error raised for invalid header while cancelling the booking .", async () => {

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
                url: '/event/cc/67ab4d689ca224decd135353',

                headers: invalidHeadersTestCases[i]
            });

            expect(response.statusCode).toBe(400);
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
            const responseBody = JSON.parse(response.body);
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toEqual("The authorization header is required, while cancelling the event booking")

        }
    });
})



test("should respond with a status code of 400 if any  error raised for invalid params id validation while cancelling the booking.", async () => {

    const mockToken = "mockedToken.mockedToken.mockedToken"

    const bodydata = [
        { NoOfSeatsBooking: 10 },

    ];


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

            url: `/event/cc/${invalidParamsTestCases[i]}`,
            payload: bodydata[0],

            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });
        // When any field is invalid, it should return 400
        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toEqual("The params is not Matching has per the requirements, give correct params id for cancelling the event booking")
    }
});




test("should respond with a status code of 400 if event not found in EMB Model while cancelling the event.", async () => {

    const mockToken = "mockedToken.mockedToken.mockedToken"

    EMB.findByIdAndUpdate.mockResolvedValue(null)




    const response = await app.inject({
        method: 'DELETE',
        url: '/event/cc/67ab4d689ca224decd135353',


        headers: {
            'Authorization': `Bearer ${mockToken}`
        }
    });
    // When any field is invalid, it should return 400
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);

    expect(responseBody.error).toEqual("bookings not found")

});



test("should respond with a status code of 200 if the event id is present in the EMB  Model while cancelling the event is successfully done .", async () => {


    const mockToken = "mockedToken.mockedToken.mockedToken"

    //Events.findByIdAndDelete = jest.fn().mockResolvedValue(true);


    const mockEvent = { _id: "67ab179b5ae8f11485a9bd35", userId: "mockUser1Id" };

    EMB.findByIdAndDelete.mockResolvedValue(mockEvent);

    const response = await app.inject({
        method: 'DELETE',
        url: '/event/delete/67ab179b5ae8f11485a9bd35',
        headers: {
            'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
        }
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
    const responseBody = JSON.parse(response.body);
    expect(responseBody).toHaveProperty('message', 'event booking cancelled successfully');
});








test("should respond with a status code of 400 if any data base error raised while cancelling the event.", async () => {





    if (EMB.findByIdAndDelete.mockRejectedValue(new Error("data base error raised")) || Events.findByIdAndUpdate.mockRejectedValue(new Error("data base error raised"))) {

        const response = await app.inject({
            method: 'DELETE',
            url: '/event/cc/67ab4d689ca224decd135353',


            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });
        // When any field is invalid, it should return 400
        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);

        expect(responseBody.error).toEqual('data base error raised')
    }
});


































































































