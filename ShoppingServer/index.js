const express = require('express');
const db = require('./initFirebase');
const { ref, set, get, child, remove } = require("firebase-admin/database");
const app = express();
const crypto = require('crypto');
require('dotenv').config();
var cors = require('cors')

app.use(cors({
    'allowedHeaders': ['Content-Type'], 
    'exposedHeaders': ['Content-Type'], 
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));

// Current requests:
// Post / Login (username, password)
// Post / Signup (username, password, displayname)

function encrypt(message){
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(process.env.securityKey, "hex"), Buffer.from(process.env.ivKey, 'hex'))
    let encrypted = cipher.update(message+process.env.specialKey, "utf-8", "hex")
    encrypted+=cipher.final("hex")
    return encrypted;
}

function decrpyt(message){
    const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(process.env.securityKey, "hex"), Buffer.from(process.env.ivKey, 'hex'))
    let decrypted = decipher.update(message, "hex", "utf-8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

app.use(express.json());
app.use(cors());

async function getData(location){
    let data = (await db.ref(location).once("value")).val();
    return data; 
}

app.post('/getLists', async (req, res)=>{
    const body = req.body;
    var username = body.username.toString();
    var password = body.password.toString();
    var UserData = await valid(username, password);
    if(UserData === false){
        res.send(null);
        return;
    };
    console.log(UserData.JoinedLists);
    res.send(UserData.JoinedLists || {});
})

async function valid(username, password){
    var UserData = await getData("/Users/" + encrypt(username)).catch((error)=>{
        return false;
    })
    if(UserData.Password != encrypt(password)){
        return false;
    }
    return UserData;
}

// Can return 500 (Server Error), 404 (Not Found), 401 (Unauthorized), data
app.post('/login', async (req, res)=>{
    const body = req.body;
    if(body.password == null || body.username == null){
        res.sendStatus(401);
        return;
    }
    var UserData = await getData("/Users/" + encrypt(body.username.toString())).catch((error)=>{
        res.sendStatus(500);
        return;
    })
    if(UserData.Password != encrypt(body.password.toString())){
        res.sendStatus(401);
        return;
    }
    if(UserData == null || UserData == undefined){
        res.sendStatus(404);
        return;
    }
    res.send(UserData);
})

async function createData(location, data){
    await db.ref(location).set(data).catch((error) => {
        return 500;
    });
    return 201;
}

// Can return 401 (Unauthorized), 406 (Not Acceptable), 409 (Conflict), Email (Email Conflict), result
app.post('/signup', async (req, res)=>{
    const body = req.body;
    if(body.password == null || body.username == null){
        res.sendStatus(401);
        return;
    }
    if(body.password.length < 8 || body.username.length < 6 || body.password.length > 60 || body.username.length > 60){
        res.sendStatus(406);
        return;
    }
    if(await getData("/Users/" + encrypt(body.username)) != null){
        res.sendStatus(409);
        return;
    }
    let emailEqual = await db.ref("/Users/").orderByChild("Email").equalTo(body.email).limitToLast(1).once("value");
    console.log(await emailEqual);
    let result = await createData("/Users/" + encrypt(body.username), {DataCreated: new Date().toJSON().slice(0, 10), DisplayName: body.display, Password: encrypt(body.password), Email: body.email});
    res.sendStatus(result);
})

app.get("/", (req, res)=>{
    res.send("0.1.0");
})

app.listen(5000, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ 5000)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;