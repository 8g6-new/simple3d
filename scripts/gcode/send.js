const {exec}      = require('child_process')
const {promisify} = require('util')
const exe         = promisify(exec)

async function send(gcode){
    const s = new Date().getTime()
    const {stdout,stderr} = await exe(`python scripts/gcode/send.py "${gcode}" "/dev/ttyUSB0" "115200"`)
    const e = new Date().getTime()
    if(stderr!=''){
        console.error(stderr)
    }
    else{
        console.log(`Ran ${gcode} with output ${stdout} (${(e-s)} ms)`)
    }
}

module.exports = send