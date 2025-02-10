
import app from '../../app.js'; // Your Fastify app
import Users from '../../models/Users.js'; // Users model

jest.mock('../../models/Users.js'); // Mock Users model

import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';



beforeAll(async () => {
    await app.listen(3044); // Ensure the Fastify app is running on port 3021
});

afterAll(async () => {
    await app.close(); // Close the app after tests

});

afterEach(() => {
    jest.clearAllMocks();
})

// test-case-1:  Testing if the user already exists
describe("testing the registration of user", () => {
    test("should respond with 400 status code", async () => {
        // Mock findOne to return a user with the username 'testname'
        Users.findOne.mockResolvedValue({ username: 'testname' });

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: { username: 'testname', password: 'T@est1password', email: 'testemail@gmail.com', role: 'admin' }
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ error: 'Username already exists. Try with another username' });

        //expect(response.body).toBe('Username already exists. Try with another username');
    });
});

// test-case -2: Testing the /register for all success cases
describe("testing the /registering the user", () => {
    test("should respond with a 201 status code", async () => {
        Users.findOne.mockResolvedValue(null);

        const mockSave = jest.fn().mockResolvedValue({});
        Users.prototype.save = mockSave;

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: {
                username: "username",
                password: "T@1assword",
                email: "sachin@gmail.com",
                role: "admin"
            }
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body)).toEqual({ message: 'user created successfully' });

        expect(mockSave).toHaveBeenCalledTimes(1);
    });
})

describe("testing the /registering the user", () => {

    test("should specify json in the content-type header", async () => {

        Users.findOne.mockResolvedValue(null);

        const mockSave = jest.fn().mockResolvedValue({});
        Users.prototype.save = mockSave;

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: {
                username: "username",
                password: "pT@1assword",
                email: "email@gmail.com",
                role: "admin"
            }
        });

        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        expect(mockSave).toHaveBeenCalledTimes(1);
    });

})
//     test("should return the user object", async () => {

//         Users.findOne.mockResolvedValue(null);

//         const mockSave = jest.fn().mockResolvedValue({});
//         Users.prototype.save = mockSave;

//         const response = await app.inject({
//             method: 'POST',
//             url: '/auth/register',
//             payload: {
//                 username: "username",
//                 password: "password",
//                 email: "email",
//                 role: "role"
//             }
//         });

//         expect(JSON.parse(response.body)).toEqual({ message: 'user created successfully' });

//         expect(mockSave).toHaveBeenCalledTimes(1);
//     });
// });


// test-case -3 : testing the misssing any content :
describe("testing when username or password or email or role is missing", () => {
    test("should respond with a status code of 400 if any field is missing", async () => {
        // Mock the findOne method to return null (no existing user)
        Users.findOne.mockResolvedValue(null);

        // Mock the save method to simulate success (this won't be called if fields are missing)
        //   const mockSave = jest.fn().mockResolvedValue({});
        //   Users.prototype.save = mockSave;

        // Test data with various missing fields
        const bodydata = [
            { username: "username", password: "pas@1Qsword", email: "email@gmail.com" },  // Missing role
            { username: "username", password: "pas@1Qsword", role: "admin" },     // Missing email
            { username: "username", email: "email@gmail.com", role: "admin" },            // Missing password
            { password: "pas@1Qsword", email: "email@gmail.com", role: "admin" },            // Missing username
            { username: "username", password: "pas@1Qsword" },                    // Missing email, role
            { username: "username", email: "email@gmail.com" },                          // Missing password, role
            { username: "username", role: "admin" },                            // Missing password, email
            { email: "email@gmail.com", role: "admin" },                                  // Missing username, password
            { password: "pas@1Qsword", email: "email@gmail.com" },                          // Missing username, role
            { password: "pas@1Qsword", role: "admin" },                            // Missing username, email
          // All fields present
            { username: "username" },                                          // Missing password, email, role
            { password: "pas@1Qsword" },                                          // Missing username, email, role
            { email: "email@gmail.com" },                                                // Missing username, password, role
            { role: "admin" },                                                  // Missing username, password, email
            {}                                                                 // Missing all fields
        ];

        for (let i = 0; i < bodydata.length; i++) {
            const mockSave = jest.fn().mockResolvedValue({});
            Users.prototype.save = mockSave;
            const response = await app.inject({
                method: 'POST',
                url: '/auth/register',
                payload: bodydata[i]
            });


            // When any field is missing, save should not be called
            expect(response.statusCode).toBe(400);  // Missing fields should return 400
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            // Ensure error message matches the specific validation error
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Missing required fields in the body');


            expect(mockSave).toHaveBeenCalledTimes(0);  // Ensure save is not called when fields are missing

        }
    });
});


// Test-case-2: Testing validation for proper format of fields
describe("testing the validation of username, password, email, or role", () => {
    test("should respond with a status code of 400 if any field is invalid", async () => {
        // Mock the findOne method to return null (no existing user)
        Users.findOne.mockResolvedValue(null);

        // Test data with invalid fields
        const bodydata = [
            { username: "us", password: "T@est1password", email: "validemail@gmail.com", role: "admin" },  // Invalid username (too short)
            { username: "validusername", password: "short", email: "validemail@gmail.com", role: "admin" },  // Invalid password (too short)
            { username: "validusername", password: "T@est1password", email: "invalidemail", role: "admin" },  // Invalid email
            { username: "validusername", password: "T@est1password", email: "validemail@gmail.com", role: "invalidrole" },  // Invalid role
        ];

        for (let i = 0; i < bodydata.length; i++) {
            const mockSave = jest.fn().mockResolvedValue({});
            Users.prototype.save = mockSave;
            const response = await app.inject({
                method: 'POST',
                url: '/auth/register',
                payload: bodydata[i]
            });

            // When any field is invalid, save should not be called
            expect(response.statusCode).toBe(400);  // Invalid fields should return 400
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            // Ensure error message matches the specific validation error
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Validation failed body requirement not matching');

            expect(mockSave).toHaveBeenCalledTimes(0);  // Ensure save is not called when fields are invalid
        }
    });
});




// Test Case 4: Internal server error  catch block
describe("testing when an error occurs during user creation catch block", () => {

    test("should respond with a status code of 500", async () => {

        Users.findOne.mockResolvedValue(null);

        const mockSave = jest.fn().mockRejectedValue(new Error('Database error'));

        Users.prototype.save = mockSave;
        const bodydata = {
            username: "username",
            password: "paH@1ssword",
            email: "email@gamil.com",
            role: "admin"
        };

        const response = await app.inject({
            method: 'POST',
            url: '/auth/register',
            payload: bodydata
        });

        expect(response.statusCode).toBe(500);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        expect(JSON.parse(response.body)).toEqual({
            error: "error creating the user"
        })
        expect(mockSave).toHaveBeenCalledTimes(1);
    })
})



// // ++++++++++++++++++++++++++++++++++++++++++++ TEST CASES FOR THE LOGIN FUNCTIONALITY +++++++++++++++++++++++++++++++++++++++++++++++++++++++



// // Test Case 1: User not found (Invalid username)
// describe("testing the login functionality", () => {

//     test("testing when user name not found", async () => {
//         Users.findOne.mockResolvedValue(null);

//         const response = await app.inject({
//             method: 'POST',
//             url: '/auth/login',
//             payload: { username: "username", password: "password" }
//         });

//         expect(response.statusCode).toBe(400);
//         expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
//         expect(JSON.parse(response.body)).toEqual({
//             error: "user not found"
//         })
//     })
// })


// // Test Case 2: Invalid credentials (password doesn't match)

// describe("testing the login functionality", () => {

//     //import bcrypt from 'bcryptjs';
//     test('should respond with a status code of 400 for invalid credentials', async () => {

//         Users.findOne.mockResolvedValue({
//             _id: '1',
//             username: 'username',
//             password: 'hashedpassword',
//             role: 'user'
//         })

//         //  bcrypt.compare=jest.fn().mockResolvedValue(false);
//         //   jest.mock('bcrypt', () => ({
//         //     compare: jest.fn().mockResolvedValue(false),
//         //   }));

//         bcrypt.compare = jest.fn().mockResolvedValue(false);

//         const bodydata = { username: "username", password: "password" };

//         const response = await app.inject({
//             method: 'POST',
//             url: '/auth/login',
//             payload: bodydata
//         })

//         expect(response.statusCode).toBe(400);
//         expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
//         expect(JSON.parse(response.body)).toEqual({
//             error: 'invalid credentials'

//         })
//     })
// })


// // // Test Case 3: Successful login (correct username and password)

// describe("testing the login functionality", () => {
//     test('should respond with a status code of 200 for successfully logged in user', async () => {

//         Users.findOne.mockResolvedValue({
//             _id: '1',
//             username: 'username',
//             password: 'hasedpassword',
//             role: 'user'
//         });

//         bcrypt.compare = jest.fn().mockResolvedValue(true);

//         jest.mock('jsonwebtoken'); // Mocking the entire jsonwebtoken module

//         jwt.sign = jest.fn().mockReturnValue('mockedToken');

//         const bodydata = { username: 'username', password: 'password' };

//         const response = await app.inject({
//             method: 'POST',
//             url: '/auth/login',
//             payload: bodydata
//         })

//         expect(response.statusCode).toBe(200);
//         expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
//         expect(JSON.parse(response.body)).toEqual({
//             token: 'mockedToken'
//         })

//     })
// })


// // Test Case 4: Internal server error (bcrypt.compare throws error) catch block

// describe("testing when an error occurs during login", () => {

//     test("should respond with a status code of 500", async () => {
//         Users.findOne.mockResolvedValue({
//             _id: '1',
//             username: 'username',
//             password: 'hashedPassword',
//             role: 'user',

//         });

//         bcrypt.compare = jest.fn().mockRejectedValue(new Error('Database error'));

//         const bodydata = {
//             username: "username",
//             password: "password"
//         }

//         const response = await app.inject({
//             method: 'POST',
//             url: '/auth/login',
//             payload: bodydata
//         });
//         expect(response.statusCode).toBe(500);
//         //console.log('Expected:', expected);
//         //console.log('Received:', received);

//         expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
//         expect(JSON.parse(response.body)).toEqual({
//             error: 'error while login in the user'
//         })
//         // expect(mockSave).toHaveBeenCalledTimes(0);
//     })

// })


// // ++++++++++++++++++++++++++++++++++++++++++++ TEST CASES FOR THE LOGOUT FUNCTIONALITY +++++++++++++++++++++++++++++++++++++++++++++++++++++++
