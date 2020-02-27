const express = require('express')
const bodyParser=require('body-parser')
const {startTests}=require('./playwright');


const app = express()
const port = 3000

let counter=0

// parse application/json
app.use(bodyParser.json())

/*
"viewport":{
          "width": 1280,
          "height": 720
     },
	"browserType":"chromium"
*/

app.get('/',(req,res,next)=>{
    counter++;
    res.send('Hello World ',counter);
});

app.post('/', async (req, res) => {
   let config=req.body; 
   if (!config || config ===null){
       res.status(400).send("Error empty config")
   }

   try
   {
    console.log(config)
    await startTests(config)
   }
   catch(error){
       console.error(error)
       res.status(400).send("Error",error)
   }
    return res.send('Hello World!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
