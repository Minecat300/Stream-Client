const server = "https://flameys.ddns.net:8080";

async function pingServer() {
    await sendData({data: ""}, "ping");
}

async function sendData(data, subUrl) {
    const response = await fetch(`${server}/${subUrl}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    result.status = response.status;
    console.log(result);
    return result;
}

const waitUntil = (conditionFn, interval = 100) => {
    return new Promise((resolve) => {
        const checkCondition = () => {
            if (conditionFn()) {
                resolve();
            } else {
                setTimeout(checkCondition, interval);
            }
        };
        checkCondition();
    });
};

async function hashSHA512(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    return Array.from(new Uint8Array(hashBuffer))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
}