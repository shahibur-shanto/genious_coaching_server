const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.static('courses'))
app.use(fileUpload())

app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxopl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db(`${process.env.DB_NAME}`).collection("Courses");
  const bookCollection = client.db(`${process.env.DB_NAME}`).collection("booking");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
  

  app.post('/addService',(req,res)=>{
    // const newEvent = req.body;
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    console.log(title,description,price,file)

    const filePath = `${__dirname}/courses/${file.name}`

    file.mv(filePath,err=>{
        if(err){
            console.log(err)
            return res.status(500).send({msg:'failed to upload'})
        }
        const newImg = fs.readFileSync(filePath)
        const encImg = newImg.toString('base64');

    let image = {
        contentType:req.files.file.mimetype,
        size:req.files.file.size,
        img:Buffer(encImg,'base64')
}

    collection.insertOne({title,description,price,image})
    .then(result=>{
        fs.remove(filePath)
        console.log('inserted count',result.insertedCount)
        res.send(result)
    })
    })
})

app.post('/booking',(req,res)=>{
  const newEvent = req.body;
  bookCollection.insertOne(newEvent)
  .then(result=>{
      console.log('inserted count',result.insertedCount)
      res.send(result)
  })
})
app.post('/addAdmin',(req,res)=>{
  const newEvent = req.body;
  adminCollection.insertOne(newEvent)
  .then(result=>{
      console.log('inserted count',result.insertedCount)
      res.send(result)
  })
})

app.post('/isAdmin',(req,res)=>{
  const email = req.body.email;
  adminCollection.find({admin:email})
  .toArray((err,admin)=>{
    console.log(admin.length)
    res.send(admin.length>0);
  })
})

app.post('/reviews',(req,res)=>{
  const newEvent = req.body;
  reviewCollection.insertOne(newEvent)
  .then(result=>{
      console.log('inserted count',result.insertedCount)
      res.send(result)
  })
})

app.get('/bookingList',(req,res)=>{
    
  bookCollection.find({email:req.query.email})
  .toArray((err,documents)=>{
    res.send(documents);
  })
})

app.get('/bookings/:title',(req,res)=>{
    collection.find({title:req.params.title})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  
  app.patch('/update/:id', (req, res) => {
    bookCollection.updateOne({_id:ObjectId(req.params.id)},
    {
      $set:{status:req.body.status}
    }
    )
    .then(result=>{
      console.log(result)
      res.send(result)
  })
  })
  app.get('/reviews',(req,res)=>{
    reviewCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })
  app.get('/services',(req,res)=>{
    collection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })

  app.delete('/service/:title',(req,res)=>{
    // console.log(req.params.id);
    collection.deleteOne({title:req.params.title})
    .then((result)=> {
      console.log(result.deleteCount);

    })
    
  })
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.get('/allBookingsList',(req,res)=>{
    bookCollection.find({})
  .toArray((err,documents)=>{
    res.send(documents);
  })
  })
    
  // perform actions on the collection object
//   client.close();
});


app.listen(port)

