function control(socket,ranges,send){

    const info = {
        'MAX_FEEDRATE_mms':100,
        'MAX_0':220,'MAX_1':220,'MAX_2':250
    };
    

    ['X','Y','Z'].forEach(n=>{
        socket.on('feedrate-'+n,(val)=>{
            ranges['feedrate-'+n] = val
            console.log(ranges)
        })
    });
    ['X','Y','Z'].forEach(n=>{
        socket.on('stepsize-'+n,(val)=>{
            ranges['stepsize-'+n] = val
            console.log(ranges)
        })
    });

    ['X','Y','Z'].forEach(async(n,i)=>{
        socket.on(n+'L',async()=>{
            ranges[n]['val']-=ranges['stepsize-'+n]
            if(ranges[n]['val']<0){
                ranges[n]['val'] += info[`MAX_${i}`]
            }
            else{
                // await send(`G1 ${n}-${ranges[n]['val']} F${ranges['feedrate-'+n]}`)
                console.log(`G1 ${n}-${ranges['stepsize-'+n]} F${ranges['feedrate-'+n]}`,ranges)
            }
            ranges[n]['cp'] = ranges[n]['val']
        })
        socket.on(n+'R',async()=>{
            ranges[n]['val']+=ranges['stepsize-'+n]
            if(ranges[n]['val']>info[`MAX_${i}`]){
                ranges[n]['val'] -= info[`MAX_${i}`]
            }
            else{
                // await send(`G1 ${n}${ranges[n]['val']} F${ranges['feedrate-'+n]}`)
                console.log(`G1 ${n}${ranges['stepsize-'+n]} F${ranges['feedrate-'+n]}`,ranges)
            }
            ranges[n]['cp'] = ranges[n]['val']
        })
        
    })
}

module.exports = control