

import fastify from 'fastify';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import eventRou from './routes/eventroutes.js';
import authRou from './routes/authroutes.js';

dotenv.config();

const app = fastify({
    logger: true
});

//app.decorate('backlisted', []);

global.backlistedTokens = ["abc",];
console.log("the server started successfully");
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        app.log.info('Database connected successfully');
        
    })
    .catch((err) => {
        app.log.error('MongoDB not connected successfully', err);
       
    });

app.register(eventRou, { prefix: '/event' });
app.register(authRou, { prefix: '/auth' });

app.setErrorHandler((error, request, reply) => {
    app.log.error('Error:', error);
    reply.status(500).send({ error: error.message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    app.log.info(`Server listening on ${address}`);
});

console.log(`the server listening on port ${PORT}`);

export default app;
