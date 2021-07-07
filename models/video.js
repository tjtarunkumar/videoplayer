const Joi = require('joi');
const fs = require("fs").promises;

const settings = require("../settings");

async function list() {
  try {
    return await getDbData();
  } catch (error) {
    console.log(error);
  }
}

async function add(bodydata){
  let arr = await getDbData();
  let localdata = {
    "id": bodydata.id,
    "title": bodydata.title,
    "filename": bodydata.filename
  };
  arr.push(localdata);
  let wdata = await fs.writeFile(settings.current_dir + "/db.json", JSON.stringify(arr));
  return arr;
}

async function edit(vid, bodydata){
  const requiredvideoindex = await getVideoIndex(vid);
  let arr = await getDbData();
  let localdata = {
    "id": Number(vid),
    "title": bodydata.title,
    "filename": bodydata.filename
  };
  arr[requiredvideoindex] = localdata;
  await fs.writeFile(settings.current_dir + "/db.json", JSON.stringify(arr));
  return arr;
}

async function del(vid){
  let arr = await getDbData();
  let filtereddata = arr.filter((obj) => obj.id != vid);
  await fs.writeFile(settings.current_dir + "/db.json", JSON.stringify(filtereddata));
  return filtereddata;
}

function validateVideoOnAdd(movie) {
  const schema = Joi.object({
    id: Joi.number().min(0).required(),
    title: Joi.string().min(5).max(50).required(),
    filename: Joi.string().min(5).max(50).required(),
  });
  try {
    return schema.validate(movie);
  } catch (error) {
      console.log(error);
      return;
  }
}

function validateVideoOnEdit(movie) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    filename: Joi.string().min(5).max(50).required(),
  });
  try {
    return schema.validate(movie);
  } catch (error) {
      console.log(error);
      return;
  }
}

async function getVideoIndex(vid){
  //read db.json file
  let data = await fs.readFile(settings.current_dir + "/db.json");
  let arr = JSON.parse(data);

  let videoindex = arr.findIndex(o => Number(o.id) === Number(vid));
  return videoindex;
}

async function getDbData(){
  const data = await fs.readFile(settings.current_dir + "/db.json");
  let arr = JSON.parse(data);
  return arr;
}

exports.add = add;
exports.list = list;
exports.edit = edit;
exports.del = del;
exports.validateonadd = validateVideoOnAdd;
exports.validateonedit = validateVideoOnEdit;
