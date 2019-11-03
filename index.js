const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const env = require("dotenv").config();

// create express app
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// **************************************************
// configuring the database
// **************************************************
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
// load models
const HealthCheck = require("./model/healthCheck.js");
const VoiceSample = require("./model/voiceSample.js");

console.log("Connecting to mongodb...");
const uri =
    "mongodb+srv://" +
    process.env.MONGODB_USER +
    ":" +
    process.env.MONGODB_PWD +
    "@" +
    process.env.MONGODB_URL +
    "/voice-app?retryWrites=true&w=majority";

mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true
    })
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch(err => {
        console.error("Could not connect to the database. Exiting now...", err);
        process.exit();
    });

// **************************************************
// routes
// **************************************************
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the voice app API"
    });
});

app.get("/health-check", (req, res) => {
    if (!validateAdminRequest(req)) {
        res.sendStatus(403);
        return;
    }
    console.log("Get health check...");
    // query
    HealthCheck.find({})
        .limit(10)
        .exec(function(mongoError, mongoResponse) {
            if (mongoError) {
                console.error("An error occurred during query:", mongoError);
                res.json({
                    success: false,
                    errorMessage: mongoError
                });
                return;
            }
            // success
            console.log("Query response:", mongoResponse);
            res.json({
                success: true,
                results: mongoResponse
            });
        });
});

app.get("/voice-samples", (req, res) => {
    if (!validateAdminRequest(req)) {
        res.sendStatus(403);
        return;
    }
    console.log("Fetching samples...");
    // query
    VoiceSample.find({})
        .limit(10)
        .exec(function(mongoError, mongoResponse) {
            if (mongoError) {
                const message = "An error occurred during query: " + mongoError.message;
                console.error(mongoError);
                res.json({
                    success: false,
                    message: mongoError
                });
            }
            // success
            console.log("query response:", mongoResponse);
            res.json({
                success: true,
                results: mongoResponse
            });
        });
});

app.post("/voice-sample/save", (req, res) => {
    if (!validateUserRequest(req)) {
        res.sendStatus(403);
        return;
    }
    const sample = new VoiceSample(req.body);
    sample.save(function(mongoError) {
        if (mongoError) {
            console.log("An error occured while saving sample:", mongoError);
            res.json({ status: false, errorMessage: mongoError.message });
        }
        console.log("Success! document saved:", sample._id);
        res.json({ status: true, id: sample._id });
    });
});

app.delete("/voice-sample/delete/:id", (req, res) => {
    if (!validateUserRequest(req)) {
        res.sendStatus(403);
        return;
    }
    VoiceSample.findByIdAndRemove(req.params.id, function(mongoError) {
        if (mongoError) handleError(mongoError, res);
        const message = "Document " + req.params.id + " deleted successfully.";
        console.log(message);
        res.json({ success: true, message: message });
    });
});

function handleError(err, res) {
    const message = "An error occurred: " + err.message;
    console.error(message);
    res.json({
        success: false,
        errorMessage: error
    });
}

// **************************************************
// validate routes
// **************************************************
function validateAdminRequest(req) {
    if (req.headers["node_api_secret"] === process.env.NODE_API_SECRET_ADMIN) return true;
    return false;
}

function validateUserRequest(req) {
    if (req.headers["node_api_secret"] === process.env.NODE_API_SECRET_ADMIN) return true;
    if (req.headers["node_api_secret"] === process.env.NODE_API_SECRET_USER) return true;
    return false;
}

// **************************************************
// listen for requests
// **************************************************
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log("******************************************");
    console.log("Server is listening on port", PORT, ". Press CTRL+C to return...");
    console.log("******************************************");
});
