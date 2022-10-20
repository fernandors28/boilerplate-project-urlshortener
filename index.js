require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const { model } = require('mongoose');
const app = express();
const { default: mongoose } = require('mongoose');
const { json } = require('body-parser');


//connect Database
mongoose.connect(process.env.MONGO_URI)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// Your first API endpoint
const urlSchema = new mongoose.Schema(
  {
    original:{type:'string',required:true},
    short:{type:'number'}
  }
)
const urlModel = mongoose.model('urlshortener',urlSchema); 
app.post('/api/shorturl',(req,res)=>{
  const urlBody = req.body.url;
  if(urlBody.match(/^https:|^https:/)){
    urlModel
    .findOne({})
    .sort({short:'desc'})
    .exec((err,databases)=>{
      let short= 0;
      if(!err && databases != undefined){
       short = databases.short + 1
      }
      if(!err){
        urlModel.findOneAndUpdate(
          {original:urlBody},
          {original:urlBody,short:short},
          {new:true,upsert:true},
          (err,databases)=>{
            res.json(databases)
          }
        )
      }
    })
  }else{
    res.json({error:'Invalid Url'})
  }
})

app.get('/api/shorturl/:shorturl?',(req,res)=>{
  const short = req.params.shorturl;
  urlModel.find({short:short}).exec((err,db)=>{
    if(!err && db !=undefined){
      console.log(db[0].original)
      res.redirect(db[0].original)
    }
  })
})        
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
