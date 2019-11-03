const mongoose = require("mongoose");
const collectionName = "voice-samples";
// note: ** Mongoose automatically looks for the plural, lowercased version of the collection name. **
module.exports = mongoose.model(
    collectionName,
    new mongoose.Schema({ userName: String, userEmailAddress: String, question: String, frequenciesData: [], timeDomainData: [] })
);
