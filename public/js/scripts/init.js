socket = io('http://localhost:3001/')


const info = {
    'MAX_FEEDRATE_mms':100,
    'MAX_0':220,'MAX_1':220,'MAX_2':250
}

function timer(seconds){
    let tt = '<div class="grid grid-flow-col gap-5 text-center auto-cols-max m-4 p-4">'

    let days  = parseInt(seconds / (3600 * 24));
    let hours = parseInt((seconds % (3600 * 24)) / 3600);
    let minutes = parseInt((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    let fi=['hours','minutes','seconds']

    if(days>0){
        tt+=`<div class="flex flex-col">
            <span class="countdown font-mono text-5xl">
                <span style="--value:${days};"></span>
            </span>
            days
        </div>`
    }
    else{
        tt+=[hours,minutes,remainingSeconds].map((n,i)=>`<div class="flex flex-col">
            <span class="countdown font-mono text-5xl">
                <span style="--value:${n};"></span>
            </span>
            ${fi[i]}
        </div>`).join('')
    }

    return tt+'</div>'
}




