const express = require("express");
const video = require("./routes/video");
const app = express();

app.use(express.json());
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
//app.use('/api/auth', auth);
app.use('/api/video', video);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));