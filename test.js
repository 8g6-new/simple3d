const express          = require('express')
const {convert,running_code}  = require('./scripts/gcode/gcode_process')
const { Server }       = require('socket.io');
const { createServer } = require('node:http');
const PORT = 4000
const app    = express();
const server = createServer(app);

const io = new Server(server,{
    cors:{
        origin:'*'
    }
});

async function run(){
   let data  = await convert('./files/uploads/AKNEO_Tiny_Tester.gcode','./files/processed/AKNEO_Tiny_Tester.json')
   await running_code(data['layers'],data['len'],'./files/status_db/'+'AKNEO_Tiny_Tester.gcode'.replace('.gcode','.txt'),io)
}



app.listen(PORT,()=>{
   console.log(`Server Started @ ${PORT}`)
})

server.listen(PORT+1, async() => {
   console.log(`Listening on port ${PORT+1}`)
   await run()
});


