const express = require('express');
const db = require('./initFirebase');
const { ref, set, get, child, remove } = require("firebase-admin/database");
const app = express();
const crypto = require('crypto');
require('dotenv').config();

function encrypt(message){
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(process.env.securityKey, "hex"), Buffer.from(process.env.ivKey, 'hex'))
    let encrypted = cipher.update(message+process.env.specialKey, "utf-8", "hex")
    encrypted+=cipher.final("hex")
    return encrypted;
}

function decrpyt(message){
    const cipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(process.env.securityKey, "hex"), Buffer.from(process.env.ivKey, 'hex'))
    let decrypted = decipher.update(message, "hex", "utf-8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

app.use(express.json());

async function getData(location){
    let data = (await db.ref(location).once("value")).val();
    return data; 
}

app.post('/login', async (req, res)=>{
    const body = req.body;
    if(body.password == null || body.username == null){
        res.sendStatus(401);
        return;
    }
    var UserData = await getData("/Users/" + encrypt(body.username.toString())).catch((error)=>{
        return 500;
    })
    if(UserData == null){
        res.sendStatus(404);
        return;
    }
    if(UserData.password != encrypt(body.password.toString())){
        res.sendStatus(401);
        return;
    }
    console.log(UserData);
    res.send(UserData);
})

async function createData(location, data){
    await db.ref(location).set(data).catch((error) => {
        return 500;
    });
    return 201;
}

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
    let result = await createData("/Users/" + encrypt(body.username), {DataCreated: new Date().toJSON().slice(0, 10), DisplayName: body.display, Password: encrypt(body.password)});
    res.sendStatus(result);
})

app.get("/", (req, res)=>{
    res.send("Express with Vercel");
})

app.listen(5000, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ 5000)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;