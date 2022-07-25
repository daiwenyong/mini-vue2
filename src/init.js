import { initState } from './state'
import { compileToFunction } from "./compiler/index";
import { mountComponent,callHook } from "./lifecycle";
import { mergeOptions } from "./utils/index";

export function initMixin(Vue) {
    Vue.prototype.init = function (options) {
        const vm = this
        // 合并之前Vue上的options 和new Vue(options)的options
        vm.$options = mergeOptions(vm.constructor.options,options)

        callHook(vm,'beforeCreate')
        initState(vm)
        callHook(vm,'created')

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = el && document.querySelector(el)
        vm.$el = el
        if (!options.render) {
            let template = options.template

            if (!template && el) {
                template = el.outerHTML
            }

            if (template) {
                const render = compileToFunction(template)
                options.render = render
            }
        }
        mountComponent(vm,el)
        return vm
    }
}