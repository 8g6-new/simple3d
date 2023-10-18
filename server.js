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
                  'feedrate-X':2400,'feedrate-Y':2400,'feedrate-Z':2400,
                  'stepsize-X':10,'stepsize-Y':10,'stepsize-Z':10,
                  'X':{'cp':0,'val':0},
                  'Y':{'cp':0,'val':0},
                  'Z':{'cp':0,'val':0}
                };

['control','upload','printing'].forEach(n=>{
    app.get('/'+n, async(req, res) => {
        if(n=='control'){
            await send('G28');
            await send('G91');
            ['X','Y','Z'].forEach(n=>{
                ranges[n]['cp'] = 0
            })
        }
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