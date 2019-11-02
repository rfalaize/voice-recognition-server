console.log("Loading MONGODB config...");

let dbCreds = {};
if (process.env.MONGODB_URL) {
    console.log(">>> use environment variables config.");
    dbCreds = {
        url: process.env.MONGODB_URL,
        mongoUser: process.env.MONGODB_USER,
        mongoPassword: process.env.MONGODB_PWD
    };
} else {
    console.log(">>> use local files config.");
    dbCreds = require("./mongo.credentials.json");
}

module.exports = dbCreds;
