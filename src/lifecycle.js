import { patch } from "./vdom/patch";
import { Watcher } from "./observer/watcher";


export function mountComponent(vm, el) {
    //vm.$el = el

    callHook(vm, 'beforeMount')
    let updateComponent = () => {
        debugger
        vm._update(vm._render())
    }
    new Watcher(vm, updateComponent, () => {
        // callHook(vm, 'beforeUpdate')
    })
    callHook(vm, 'mounted')
}

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const prevNode = vm._vnode
        if(!prevNode){
            vm.$el = patch(vm.$el, vnode) // 初始化渲染
        }else{
            vm.$el = patch(prevNode,vnode) // diff 比较
        }
        vm._vnode = vnode
    }
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if (handlers) {
        for (let i=0;i<handlers.length;i++){
            handlers[i].call(vm)
        }
    }
}