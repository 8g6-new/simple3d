const {exec}      = require('child_process')
const {promisify} = require('util')
const exe         = promisify(exec)

async function run(gcode){
    const s = new Date().getTime()
    const {stdout,stderr} = await exe(`python control.py "${gcode}" "/dev/ttyUSB0" "115200"`)
    const e = new Date().getTime()
    if(stderr!=''){
        console.error(stderr)
    }
    else{
        console.log(`Ran ${gcode} with output ${stdout} (${(e-s)} ms)`)
    }
}

run('G1 X22 F2200')