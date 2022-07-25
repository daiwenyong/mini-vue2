import {pushTarget, popTarget} from "./dep";
import {queueWatcher} from "./scheduler";
import {isObject} from "../utils/index";

let id = 0

export class Watcher {
    constructor(vm, expOrFn, cb, options) {
        this.vm = vm

        this.id = id++
        this.expOrFn = expOrFn
        this.cb = cb
        this.options = options
        this.deps = []
        this.depsId = new Set()
        if (options) {
            this.user = !!options.user
            this.lazy = !!options.lazy // 代表计算属性
        } else {
            this.user = this.lazy = false
        }
        this.dirty = this.lazy


        if (typeof expOrFn === 'function') { // computed或者渲染watcher
            this.getter = this.expOrFn
        } else {
            // watch 里观察的是'a'或者是'a.b.c' 封装getter函数 内部取值，从而收集当前函数watcher
            this.getter = function () {
                let segments = expOrFn.split('.')
                let obj = vm
                for (let i = 0; i < segments.length; i++) {
                    obj = obj[segments[i]]
                }
                return obj
            }
        }

        this.value = this.lazy ? undefined : this.get()
    }
    // 属性收集依赖
    get() {
        pushTarget(this)
        const res = this.getter.call(this.vm)
        popTarget()
        return res
    }
    // computed 需要重新计算值
    evaluate(){
        this.value = this.get()
        this.dirty = false
    }
    // 计算属性 收集渲染watcher
    depend(){
        this.deps.forEach(dep=>{
            dep.depend()
        })
    }
    // dep调notify会调watcher.update,queueWatcher中会调watcher.run
    update() {
        // 计算属性依赖的值发生变化 只需要把dirty置为true  下次访问到了重新计算
        if(this.lazy){
            this.dirty = true
        }else{
            queueWatcher(this) // 异步更新
        }
    }
    // watch 和 渲染watcher的回调 执行
    run() {
        const newVal = this.get()
        const oldVal = this.value
        this.value = newVal // 现在的新值用作下次的老值
        if (this.user) { // 用户watcher
            if(newVal !== oldVal || isObject(newVal)){
                this.cb.call(vm,newVal,oldVal)
            }
        }else{
            this.cb.call(vm)
        }
    }
    // watch去重收集dep,然后通知dep收集watcher
    addDep(dep) {
        const id = dep.id
        if (!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }
}