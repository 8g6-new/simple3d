

function io_connect(io){
    return new Promise((resolve)=>{
        
    })
}

async function printer(io,app){

    const socket = await io_connect(io);

    app.get('/', async (req, res) => {
        try {
            const files = await readdir('./files/status_db/');
            const file = files[0];
            if (file) {
                const data = require('./files/processed/' + file.replace('.txt', '.json'));
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
        try {
            const out = await save(req.files, 'uploadedFile', __dirname + '/files/uploads/');
            if (out['status'] === 'File uploaded') {
                const data = await convert('files/uploads/' + out['filename'], 'files/processed/');
                const table = await info_table(data['info']);
                res.render('refs/printing', { table });
                await running_code(
                    data['layers'], 
                    data['len'], 
                    './files/status_db/' + out['filename'].replace('.gcode', '.txt'),
                    socket
                    );
            } else {
                res.send(out['err']);
            }
        } catch (e) {
            console.error(e);
            res.status(500).send('Internal Server Error');
        }
    });

    
}

module.exports = printer