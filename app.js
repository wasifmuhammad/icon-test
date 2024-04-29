const express = require("express");
const { handleRoute } = require("./routes");

const app = express();

app.get("/I/want/title/", handleRoute);

app.use((request, response) => {
  response.status(404).send("Not Found");
});

app.listen(3000, () => {
  console.log(`Server is listening on port:`, 3000);
});
