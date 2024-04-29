const http = require("http");

async function handleRoute(request, response) {
  const { address } = request.query;

  try {
    let addresses = address;
    if (!Array.isArray(address)) {
      addresses = [address];
    }

    const titlePromises = addresses.map(async (url) => {
      const fullUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `http://${url}`;
      const htmlContent = await fetchHTML(fullUrl);
      return `<li>${new URL(url).hostname} - "${getTitleFromHTML(
        htmlContent
      )}"</li>`;
    });

    const titleListItems = await Promise.all(titlePromises);

    const htmlResponse = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Titles from the  Addresses</title>
            </head>
            <body>
                <ul>${titleListItems.join("")}</ul>
            </body>
            </html>
        `;

    response.set("Content-Type", "text/html");
    response.send(htmlResponse);
  } catch (error) {
    console.error("Error hitting the address:", error.message);
    response.status(500).send("Error hitting the address");
  }
}

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const { hostname, pathname, search } = new URL(url);
    const options = {
      hostname: hostname,
      path: pathname + search,
      method: "GET",
      headers: {
        "User-Agent": "Node.js HTTP Client",
      },
    };
    const request = http.request(options, (response) => {
      let htmlContent = "";
      response.on("data", (chunk) => {
        htmlContent += chunk;
      });
      response.on("end", () => {
        resolve(htmlContent);
      });
    });
    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}

function getTitleFromHTML(htmlContent) {
  const match = /<title>(.*?)<\/title>/i.exec(htmlContent);
  return match ? match[1] : "no title here";
}

module.exports = { handleRoute };
