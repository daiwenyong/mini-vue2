let callbacks = []
let pending = false

function flushCallbacks() {
    for (let i = 0; i < callbacks.length; i++) {
        callbacks[i]()
    }
    pending = false
}

let timerFunc
if (typeof Promise !== 'undefined') {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if (typeof MutationObserver !== 'undefined') {
    // MutationObserver 用来监听dom变化 也是一个异步方法
    let n = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(n))
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        textNode.data = String(n = 2)
    }
} else if(typeof setImmediate !== 'undefined'){
    timerFunc = ()=>{
        setImmediate(flushCallbacks)
    }
} else{
    setTimeout(()=>{
        flushCallbacks()
    })
}

export function nextTick(cb) {
    callbacks.push(cb)
    if (!pending) {
        pending = true
        timerFunc()
    }
}