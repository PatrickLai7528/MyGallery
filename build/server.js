"use strict";
// let express = require("express");
// let UserService = require("./service/UserService.js");
// let ImageService = require("./service/ImageService.js");
// let app = express();
// let bodyParser = require('body-parser');
// let redisStore = require('connect-redis')(session);
Object.defineProperty(exports, "__esModule", { value: true });
let Express = require("express");
// Import WelcomeController from controllers entry point
const router_1 = require("./router");
// Create a new express application instance
const app = Express();
// The port the express app will listen on
const port = process.env.PORT || "3000";
app.use('/', router_1.default);
// Serve the application at the given port
app.listen(port, () => {
    // Success callback
    console.log(`Listening at http://localhost:${port}/`);
});
