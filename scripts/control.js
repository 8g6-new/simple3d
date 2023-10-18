function control(socket,ranges,send){
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

    ['X','Y','Z'].forEach(n=>{
        socket.on(n+'L',()=>{
            console.log(`G1 ${n}-${ranges['stepsize-'+n]} F${ranges['feedrate-'+n]}`)
        })
        socket.on(n+'R',()=>{
            console.log(`G1 ${n}${ranges['stepsize-'+n]} F${ranges['feedrate-'+n]}`)
        })
    })
}

module.exports = control