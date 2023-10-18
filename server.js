const fileUpload    = require('express-fileupload');
const express       = require('express')
const bodyParser    = require('body-parser')
const {join}        = require('path')
const layouts       = require('express-ejs-layouts')
let  htmls          = require('./htmls')
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const control  = require('./scripts/control');
const send     = require('./scripts/gcode/send')


const PORT = process.env.PORT || 3000;

const app  = express();
const server = createServer(app);
const io = new Server(server,{
    cors:{
        origin:'*'
    }
});

app.use(fileUpload());
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(layouts)

app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'));

let ranges = {
                  'feedrate-X':2200,'feedrate-Y':2200,'feedrate-Z':2200,
                  'stepsize-X':10,'stepsize-Y':10,'stepsize-Z':10,
                  'X':0,
                  'Y':0,
                  'Z':0
                };

['control','upload','printing'].forEach(n=>{
    app.get('/'+n, (req, res) => {
        res.render('refs/'+n);
    });
})

io.on('connection', (socket) => {
    console.log('a user connected');
    control(socket,ranges,send)
    
});

app.post('/upload', async(req, res) => {
    let     out = await save(req.files,'file')
    if(out['status']=='File uploaded')
      res.render('upload', htmls);
    else
      res.status(500).send(out['err']);
});
 
app.listen(PORT,()=>{
    console.log(`Server Started @ ${PORT}`)
})

server.listen(PORT+1, () => console.log(`Listening on port ${PORT+1}`));