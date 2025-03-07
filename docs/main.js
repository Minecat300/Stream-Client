let sessionId;
let page = "setup";
let forceQuestionEnd = false;

const loadingDiv = document.getElementById("loading");
const mainDiv = document.getElementById("main");
const adminPasswordDiv = document.getElementById("adminPassword");
const adminMainDiv = document.getElementById("adminMain");
const questionFeedback = document.getElementById("questionFeedback");
const mainBody = document.getElementById("mainBody");

(async () => {
    try {
        await pingServer();
    } catch (err) {
        mainBody.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh;"><h1>500 Failed to reach server</h1></div>'
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
        mainBody.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;"><h1>Invalid session ID. please enter new:</h1><div style="flex-direction: row;"><input type="text" id="input"><button type="button" onclick="window.open(window.location.pathname + '?id=' + document.getElementById('input').value, '_self')">Submit</button></div></div>`
        return;
    }
    document.getElementById(page).style.display = "flex";
    setInterval(updatePage, 1000);
}

async function updatePage() {
    const prevPage = page;
    const response = await sendData({sessionId: sessionId}, "pagePing");
    page = response.page;
    if (page == "questionEnd") {
        forceQuestionEnd = false;
    }
    if (forceQuestionEnd) {
        document.getElementById("questionInput").value = "";
        page = "questionEnd";
    }
    if (page != prevPage) {
        document.getElementById(prevPage).style.display = "none";
        document.getElementById(page).style.display = "flex";
        if (page == "setup") {

        }
        if (page == "questionStart") {
            while (page == "questionStart") {
                await sleep(50);
                const awnser = document.getElementById("questionInput").value;
                if (awnser == "") {
                    questionFeedback.innerHTML = "Input can not be empty";
                    continue;
                }
                if (awnser.length > 30) {
                    questionFeedback.innerHTML = "Input can not be more then 30 characters";
                    continue;
                }
                questionFeedback.innerHTML = "";
            }
        }
        if (page == "questionEnd") {

        }
    }
}

async function checkAndSubmit(awnser) {
    if (awnser == "") {
        return;
    }
    if (awnser.length > 30) {
        return;
    }
    await sendData({ sessionId: sessionId, data: awnser }, "submit");
    forceQuestionEnd = true;
    document.getElementById(page).style.display = "none";
    document.getElementById("questionEnd").style.display = "flex";
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
        const randList = getRandomAnswer(respone.response);
        console.log(randList);
        const list = document.getElementById("dynamicList");
        list.innerHTML = "";

        randList.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
    }
    if (num == 5) {
        await sendData({ request: "resetQuestionData", sessionId: sessionId }, "action");
        const list = document.getElementById("dynamicList");
        list.innerHTML = "";
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

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(img => {
        img.ondragstart = () => false;
    });
});