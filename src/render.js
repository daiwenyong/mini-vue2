import { createElement, createTextNode } from "./vdom/index";

export function renderMixin(Vue) {
    Vue.prototype._c = function (...args) {
        const vm = this
        return createElement(vm,...args)
    }


    Vue.prototype._v = function (text) {
        const vm = this
        return createTextNode(vm,text)
    }
    Vue.prototype._s = function (val) {
        if(typeof val === 'object'){
            return JSON.stringify(val)
        }
        return val
    }
    //return  _c('div',{id:"app"}, _c('div',undefined,_v("hello"+_s(name)), _c('span',undefined)) )

    Vue.prototype._render = function () {
        const vm = this
        const render = vm.$options.render
        const vnode = render.call(vm)
        return vnode
    }
}