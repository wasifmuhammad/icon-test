const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === "/I/want/title/" && parsedUrl.query.address) {
    const addresses = Array.isArray(parsedUrl.query.address)
      ? parsedUrl.query.address
      : [parsedUrl.query.address];

    const fetchTitle = (address) => {
      return new Promise((resolve, reject) => {
        address = address.replace(/^https?:\/\//, "");
        http
          .get(`http://${address}`, (response) => {
            let body = "";

            response.on("data", (c) => {
              body += c;
            });

            response.on("end", () => {
              const title = body.match(/<title>(.*?)<\/title>/i);
              resolve({
                address: address,
                title: title ? title[1] : "response not available",
              });
            });
          })
          .on("error", (e) => {
            resolve({
              address: address,
              title: "response not available",
            });
          });
      });
    };

    Promise.all(addresses.map(fetchTitle))
      .then((results) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<html><head></head><body>");
        res.write("<h1>Following are the titles of given websites:</h1>");
        res.write("<ul>");
        results.forEach((item) => {
          res.write(`<li>${item.address} - "${item.title}"</li>`);
        });
        res.write("</ul></body></html>");
        res.end();
      })
      .catch((error) => {
        console.error("Error fetching titles:", error);
        res.writeHead(500);
        res.write("<h1>Internal Server Error</h1>");
        res.end();
      });
  } else {
    res.writeHead(404);
    res.write("<h1>Page not found. Please enter a valid URL.</h1>");
    res.end();
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
