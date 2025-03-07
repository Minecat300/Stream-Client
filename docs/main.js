let sessionId;
let page = "setup";

const loadingDiv = document.getElementById("loading");
const mainDiv = document.getElementById("main");
const adminPasswordDiv = document.getElementById("adminPassword");
const adminMainDiv = document.getElementById("adminMain");

(async () => {
    try {
        await pingServer();
    } catch (err) {
        document.writeln(`<h1 style="font-family:'Comic Sans MS'">500 Failed to reach server</h1>`);
        console.error(err);
        return;
    }

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
        loadingDiv.style.display = "none";
    } else {
        document.writeln(`<h1 style="font-family:'Comic Sans MS'">Invalid session ID. please enter new:</h1><input style="font-family:'Comic Sans MS'" type="text" id="input"><button style="font-family:'Comic Sans MS'" type="button" onclick="window.open(window.location.pathname + '?id=' + document.getElementById('input').value, '_self')">Submit</button>`)
        return;
    }
    document.getElementById(page).style.display = "flex";
    setInterval(updatePage, 1000);
}

async function updatePage() {
    const prevPage = page;
    const response = await sendData({sessionId: sessionId}, "pagePing");
    page = response.page;
    if (page != prevPage) {
        document.getElementById(prevPage).style.display = "none";
        document.getElementById(page).style.display = "flex";
        if (page == "setup") {

        }
        if (page == "questionStart") {

        }
        if (page == "questionEnd") {

        }
    }
}

async function admin() {
    loadingDiv.style.display = "none";
    adminPasswordDiv.style.display = "flex";
    await waitUntil(() => (sessionId != "admin"));

    setInterval(() => sendData({sessionId: sessionId}, "sessionPing"), 10000);
    loadingDiv.style.display = "none";
    adminMainDiv.style.display = "flex";

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

async function doButton(num) {
    if (num == 1) {
        await sendData({ page: "setup", sessionId: sessionId }, "page");
    }
    if (num == 2) {
        await sendData({ page: "questionStart", sessionId: sessionId }, "page");
    }
    if (num == 3) {
        await sendData({ page: "questionEnd", sessionId: sessionId }, "page");
    }
    if (num == 4) {
        const respone = await sendData({ request: "getQuestionData", sessionId: sessionId }, "action");
        console.log(getRandomAnswer(respone.awnsers));
    }
    if (num == 5) {
        await sendData({ request: "resetQuestionData", sessionId: sessionId }, "action");
    }
}

function randomNumber(min, max) {
    return Math.min(Math.floor(Math.random()*(max-min+1))+min, max);
}

function getRandomAnswer(data) {
    let frequencyMap = new Map();
    data.forEach(item => {
        frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
    });

    let uniqueItems = [...frequencyMap.keys()].sort((a, b) => frequencyMap.get(b) - frequencyMap.get(a));

    for (let i = 0; i < uniqueItems.length; i++) {
        const randomIndex = randomNumber(i, uniqueItems.length - 1);
        [uniqueItems[i], uniqueItems[randomIndex]] = [uniqueItems[randomIndex], uniqueItems[i]];
    }

    return uniqueItems;
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(img => {
        img.ondragstart = () => false;
    });
});