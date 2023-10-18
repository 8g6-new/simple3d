const {readFile,writeFile} = require('fs').promises


function jsonfy(data){
    let out = {}
    for(let t=0;t<data.length;t++){
        out[data[t][0]] = data[t][1]
    }
    Object.keys(out).map(n=>{
        if(n.match(/TIME_ELAPSED/g)){
            delete out[n]
            n = n.split(':')
            out[n[0]] = parseFloat(n[1])
        }
    })
    Object.keys(out).map(n=>{
        if(n.match(/LAYER/g)){
            const uu = out[n]
            delete out[n]
            out['layer_init'] = uu
        }
    })
    return out
}

function check(info,data){

    for(let t=0;t<info.length;t++){
        if(Math.abs(info[t][1][0]-info[t][1][1])>1)
        info[t][1] = data.slice(info[t][1][0],info[t][1][1]).map(n=>n.split(';')).filter(n=>n[0]!='').map(n=>n[0].replace('\r',''))
    }
    
    let qq=0

    for(let t=0;t<info.length;t++){
        if(info[t][1].length>2){
            qq=t
            break
        }
    }
    for(let t=0;t<qq;t++){
        if(info[t][1].length>2){
            qq=t
            break
        }
    }

    let gcodes = {
        'info':{},
        'init':info[qq][1],
        'layers':[]
    }

    for(let t=0;t<qq;t++){
        info[t][0] = info[t][0].split(':')
        gcodes['info'][info[t][0][0]] = isNaN(parseFloat(info[t][0][1])) ? info[t][0][1] : parseFloat(info[t][0][1])
    }
    info[qq][0] = info[qq][0].split(':')
    gcodes['info'][info[qq][0][0]] = isNaN(parseFloat(info[qq][0][1])) ? info[qq][0][1] : parseFloat(info[qq][0][1])

    info[qq+1][0] = info[qq+1][0].split(':')
    gcodes['info'][info[qq+1][0][0]] = isNaN(parseFloat(info[qq+1][0][1])) ? info[qq+1][0][1] : parseFloat(info[qq+1][0][1])
    
    info = info.slice(qq+2,info.length)
    
    qq = 0

    for(let t=1;t<info.length;t++){
        if(info[t][0].match(/LAYER/g)){
            gcodes['layers'].push([qq,t])
            qq = t 
        }
    }

    let last = gcodes['layers'][gcodes['layers'].length-1][1]

    gcodes['layers'].push([last,info.length])
    
    gcodes['layers'] = gcodes['layers'].map(n=>info.slice(n[0],n[1]).filter(n=>(n[1][0]!=n[1][1]) || n[0].match(/TIME_ELAPSED/g)))
    gcodes['layers'] = gcodes['layers'].map(n=>jsonfy(n))

    return gcodes
}

async function convert(file){

    let fn = file.split('/')
    fn = fn[fn.length-1].replace('.gcode','')

    let data = await readFile(file,{encoding:'utf-8'})
    data = data.split('\n')
    let info = data.map(n=>n.split(':')).map((n,i)=>[n,i]).filter(n=>n[0].length>1)
    
    info = info.map(n=>{
        n[0][0]  = n[0][0].replace(';','')
        let temp = n[0][1].replace('\r','')
        temp     = parseFloat(temp)

        if(isNaN(temp)){
            temp = n[0][1].replace('\r','')
            return [n[0][0]+':'+temp,n[1]]
        }
        else{
            return [`${n[0][0]}:${temp}`,n[1]]
        }
    })

    for(let t=0;t<info.length;t++){
        if(info[t+1]){
            info[t][1] = [info[t][1]+1,info[t+1][1]]
        }
        else{
            info[t][1] = [info[t][1]+1,data.length-1]
        }
    }
    let out = check(info,data)
    await writeFile(fn+'.json',JSON.stringify(out))
}

convert('../../files/uploads/AKNEO_Tiny_Tester.gcode')