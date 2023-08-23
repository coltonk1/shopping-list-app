const express = require('express');
const db = require('./initFirebase');
const { ref, set, get, child, remove } = require("firebase-admin/database");
const app = express();
const crypto = require('crypto');
require('dotenv').config();
var cors = require('cors');
const rateLimit = require('express-rate-limit');

app.use(cors({
    allowedHeaders: ['Content-Type'], 
    exposedHeaders: ['Content-Type'], 
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false
}));

// const limiter = rateLimit({
// 	windowMs: 5 * 60 * 1000, // 15 minutes
// 	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// 	// store: ... , // Use an external store for more precise rate limiting
// })

// app.use(limiter);

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

async function valid(username, password){
    var UserData = await getData("/Users/" + encrypt(username)).catch((error)=>{
        return false;
    })
    if(UserData.Password !== encrypt(password)){
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
    if(UserData == null || UserData == undefined){
        res.sendStatus(404);
        return;
    }
    if(UserData.Password != encrypt(body.password.toString())){
        res.sendStatus(401);
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

app.post('/getItems', async (req, res)=>{
    const body = req.body;
    if (body && body.username && body.password && body.listUsername) {
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
    } else {
        console.error("Required properties not found")
        return;
    }
    var UserData = await valid(username, password);
    if(UserData === false){
        res.send(null);
        return;
    };
    var result = await getData("/Lists/"+listUsername+"/Items/")
    res.send(result || []);
})

app.post('/getLists', async (req, res)=>{
    const body = req.body;
    var username = body.username.toString();
    var password = body.password.toString();
    var UserData = await valid(username, password);
    if(UserData === false){
        res.send(null);
        return;
    };
    res.send(UserData.JoinedLists || []);
})

app.post('/createList', async (req,res)=>{
    const body = req.body;
    if (body && body.username && body.password && body.display && body.listusername && body.listpassword) {
        var username = body.username.toString();
        var password = body.password.toString();
        var display = body.display.toString();
        var listUser = body.listusername.toString();
        var listPass = body.listpassword.toString();
    } else {
        // Handle the case where the expected properties are missing from the body object
        console.error("Required properties are missing from the request body");
        return;
    }
    var UserData = await valid(username, password);
    if(UserData === false){
        res.send(null);
        return;
    }
    var object = {}
    object[encrypt(username)] = UserData.DisplayName;
    await createData("/Users/" + encrypt(username) + "/JoinedLists/" + encrypt(listUser), display);
    await createData("/Lists/" + encrypt(listUser), {DateCreated: new Date().toJSON().slice(0, 10), DisplayName: display, JoinedUsers: object, Password: encrypt(listPass)});
    res.send(encrypt(listUser));
})

app.post('/removeItem', async(req, res)=>{
    const body = req.body;
    if(body && body.username && body.password && body.listUsername && body.itemName){
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
        var itemName = body.itemName.toString();
    }
    else{
        console.error("Required properties missing.");
        return;
    }

    await db.ref("/Lists/"+listUsername+"/Items/"+itemName).remove();
    res.send("200")
})

app.post("/removeListFromAccount", async(req,res)=>{
    const body = req.body;
    if(body && body.username && body.password && body.listUsername){
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
    } else {
        console.error("Properties missing");
        return;
    }

    await db.ref("/Lists/" + listUsername + "/JoinedUsers/" + encrypt(username)).remove();
    await db.ref("/Users/" + encrypt(username) + "/JoinedLists/" + listUsername).remove();

    res.send("200");
})

app.post("/joinList", async(req,res)=>{
    const body = req.body;
    if(body && body.username && body.password && body.listUsername, body.listPassword){
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
        var listPassword = body.listPassword.toString();
    } else {
        console.error("Properties missing");
        return;
    }

    var UserData = await getData("/Users/"+encrypt(username));
    var ListData = await getData("/Lists/"+encrypt(listUsername));

    await createData("/Lists/"+encrypt(listUsername)+"/JoinedUsers/"+encrypt(username), UserData.DisplayName);
    await createData("/Users/"+encrypt(username)+"/JoinedLists/"+encrypt(listUsername), ListData.DisplayName);

    res.send(encrypt(listUsername));
})

app.post("/listInfo", async(req,res)=>{
    const body = req.body;
    if(body && body.username && body.password && body.listUsername){
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
    } else {
        console.error("Properties missing");
        return;
    }

    var listPassword = await getData("/Lists/"+listUsername+"/Password");
    var returnUsername = decrpyt(listUsername);
    var returnPassword = decrpyt(listPassword);

    res.send({username: returnUsername.slice(0, returnUsername.length-16), password: returnPassword.slice(0, returnPassword.length-16)});
})

app.post('/addItem', async(req,res)=>{
    const body = req.body;
    if (body && body.username && body.listUsername && body.password && body.itemName) {
        var username = body.username.toString();
        var password = body.password.toString();
        var listUsername = body.listUsername.toString();
        var itemName = body.itemName.toString();
    } else {
        // Handle the case where the expected properties are missing from the body object
        console.error("Required properties are missing from the request body");
        return;
    }
    var description = ""
    var amount = "-";
    if(body.amount){
        amount = body.amount.toString();
    }
    if(body.description) description = body.description.toString();
    if(amount === "" || amount === null) amount = "-";
    var UserData = await valid(username, password);
    if(UserData === false){
        res.send(null);
        return;
    };
    if(UserData.JoinedLists[listUsername] !== null && UserData.JoinedLists[listUsername] !== undefined)
        await createData("/Lists/"+listUsername+"/Items/"+itemName, {DateCreated: new Date().toJSON().slice(0, 10), CreatedBy: UserData.DisplayName, CreatedByUsername: encrypt(username), Description: description, Amount: amount})
    else
        console.error("Somebody is not in the list but attempted to add an item?");
    res.send("200");
})

app.get("/", (req, res)=>{
    res.send("0.6.2");
})

app.listen(5000, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ 5000)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;