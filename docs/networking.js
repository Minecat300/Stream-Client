const server = "http://flameys.ddns.net:8080";

async function sendData(data) {
    const userData = data;

    const response = await fetch(`${server}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: userData })
    });

    const result = await response.json();
    console.log(result);
}