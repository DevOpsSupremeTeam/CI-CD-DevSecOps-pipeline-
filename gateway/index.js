const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/customer", proxy("http://customer-service"));
app.use("/shopping", proxy("http://shopping-service"));
app.use("/", proxy("http://products-service")); // products

app.listen(8000, () => {
  console.log("Gateway is Listening to Port 8000");
});
