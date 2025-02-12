import fastify from 'fastify';
import jwt from 'jsonwebtoken';

const app = fastify({
    logger: true
});

import Logs from '../models/Logs.js';


export default async (request, reply) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Extract the token from the authorization header

    if (!token) {
        return reply.status(401).send({ error: 'Token not found' });
    }

    console.log(token);


    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.SEC);
        const userId = decoded.id;

        // Check if the user has an active session in the Logs model
        const userLogs = await Logs.findOne({ UserId: userId });

        console.log(userLogs);

        // If no logs are found or if the UserToken is null, it means the user is logged out
        if (!userLogs || userLogs.UserToken === null) {
            return reply.status(403).send({ error: 'User is logged out, access denied' });
        }

        // Attach the user info to the request object for further use in route handlers

        console.log("HAIHAIHAIHAHAIHAIHAIHAIHAIHAIHAIHAIHAIHAIHAI")
        request.user = decoded;
        

        // Continue with the request processing

    } catch (err) {
       // console.error('Token verification failed:', err);
        return reply.status(403).send({ error: 'Invalid or expired token' });
    }
};
