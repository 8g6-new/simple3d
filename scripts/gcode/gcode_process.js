const {readFile,writeFile,unlink} = require('fs').promises
const send                 = ()=> new Promise((resolve)=>{setInterval(resolve,80)})
  
async function convert(input,output){

    let fn = input.split('/')
    fn     = fn[fn.length-1].replace('.gcode','.json')

    let data = await readFile(input,{encoding:'utf-8'})
    data = data.split('\n')

    let u = [],qq=0

    for(let t=0;t<data.length;t++){
        if(data[t].match(/LAYER:0/g)){
            u.push([qq,t])
            qq=t
        }
        else{
            if(data[t].match(/LAYER:/g)){
                u.push([qq,t])
                qq=t
            }
        }
    }

    let last = u[u.length-1]
    let out  = u.map(n=>data.slice(n[0],n[1]))
    out.push(data.slice(last[1],data.length))
    let info = out.map(n=>n.filter(n=>n.match(/:/g)).map(n=>n.replace(';','').replace('\r','').split(':')))
    let tt   = out.map(n=>n.filter(n=>!n.match(/:/g)).map(n=>{
        if(n.match(/;/g)){
            return n.split(';')[0].replace('\r','')
        }
        else{
            return n.replace('\r','')
        }
    })).map(n=>n.filter(n=>n!=''))

    let INFO = {}

    info[0].forEach(n=>{
        if(isNaN(parseFloat(n[1]))){
            INFO[n[0]] = n[1]
        }
        else{
            INFO[n[0]] = parseFloat(n[1])
        }
    })

    let times = data.filter(n=>n.match(/TIME_ELAPSED/g)).map(n=>n.replace(';','').replace('\r','').split(':'))

    let layers = {}

    tt.slice(1,tt.length).forEach((n,i)=>{
        layers[i+1] = {}
        if(times[i]){
            layers[i+1][times[i][0]] = parseFloat(times[i][1])
            layers[i+1]['gcode'] = n
        }
        else{
            layers[i+1]['gcode'] = n
        }
    })
    
    layers[0] = {}
    layers[0]['gcode'] = tt[0]
    layers[0]['TIME_ELAPSED'] = 0

    const DATA = {
        'info':INFO,'layers':layers,'len':tt.length,'times':times.map(n=>parseFloat(n[1]))
    }

    await writeFile(output+fn,JSON.stringify(DATA))

    return DATA
}

async function running_code(layers,len,times,file_path,io){

    let status = [0,0]

    try{
        status = await readFile(file_path,{encoding:'utf-8'})
        status = status.split(' ').map(n=>parseInt(n))
    }
    catch(e){
        status = [0,0]
    }

    let full=0
    for(let l=status[0];l<len;l++){
        for(let gi=status[1];gi<layers[l]['gcode'].length;gi++){
            full+=1
        }
    }
    let ttt = status[2];
    for(let l=status[0];l<len;l++){
        for(let gi=status[1];gi<layers[l]['gcode'].length;gi++){
            let s = new Date().getTime()
            await Promise.allSettled([
                send(layers[l]['gcode'][gi]),
                writeFile(file_path,`${l} ${gi} ${ttt}`)
            ])
            let e = new Date().getTime()
            io.emit('loop',{
                'layer':l,
                'gi':gi,
                'gi_len':parseInt(layers[l]['gcode'].length),
                'li_max':parseInt(len),
                'time':parseInt(times[len-2]-times[l]),
                'current':e-s,
                'full':full,
                'cur':ttt
            });
            console.log('send ',layers[l]['gcode'][gi])
            ttt++
        }
    }

    await unlink(file_path);

}

module.exports = { 
    convert,running_code
}