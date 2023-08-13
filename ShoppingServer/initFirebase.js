var admin = require("firebase-admin");
require('dotenv').config()

// var serviceAccount = require(process.env.serviceKey);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.databaseURL,
});

const db = admin.database();
module.exports = db;

console.log("Database Gathered")