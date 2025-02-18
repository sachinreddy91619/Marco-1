import fastify from 'fastify';
import app from '../../app.js'; // Your Fastify app
import Users from '../../models/Users.js'; // Users model
import Logs from '../../models/Logs.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';





jest.mock('../../models/Users.js'); // Mock Users model
jest.mock('../../models/Logs.js');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');







dotenv.config();

beforeAll(async () => {
    await app.listen(3044); // Ensure the Fastify app is running on port 3021
});

afterAll(async () => {
    await app.close(); // Close the app after tests

});

afterEach(() => {
    jest.clearAllMocks();
})

/// FOR REGISTRATION 

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



// test-case -3 : testing the misssing any content :
describe("testing when username or password or email or role is missing", () => {
    test("should respond with a status code of 400 if any field is missing", async () => {
        // Mock the findOne method to return null (no existing user)
        Users.findOne.mockResolvedValue(null);

       
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
            expect(response.statusCode).toBe(400);  
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





// Test Case 1: User not found (Invalid username)
describe("testing the login functionality", () => {

    test("testing when user name not found", async () => {

        Users.findOne.mockResolvedValue(null);

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { username: "username", password: "pass1Q@1Aword" }
        });

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        expect(JSON.parse(response.body)).toEqual({
            error: "user not found"
        })
    })
})


// Test Case 2: Invalid credentials (password doesn't match)

describe("testing the login functionality", () => {

    //import bcrypt from 'bcryptjs';
    test('should respond with a status code of 400 for invalid credentials', async () => {

        Users.findOne.mockResolvedValue({
            _id: '1',
            username: 'username',
            password: 'hashedpassword',
            role: 'user'
        })

        //  bcrypt.compare=jest.fn().mockResolvedValue(false);
        //   jest.mock('bcrypt', () => ({
        //     compare: jest.fn().mockResolvedValue(false),
        //   }));

        bcrypt.compare = jest.fn().mockResolvedValue(false);

        const bodydata = { username: "username", password: "pass1Q@1Aword" };

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: bodydata
        })

        expect(response.statusCode).toBe(400);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        expect(JSON.parse(response.body)).toEqual({
            error: 'invalid credentials'

        })
    })
})






// Test-case-4:  Testing while login , validation for missing fields in the body
describe("testing the validation for missing fields in the body if any of username, password ", () => {
    test("should respond with a status code of 400 if any field is invalid", async () => {
        // Mock the findOne method to return null (no existing user)
        Users.findOne.mockResolvedValue(null);

        // Test data with invalid fields
        const bodydata = [
            { password: "T@est1password" },
            { username: "validusername" },
            {}

            // { username: "uswertyujghty", password: "T@est1password" }


        ];

        for (let i = 0; i < bodydata.length; i++) {
            const mockSave = jest.fn().mockResolvedValue({});
            Users.prototype.save = mockSave;
            const response = await app.inject({
                method: 'POST',
                url: '/auth/login',
                payload: bodydata[i]
            });

            // When any field is invalid, save should not be called
            expect(response.statusCode).toBe(400);  // Invalid fields should return 400
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            // Ensure error message matches the specific validation error
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Missing required fields in the body');

            // expect(mockSave).toHaveBeenCalledTimes(0);  // Ensure save is not called when fields are invalid
        }
    });
});




// Test-case-4:  Testing while login , validation for proper format of fields
describe("testing the validation of username, password", () => {
    test("should respond with a status code of 400 if any field is invalid", async () => {
        // Mock the findOne method to return null (no existing user)
        Users.findOne.mockResolvedValue(null);

        // Test data with invalid fields
        const bodydata = [
            { username: "us", password: "T@est1password" },  // Invalid username (too short)
            { username: "validusername", password: "short" },  // Invalid password (too short)


            // { username: "uswertyujghty", password: "T@est1password" }


        ];

        for (let i = 0; i < bodydata.length; i++) {
            const mockSave = jest.fn().mockResolvedValue({});
            Users.prototype.save = mockSave;
            const response = await app.inject({
                method: 'POST',
                url: '/auth/login',
                payload: bodydata[i]
            });

            // When any field is invalid, save should not be called
            expect(response.statusCode).toBe(400);  // Invalid fields should return 400
            expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

            const responseBody = JSON.parse(response.body);

            // Ensure error message matches the specific validation error
            expect(responseBody.error).toBe('Bad Request');
            expect(responseBody.message).toMatch('Validation failed body requirement not matching');

            // expect(mockSave).toHaveBeenCalledTimes(0);  // Ensure save is not called when fields are invalid
        }
    });
});





// Test Case 4: Internal server error (bcrypt.compare throws error) catch block

describe("testing when an error occurs during login", () => {

    test("should respond with a status code of 500", async () => {
        Users.findOne.mockResolvedValue({
            _id: '1',
            username: 'username',
            password: 'hashedPassword',
            role: 'user',

        });

        bcrypt.compare = jest.fn().mockRejectedValue(new Error('Database error'));

        const bodydata = {
            username: "username",
            password: "pass@A1word"
        }

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: bodydata
        });
        expect(response.statusCode).toBe(500);
        //console.log('Expected:', expected);
        //console.log('Received:', received);

        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        expect(JSON.parse(response.body)).toEqual({
            error: 'Error while logging in the user'
        })
        // expect(mockSave).toHaveBeenCalledTimes(0);
    })

})



// // Test Case 3: Successful login (correct username and password)

describe("testing the login functionality", () => {
    test('should respond with a status code of 200 for successfully logged in user', async () => {

        Users.findOne.mockResolvedValue({
            _id: '1',
            username: 'username',
            password: 'hasedpassword',
            role: 'user'
        });

        bcrypt.compare = jest.fn().mockResolvedValue(true);

        // jest.mock('jsonwebtoken'); // Mocking the entire jsonwebtoken module

        // jwt.sign = jest.fn().mockReturnValue('mockedToken');

        const mockToken = 'mockedToken.mockedToken.mockedToken';
        jwt.sign = jest.fn().mockReturnValue(mockToken);

        Logs.findOne = jest.fn().mockResolvedValue(null); // Simulating no existing log
        Logs.prototype.save = jest.fn().mockResolvedValue(true);


        const bodydata = { username: 'username', password: 'pass1Q@1Aword' };

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: bodydata
        })

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'))
        expect(JSON.parse(response.body)).toEqual({
            token: 'mockedToken.mockedToken.mockedToken'
        });

    });
});


// // ++++++++++++++++++++++++++++++++++++++++++++ TEST CASES FOR THE LOGOUT FUNCTIONALITY +++++++++++++++++++++++++++++++++++++++++++++++++++++++









// In route validation error before going to the controller ;

// when authorization header is invalid 

describe("Testing the logout validation functionality", () => {

    let mockToken;
    let mockUserLog;

    beforeEach(() => {
        mockToken = 'mockedToken.mockedToken.mockedToken';
        
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
    });


    test("should respond with the 400 status code for invalid header or token format in logout ", async () => {


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
                url: '/auth/logout',
                headers: invalidHeadersTestCases[i]
    
            })
      


        expect(response.statusCode).toBe(400);  // Invalid fields should return 400
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

        const responseBody = JSON.parse(response.body);

        // Ensure error message matches the specific validation error
        expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.message).toEqual('Validation failed in the header requirement not matching');

    }

})
})

// Successfully logout 
describe("Testing the successful logout functionality", () => {

    let mockToken;
    let mockUserLog;
    beforeAll( ()=>{


        mockUserLog = {
            _id: 'log123',
            UserId: 'user123',
            logintime:'2025-02-03T10:19:31.568+00:00',
            logouttime: null, 
            UserToken: 'mockedToken.mockedToken.mockedToken',
            save: jest.fn().mockResolvedValue(true) // Mock the save method to resolve successfully
        };
    })
    mockToken = jwt.sign({ id: 'user123' }, process.env.SEC); // Use your JWT secret here

    test("should return 200 and successfully log out the user", async () => {


        const mockToken = 'mockedToken.mockedToken.mockedToken';

        jwt.verify.mockReturnValue({ id: 'mockUserId', role: 'admin' });


        const mockUserLog = {
            _id: 'log123',
            UserId: 'mockUserId',
            logintime: new Date(),
            logouttime: null,
            UserToken: mockToken,
            save: jest.fn().mockResolvedValue(true)
        };


        Logs.findOne.mockResolvedValue(mockUserLog);

        

        // Simulate the logout request with the Authorization header
        const response = await app.inject({
            method: 'POST',
            url: '/auth/logout',
            headers: {
                'Authorization': `Bearer ${mockToken}`,
            },
        });


        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
        const responseBody = JSON.parse(response.body);
       
        expect(responseBody.message).toBe('user logged out successfully');

    });

});


//catch block logout functionality :
describe("Testing logout functionality when an error occurs", () => {

    beforeEach(() => {

        jest.doMock('../../middleware/authmiddle.js', () => jest.fn( async(request, reply,done) => await done()));
        
     jwt.verify.mockImplementation(() => ({ id: 'user123',role:'user' }));
    });

    afterEach(() => {
      
        jest.clearAllMocks();
    });


    test("should return 400 status when Logs.findOne throws an error", async () => {

     
        const mockToken ="mockedtoken.mockedtoken.mockedtoken";
       // const mockToken = jwt.sign({ id: 'user123' }, process.env.SEC);
        // jest.mock('../../middleware/authmiddle.js', () => jest.fn((req, res, next) => next()));

        // // Create a valid token for a valid user
        // jwt.verify.mockImplementation(() => {
        //     return { id: 'user123' }; // Fake decoded token
        // });
        Logs.findOne = jest.fn().mockResolvedValue(true); 
        Logs.findOne.mockRejectedValue(new Error('Database error'));

       
        const response = await app.inject({
            method: 'POST',
            url: '/auth/logout',
            headers: {
                Authorization: `Bearer ${mockToken}`,  
            },
        });

     
        expect(response.statusCode).toBe(403);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

        const responseBody = JSON.parse(response.body);

        expect(responseBody.error).toEqual('error while logout in the current-user');
    });
});



///////////////////////////////// Middleware test cases ///////////////////////////////////


describe("Testing logout with no active session", () => {
    test("should return 400 if no active session is found for the user", async () => {
        // Mock the behavior where no user logs are found
        // Simulate no logs found
        Logs.findOne.mockResolvedValue(null);
        // Create a mock JWT token (This should match your actual token format and secret)
        const mockToken = jwt.sign({ id: 'user123' }, process.env.SEC); // Generate a valid JWT with a user id



        const response = await app.inject({
            method: 'POST',
            url: '/auth/logout',
            headers: {
                Authorization: `Bearer ${mockToken}`  // Set the Authorization header
            },
        });

        // Assert that the response has a 400 status code
        expect(response.statusCode).toBe(403);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

        const responseBody = JSON.parse(response.body);

        // Assert the response error and message match the expected ones
        // expect(responseBody.error).toBe('Bad Request');
        expect(responseBody.error).toBe('User is logged out, access denied');
    });
});






describe("Testing middleware - Invalid or Expired Token", () => {
    test("should return 403 if the token is invalid or expired", async () => {
        // Mock JWT verification failure
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const mockToken = "invalid.mocked.token";

        const response = await app.inject({
            method: 'POST',
            url: '/auth/logout', // Use an actual route where middleware is applied
            headers: { Authorization: `Bearer ${mockToken}` }
        });

        // Log response for debugging
        console.log("Response Body:", response.body);

        // Assertions
        expect(response.statusCode).toBe(403);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));

        const responseBody = JSON.parse(response.body);
        expect(responseBody.error).toBe('Invalid or expired token');
    });
});

