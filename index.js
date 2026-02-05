let express = require("express");
let multer = require("multer");
let { MongoClient, ObjectId } = require("mongodb");
let path = require("path");
let fs = require("fs");
let cors = require("cors");
// const { promises } = require("dns");

let cloudinary = require("cloudinary").v2;
let{CloudinaryStorage}=require("multer-storage-cloudinary");
cloudinary.config({ cloud_name:"ddvkxhatp",
api_key:"239824888971874",
api_secret:"k9-yqxmdotcMLMcraI2OwfusG80"

});


const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

const url = "mongodb://0.0.0.0:27017";

// let storage = multer.diskStorage(
//     {
//         destination:(req,file,cb)=>cb(null,"uploads/"),
//         filename:(req,file,cb)=>cb(null,Date.now()+ path.extname(file.originalname)),
//     }
// );
let storage= new CloudinaryStorage({cloudinary});
let dalal = multer({storage});

app.post("/upload",dalal.single("file"),(req,res)=>
{
    let client = new MongoClient(url);
    let db = client.db("insta");
    let collection= db.collection("photos");
    let obj = {
        username: req.body.username,
        caption: req.body.caption,
        file_url:req.file.path,
        file_name: req.file.filename,
        upload_time: new Date()
    }
    collection.insertOne(obj)
    .then((result)=>{res.send(result)})
    .catch((err)=>{res.send(err)})

});

app.get("/files", (req, res) => {
  let client = new MongoClient(url);
  let username = req.query.username;
  let obj = username?{username}:{};
      let db = client.db("insta");
      let collec= db.collection("photos");
      collec.find(obj).toArray()
    .then((result) => res.json(result))
    .catch((err) => {
      res.send(err);
    })
});

app.delete("/delete/:id",(req,res)=>{
  let client= new MongoClient(url);
  let db = client.db("insta");
  let collec= db.collection("photos");
  let id= req.params.id;
  let _id= new ObjectId(id);
  collec.findOne({_id})
  .then((obj)=>{
    // fs.promises.unlink(`uploads/${obj.file_name}`);
    cloudinary.uploader.destroy(obj.file_name);
    return collec.deleteOne({_id})
  })
  .then((result)=>res.send(result))
  .catch((err)=>res.send(err));

});

app.listen(3000, () => {
  console.log("running on http://localhost:3000");
});