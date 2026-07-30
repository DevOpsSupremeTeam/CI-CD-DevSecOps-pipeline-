const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { products, appEvents } = require("./api");

const { CreateChannel } = require("./utils");

module.exports = async (app) => {
  app.use(express.json());
  app.use(cors());
  app.use(express.static(__dirname + "/public"));

  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.get("/ready", (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({ db: dbReady ? "up" : "down" });
  });

  const channel = await CreateChannel();
  products(app, channel);
};
