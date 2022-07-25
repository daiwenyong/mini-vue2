import {observe} from "./observer/index.js"
import {Dep} from "./observer/dep.js"
import {Watcher} from "./observer/watcher";
import {isPlainObject} from "./utils/index";

export function initState(vm) {
    const {props, methods, data, computed, watch} = vm.$options
    if (props) {

    }
    if (methods) {
        initMethods(vm, methods)
    }
    if (data) {
        initData(vm, data)
    }
    if (computed) {
        initComputed(vm, computed)
    }
    if (watch) {
        initWatch(vm, watch)
    }

}

function initData(vm, data) {
    data = vm._data = typeof data === 'function' ? data.call(vm) : data

    // data下的属性代理到vm上
    for (let key in data) {
        proxy(vm, '_data', key)
    }

    observe(data)
}

function initWatch(vm, watch) {
    for (const key in watch) {
        const handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatch(vm, key, handler[i])
            }
        } else {
            createWatch(vm, key, handler)
        }
    }
}
// computed里面依赖的属性会进行依赖收集，首页会收集computed的get函数，
// 然后也会通过watcher.depend()收集页面的渲染watcher
function initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null)
    for (const k in computed) {
        const userDef = computed[k]
        const getter = typeof userDef === 'function' ? userDef : userDef.get
        watchers[k] = new Watcher(vm, getter, () => {}, {lazy: true})
        defineComputed(vm, k, userDef)
    }
}

const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {
    },
    set: () => {
    },
}

function defineComputed(target, key, userDef) {
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key)
    } else {
        sharedPropertyDefinition.get = createComputedGetter(key)
        sharedPropertyDefinition.set = userDef.set
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

// computed的属性的dirty默认是true,获取到value后会置为false,下次页面再获取属性时就会使用上次的value
// 当依赖的属性变化后，会把dirty置为true,又会重新获取value,重复上面逻辑
function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key]
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate()
            }
            if(Dep.target){ // 计算属性依赖的属性dep 收集渲染watcher
                watcher.depend()
            }

            return watcher.value
        }
    }
}

function createWatch(vm, expOrFn, handler, options) {
    // watch:{
    //     name:{
    //         handler(){ }
    //     },
    //     a(){},
    //     a:'aFn'
    // }
    if (isPlainObject(handler)) {
        options = handler
        handler = handler.handler
    }
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(expOrFn, handler, options)
}

function proxy(vm, source, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[source][key]
        },
        set(newV) {
            vm[source][key] = newV
        }
    })
}

export function stateMixin(Vue) {
    Vue.prototype.$watch = function (expOrFn, cb, options) {
        const vm = this
        const watch = new Watcher(vm, expOrFn, cb, {
            ...options,
            user: true // 用户watcher
        })
        if (options?.immediate) {
            cb.call(vm,watch.value)
        }
    }
}

function initMethods(vm, methods) {
    for (let k in methods) {
        vm[k] = methods[k].bind(vm)
    }
}