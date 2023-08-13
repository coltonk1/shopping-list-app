
async function login(username, password){
    var data = {
        username: username,
        password: password
    }
    return await fetch("http://localhost:3000/login", {
        method: 'POST',
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

async function signup(username, password, display){
    var data = {
        username: username,
        password: password,
        display: display
    }
    return await fetch("http://localhost:3000/signup", {
        method: 'POST',
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}


async function start(){
    var result = await signup("duck681", "Colt1295!", "Colton Karaffa");
    console.log(await result.text());
}

start();