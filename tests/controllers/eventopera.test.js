// import app from '../../app.js'; // Your Fastify app
// import Users from '../../models/Users.js'; // Users model
// import Logs from '../../models/Logs.js';
// import bcrypt from 'bcrypt';

// import jwt from 'jsonwebtoken';

// import mongoose from 'mongoose';

// import dotenv from 'dotenv';


// jest.mock('jsonwebtoken');
// jest.mock('../../models/Users.js'); // Mock Users model
// jest.mock('../../models/Logs.js');



// dotenv.config();

// process.env.SEC = 'SACHIN'
// describe("CREATE -EVENT- testing when required fields are missing", () => {
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
//         const mockToken = "mockBearerToken";
//         jwt.verify.mockImplementation((token, Process, callback) => {
//             // Mock the decoded token data (you can adjust this to suit your test case)
//             callback(null, { id: 'mockUserId', role: 'admin' });
//         });

//         Logs.findOne.mockResolvedValue({
//             UserToken: mockToken,
//             UserId: 'mockUserId',
//         });
        

//         for (let i = 0; i < bodydata.length; i++) {
//             const response = await app.inject({
//                 method: 'POST',
//                 url: '/event/create',
//                 payload: bodydata[i],
//                 headers: {
//                     'Authorization': `Bearer ${mockToken}`  // Include the mock Authorization header
//                 }
//             });

//             // When any required field is missing, it should return 400
//             expect(response.statusCode).toBe(400);
//             expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

//             const responseBody = JSON.parse(response.body);
//             expect(responseBody.error).toBe('Bad Request');
//             expect(responseBody.message).toMatch('Missing required fields in the body');
//         }
//     });
// });


// describe("testing the validation of event fields", () => {
//     test("should respond with a status code of 400 if any field is invalid", async () => {
//         // Test data with invalid field formats
//         const bodydata = [
//             { eventname: "Event A", eventdate: "invalid-date", eventlocation: "Location A", amountrange: 100, eventtime: "10:00", totalseats: 100, availableseats: 80, bookedseats: -5 }, // Invalid date format, negative bookedseats
//             { eventname: "Event B", eventdate: "2025-03-15", eventlocation: "Location B", amountrange: "invalid-range", eventtime: "15:00", totalseats: 100, availableseats: 80, bookedseats: 20 }, // Invalid amountrange (should be a number)
//             { eventname: "Event C", eventdate: "2025-06-10", eventlocation: "Location C", amountrange: 150, eventtime: "invalid-time", totalseats: 150, availableseats: 130, bookedseats: 20 }, // Invalid eventtime format
//             { eventname: "Event D", eventdate: "2025-07-25", eventlocation: "Location D", amountrange: 50, eventtime: "12:00", totalseats: -50, availableseats: 40, bookedseats: 10 }, // Invalid totalseats (should be >= 10)
//             { eventname: "Event E", eventdate: "2025-08-15", eventlocation: "Location E", amountrange: 50, eventtime: "18:00", totalseats: 50, availableseats: -10, bookedseats: 10 } // Invalid availableseats (should not be negative)
//         ];

//         for (let i = 0; i < bodydata.length; i++) {
//             const response = await app.inject({
//                 method: 'POST',
//                 url: 'event/create',
//                 payload: bodydata[i]
//             });

//             // When any field is invalid, it should return 400
//             expect(response.statusCode).toBe(400);
//             expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

//             const responseBody = JSON.parse(response.body);
//             expect(responseBody.error).toBe('Bad Request');
//             expect(responseBody.message).toMatch('Validation failed body requirement not matching');
//         }
//     });
// });
