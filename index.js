const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
const GenshinGachaServices = require("./GenshinGachaServices");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => res.sendStatus(200));

app.post("/get-gacha-logs", async (req, res) => {
  const { key, url } = req.body;
  console.log(key);
  console.log(url);
  let result = await GenshinGachaServices.getData(key, url);
  res.send(result);
});

app.post("/load-data", async (req, res) => {
  const { userKey } = req.body;
  console.log(userKey);
  let result = await GenshinGachaServices.loadUserData(userKey);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
