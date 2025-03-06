let sessionId;

const loadingDiv = document.getElementById("loading");
const mainDiv = document.getElementById("main");
const adminPasswordDiv = document.getElementById("adminPassword");

(async () => {
    try {
        await pingServer();
    } catch (err) {
        document.writeln("<h1>500 Failed to reach server</h1>");
        console.error(err);
        return;
    }
    loadingDiv.style.display = "none";

    await startMain();
})(); 

async function startMain() {
    const urlParams = new URLSearchParams(window.location.search);
    sessionId = urlParams.get("id");

    if (sessionId == "admin") {
        await admin();
        return;
    }
    
    const response = await sendData({sessionId: sessionId}, "sessionCheck");
    if (response.active) {
        
    } else {
        document.writeln('<h1>Invalid session ID. please enter new:</h1><input type="text" id="input"><button type="button" onclick="window.open(window.location.pathname + `?id=` + document.getElementById(`input`).value, `_self`)">Submit</button>')
        return;
    }
}

async function admin() {
    adminPasswordDiv.style.display = "flex";
    await waitUntil(() => (sessionId != "admin"));

    setInterval(() => sendData({sessionId: sessionId}, "sessionPing"), 10000);
    loadingDiv.style.display = "none";
}

async function checkPassword(password, newSessionId) {
    adminPasswordDiv.style.display = "none";
    loadingDiv.style.display = "flex";

    let response;

    await hashSHA512(password).then(async result => {
        response = await sendData({ hashedPassword: result, sessionId: newSessionId }, "adminLogin");
    });

    if (response.correct) {
        sessionId = newSessionId;
        
    } else {
        loadingDiv.style.display = "none";
        adminPasswordDiv.style.display = "flex";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(img => {
        img.ondragstart = () => false;
    });
});