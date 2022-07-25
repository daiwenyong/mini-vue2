import { isObj, isArray, isObject } from "../utils/index.js";
import { arrayMethods } from "./array"
import { Dep } from './dep'

class Observer {
    constructor(value) {
        this.dep = new Dep() // 用于为数组收集依赖
        // 给data下每个属性定义一个__ob__属性,可以拿到Observer所有方法，主要还是observeArray
        Object.defineProperty(value, '__ob__', {
            value: this,
            enumerable: false
        })
        if (isArray(value)) {
            Object.setPrototypeOf(value, arrayMethods)// AOP 修改数组原型
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    walk(obj) {
        let keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i]
            let value = obj[key]
            defineReactive(obj, key, value)
        }
    }

    observeArray(items) {
        for (let i = 0; i < items.length; i++) {
            observe(items[i])
        }
    }
}

function defineReactive(obj, key, value) {
    const childOb = observe(value)
    let dep = new Dep()
    Object.defineProperty(obj, key, {
        get() {
            if (Dep.target) {
                dep.depend()
                if (childOb) { // 如果是数组或者对象 主要是为数组收集依赖
                    childOb.dep.depend() // 依赖收集到 对象/数组的dep中 当数组触发7个变异方法时 会notify触发更新
                    if (Array.isArray(value)) {
                        dependArray(value) // 数组中还有数组 递归收集依赖
                    }
                }
            }
            return value
        },
        set(newVal) {
            if (value === newVal) return
            value = newVal
            dep.notify()
            observe(newVal)
        }
    })
}

function dependArray(value) {
    for (let e, i = 0; i < value.length; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if(Array.isArray(e)){
            dependArray(e)
        }
    }
}

export function observe(data) {
    if (!isObj(data)) {
        return
    }
    // 如果数据已经劫持过了 不再劫持。比如data下有个a{b:1},后面数组再push这个a,其实这个a不用再劫持了
    if (data.__ob__) return data.__ob__
    return new Observer(data)
}