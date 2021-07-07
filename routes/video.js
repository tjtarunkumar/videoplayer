const express = require('express');
const fs = require("fs");
const settings = require("../settings");
const { validateonadd, validateonedit, list, add, edit, del} = require("../models/video");
const router = express.Router();

router.get("/list", async function(req, res){
  const datalist = await list();
  res.send(datalist);
});

router.post("/add", async function(req, res){
  const { error } = validateonadd(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const datalist = await add(req.body);
  res.send(datalist);  
});

router.put("/:vid/edit", async function(req, res){
  const vid = req.params.vid;
  const { error } = validateonedit(req.body); 
  
  if (error) return res.status(400).send(error.details[0].message);
  
  if(!vid){
    res.status(401).send("Requires Video ID");
  }

  const datalist = await edit(vid, req.body);
  res.send(datalist);
});

router.delete("/:vid/del", async function(req, res){
  const vid = req.params.vid;

  if(!vid){
    res.status(401).send("Requires Video ID");
  }

  const datalist = await del(vid);
  res.send(datalist);
});

router.get("/:vid/play", async function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    const vid = req.params.vid;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    if(!vid){
      res.status(401).send("Requires Video ID");
    }
    
    //read db.json file
    let data = fs.readFileSync(settings.current_dir + "/db.json");
    let arr = JSON.parse(data);

    let vidname = arr.find(o => o.id === Number(vid));
    
    // get video stats 
    const videoPath = settings.current_dir + `/uploads/${vidname.filename}.mp4`;
    const videoSize = fs.statSync(videoPath).size;
    
    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 5; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);

  });

  module.exports = router;