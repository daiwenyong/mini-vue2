import {nextTick} from "../utils/next-tick";

let queue = []
let has = {}
function flushQueue() {
    for(let i=0;i<queue.length;i++){
        const watcher = queue[i]
        watcher.run()
    }
    queue = []
    has = {}
}

export function queueWatcher(watcher) {
    const id = watcher.id
    if(!has[id]){
        has[id] = true
        queue.push(watcher)
        nextTick(flushQueue)
    }
}