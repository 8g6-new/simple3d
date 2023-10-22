const fileUpload       = require('express-fileupload');
const express          = require('express')
const bodyParser       = require('body-parser')
const {join}           = require('path')
const layouts          = require('express-ejs-layouts')
const { Server }       = require('socket.io');
const { createServer } = require('node:http');
const save             = require('./scripts/file_upload')
const { 
    convert,
    running_code
}               = require('./scripts/gcode/gcode_process')
const {
    info_table
}                = require('./scripts/funs');
const { setTimeout } = require('timers/promises');
const {readdir}  = require('fs').promises


const PORT = process.env.PORT || 3000;

const app    = express();
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

let ranges =    {
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

    console.log('a user connected')

    app.get('/', async (req, res) => {
        try {
            await control(socket, ranges,send);
            const files = await readdir('./files/status_db/');
            const file = files[0];
            if (file) {
                const data = require('./files/processed/' + file.replace('.txt', '.gcode'));
                await running_code(
                    data['layers'],
                        data['len'], 
                    './files/status_db/' + file.replace('.gcode', '.txt'),
                    socket
                );
            }
        } catch (e) {
            console.error(e);
        }
    });
    
    app.post('/upload', async (req, res) => {
        
        const out = await save(req.files, 'uploadedFile', __dirname + '/files/uploads/');
        if (out['status'] === 'File uploaded') {
            const data  = await convert('files/uploads/' + out['filename'], 'files/processed/');
            const table = await info_table(data['info']);
            res.render('refs/printing',{table});
            await running_code(
                data['layers'], 
                data['len'], 
                './files/status_db/' + out['filename'].replace('.gcode', '.txt'),
                io
            );
           

        } else {
            res.send(out['err']);
        }
        // } catch (e) {
        //     console.error(e);
        //     res.status(500).send('Internal Server Error');
        // }
    });
});


 
app.listen(PORT,()=>{
    console.log(`Server Started @ ${PORT}`)
})

server.listen(PORT+1, () => console.log(`Listening on port ${PORT+1}`));