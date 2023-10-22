setTimeout(()=>{
  const dims          = ['X', 'Y', 'Z']
  let feedrates       = dims.map(n => 'feedrate-' + n).map(n => [document.getElementById(n), n]);
  let feedrates_vals  = dims.map(n => 'feedrate-' + n+'-val').map(n =>document.getElementById(n));
  
  let stepsizes       = dims.map(n => 'stepsize-' + n).map(n => [document.getElementById(n), n]);
  let stepsizes_vals  = dims.map(n => 'stepsize-' + n+'-val').map(n =>document.getElementById(n));

  let buttons         = dims.map(n =>[n+'R',n+'L']).map(n=>n.map(a=>[document.getElementById(a),a]))

  console.log(stepsizes_vals,feedrates_vals)

  
  feedrates.forEach((n,i) => {
      n[0].addEventListener('input', (event) => { 
          socket.emit(n[1], event.target.value * 60); 
          feedrates_vals[i].innerText = event.target.value * 60
          console.log(event.target.value);
      });
  });

  stepsizes.forEach((n,i) => {
      n[0].addEventListener('input', (event) => { 
          let out = parseInt(info[`MAX_${i}`]*event.target.value/100)
          socket.emit(n[1],out); 
          stepsizes_vals[i].innerText = out
          console.log(out);
      });
  });


  buttons.forEach(a => {
      a.forEach(n=>{
          n[0].addEventListener('click', (event) => { 
              socket.emit(n[1]); 
              console.log(n[1])
          });
      })
  });
},100)
