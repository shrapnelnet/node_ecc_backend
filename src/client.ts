import { ec } from "elliptic";
const ellipticCurve: ec = new ec("curve25519");

function clearFields() {
    document.getElementById("signuporin")!.innerHTML = "";
    document.getElementById("messages")!.innerHTML = "";
}

// @ts-ignore
function generateECDHPublicKey() {
    let keyPair = ellipticCurve.genKeyPair();
    console.log(keyPair.getPublic());
    return keyPair.getPublic();
}

function displaySignUp() {
    clearFields();
    let form = document.createElement("form");
    form.action = "/api/signup";
    form.method = "post";
    form.enctype = "application/x-www-form-urlencoded"
    let input = document.createElement("input");
    input.name = "username";
    input.placeholder = "Username";
    input.autocomplete = "off";
    let passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.placeholder = "Password";
    passwordInput.type = "password";
    passwordInput.autocomplete = "off";
    let submit = document.createElement("input");
    submit.id = "signUpSubmit";
    submit.value = "Sign Up";
    submit.type = "submit"
    form.appendChild(input);
    form.appendChild(passwordInput);
    form.appendChild(submit);
    document.getElementById("signuporin")?.appendChild(form);
}

function displayLogIn() {
    clearFields();
    let form = document.createElement("form");
    form.action = "/api/login";
    form.method = "post";
    form.enctype = "application/x-www-form-urlencoded"
    let input = document.createElement("input");
    input.name = "username";
    input.placeholder = "Username";
    let passwordInput = document.createElement("input");
    passwordInput.name = "password";
    passwordInput.placeholder = "Password";
    passwordInput.type = "password";
    let submit = document.createElement("input");
    submit.id = "LogInSubmit";
    submit.value = "Log In";
    submit.type = "submit"
    form.appendChild(input);
    form.appendChild(passwordInput);
    form.appendChild(submit);
    document.getElementById("signuporin")?.appendChild(form);
}

function displaysendRequest() {
    clearFields();
    let form = document.createElement("form");
    form.method = "post";
    form.action = "/api/friendRequest";
    form.enctype = "application/x-www-form-urlencoded";
    document.getElementById("signuporin")!.innerHTML = "";
    let addUser = document.createElement("input");
    addUser.placeholder = "Friend's username"
    addUser.name = "username"
    addUser.autocomplete = "off";
    let submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Add"
    let div = document.createElement("div");
    div.style.display = "flex";
    div.appendChild(addUser);
    div.appendChild(submitButton);
    form.appendChild(div);
    document.getElementById("messages")?.appendChild(form);
}

// @ts-ignore
function doMessageUser(target) {
    const username = target.target.id
    console.log(username);
}

function displayFriends() {
    clearFields();
    fetch("/api/getFriends")
        .then((res) => res.json())
        .then((res) => {
            const body: string[] = res;
            body.forEach((node: string) => {
                let div = document.createElement("div");
                div.style.display = "flex";
                div.style.alignItems = "center"
                let newFriend = document.createElement("p");
                newFriend.innerHTML = node;
                let message = document.createElement("input");
                message.type = "button";
                message.value = "Message";
                message.style.marginLeft = "10px";
                message.id = node;
                div.appendChild(newFriend);
                div.appendChild(message);
                document.getElementById("messages")?.appendChild(div);
                document.getElementById(node)?.addEventListener("click", doMessageUser)
            })
        })
        .catch((err) => {
            console.error(err);
        })
}


// document.getElementById("test")?.addEventListener("click", generateECDHPublicKey);
document.getElementById("signup")?.addEventListener("click", displaySignUp);
document.getElementById("signin")?.addEventListener("click", displayLogIn);


fetch("/api/isLoggedIn")
    .then((res) => res.json())
    .then((res) => {
        if (res.isLoggedIn) {
            let username = document.createElement("p");
            username.innerHTML = `welcome to shr4pnel-IM, ${res.username}`;
            document.getElementById("subtitle")?.appendChild(username);
            let logOut = document.createElement("a");
            logOut.innerHTML = "log out";
            logOut.href = "/api/logout";
            let sendRequest = document.createElement("button");
            sendRequest.innerHTML = "add a friend"
            sendRequest.id = "sendRequest";
            let sendMessage = document.createElement("button");
            sendMessage.innerHTML = "send a message";
            sendMessage.id = "sendmessage"
            document.getElementById("buttongroup")?.appendChild(sendMessage);
            document.getElementById("buttongroup")?.appendChild(sendRequest);
            document.getElementById("buttongroup")?.appendChild(logOut);
            document.getElementById("sendRequest")?.addEventListener("click", displaysendRequest);
            document.getElementById("sendmessage")?.addEventListener("click", displayFriends);
            let queryStringMessage = new URLSearchParams(window.location.search);
            let subtitle = document.createElement("p");
            subtitle.style.color = "green";
            subtitle.innerHTML = queryStringMessage.get("message") ?? "";
            document.getElementById("subtitle")?.appendChild(subtitle);
        }
    })
