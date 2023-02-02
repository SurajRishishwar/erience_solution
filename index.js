const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const https=require("https");
const { json } = require("body-parser");
const { url } = require("inspector");
const app=express();
const port = 8000 || process.env.port;


app.use(express.urlencoded());
app.use(bodyParser.json());

app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/erience",{
    useNewUrlParser:true
});

const db=mongoose.connection;
db.on("err",console.error.bind(console,"Connecton Error"));
db.once("open",function(){
    console.log("Db Connected");
});


// city schema
const citySchema=new mongoose.Schema({
    city:{
        type:String,
        unique:true
    }

});

//user schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    mobile:{
        type:Number
    },
    media:{
        type:String
    },
    parameterid:{
        type:String
    }


});

const User=mongoose.model("User",userSchema);

const City=mongoose.model("City",citySchema);

// api for city insertion  STEP 1
app.post(`/citytoinsert`,(req,res)=>{
    let cityname=req.body.city;
   
    let insert=true;
    
        for(let i=0;i<64;i++){
            if(cityname.charCodeAt(i)<=64){
                insert=false;
                break;
                
            }
        }
        if(insert){
            
            var city1 =new City({city:cityname});
            city1.save(function(err,city){
               
                console.log(city);
                return res.status(200).send({"code":"200","msg":"city name inserted"});
            });

        }
        else{
            return res.status(300).send({"code":"300","msg":"City name contains numeric data"});
        }
        


});

//api for displaying cities   STEP  2
app.get(`/allcity`,(req,res)=>{
    City.find({},function(err,ress){
        if(err){
            console.log(err);
        }
        return res.status(200).send(ress);
    });

});

//api call for api  STEP 3

https.get('https://api.binance.com/api/v1/time',(res)=>{

    console.log(res.servertime);
  
 });


// inserting user STEP  4
app.post(`/user`,(req,res)=>{
    console.log(req.body);

    let namevalid=true;
    
    for(let i=0;i<64;i++){
        if(req.body.name.charCodeAt(i)<=64){
            namevalid=false;
            break;  
        }
    }


    let mob= req.body.mobile
    function numberonly(mob){
        return /^\d+$/.test(mob);
    }

    let media =req.body.media;
    let mediavalid=false;
    if(media.includes('https')){
        mediavalid=true;
    }

    if (namevalid&&mediavalid&&numberonly(mob)){
        var user1 =new User({name:req.body.name,mobile:mob,media:media,city:req.body.city,parameterid:"123"});
        user1.save(function(err,user){
           
            if(err){
                console.log(err)
            }
            console.log(user);
            return res.status(200).send({"code":"200","msg":"user inserted"});
        });

    }
    else{
        return res.status(300).send({"code":"300","msg":"Something went Wrong"});
    }

    


});

// dispalying  users STEP 5
app.get(`/alluser`,(req,res)=>{
    User.find({},function(err,ress){
        if(err){
            console.log(err);
        }
        return res.status(200).send(ress);
    });
});


// update user api api STEP  6
app.post(`/update/:id`,(req,res)=>{
    let id =req.params.id;
    User.findByIdAndUpdate({_id:id},{
        name:req.body.name,
        city:req.body.city,
        mobile:req.body.mobile,
        media:req.body.media
    },function(err,resss){
        if(err){
            console.log(err);
            return res.status(300).send({"code":"300","msg":"user updation Denied"});
        }
        else{
           return res.status(200).send({"code":"200","msg":"user updated"});
        }
    });
});


//display on ejs Bonus STEP 1
app.get(`/alluseronejs`,(req,res)=>{
    User.find({},function(err,ress){
        if(err){
            console.log(err);
        }
        console.log(ress);
        return res.render('user',{
            title:"USer Page",
            user:ress
        });
    });
});



app.listen(port,()=>{
    console.log(`server is up at ${port}`);
});
