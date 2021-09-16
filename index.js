const Gpio = require('pigpio').Gpio;
const axios = require('axios');
const express = require("express");
const mongoose=require("mongoose");
require('dotenv').config();


// Definitions
const port = process.env.PORT;
const MAXIMUM_DISTANCE = process.env.MAXIMUM_DISTANCE;
const HOST_IP = process.env.HOST_IP;
const app = express();
const Data=require('./models/models')

//connect to database
const dbURI="mongodb+srv://Admin:Admin@cluster0.lmz1w.mongodb.net/smtpk?retryWrites=true&w=majority";
mongoose.connect(dbURI,{useNewUrlParser:true,useUnifiedTopology:true})
// .then((result)=> app.listen(3000))
.then((result)=>console.log("connected"))
.catch((err) =>console.log(err));


app.use(express.json());


// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECONDS_PER_CM = 1e6/34321;

const url = 'http://' + process.env.HOST_IP + ':' + process.env.PORT + '/api/parking_lot'

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});
//
trigger.digitalWrite(0); // Make sure trigger is low
let status = "null";
let dist="occupied"

// {
  // "state":0
// };
const distanceRead = () => {
  let startTick;
  // let status = {
    // "state":0
  // };
  //
  echo.on('alert', (level, tick) => {
  //
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      const distance = diff / 2 / MICROSECONDS_PER_CM;
      status.state=distance;
    //   console.log(process.env.MAXIMUM_DISTANCE);
    //  console.log(distance);
    //   let distance = distance

      if(distance <= process.env.MAXIMUM_DISTANCE) {
          // status.state= "occupied"

          var status="occupied"


        }
	    else 
      {
        var status="vacant"
        // status.state= "vacant"
          }

    }
    return status; 
  });
  
  

};

// Trigger a distance measurement once per second
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);

// ROUTES
// Packing_IOT stream data
  app.get("/api/parking_lot",(req,res) => {
    const dist = distanceRead();
    const data=new Data({
    // res.json({
      // "state": dist
      state:dist,
      location:"here"
    })
    
    data.save()
    .then((result)=>{
      res.send(result)
    })
    .catch((err)=>{
      console.log(err)
    })
  });
  // });
  app.get("/api/data",(req,res) => {
    const dist = distanceRead();
    res.json({
      "distance": dist
    });
  });

  app.post("/api/parking_lot",(req,res) => {
    const dist = distanceRead();
    console.log (dist);
    // const data=new Data({
     const data=res.json({
      "state": dist
      // state:dist,
      // location:"here"
    })
    
    data.save()
    .then((result)=>{
      res.send(result)
      
    })
    .catch((err)=>{
      console.log(err)
    })
  })

  app.listen(port, () => {
    console.log(`app running port${port}`)
  });
