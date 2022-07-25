import initMixin from "./mixin";
import initExtend from "./initExtend";
import initComponent from "./initComponent";

export function initGlobalApi(Vue) {
    Vue.options = {}
    initMixin(Vue) // 合并Vue.options和Vue.mixin(options1)的options1 到Vue.options
    Vue.options._base = Vue
    initExtend(Vue) // 初始化Vue.extend
    initComponent(Vue) // 初始化Vue.component
}