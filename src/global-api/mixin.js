import { mergeOptions } from "../utils/index";

export default function initMixin(Vue) {

    // Vue.mixin({
    //     created(){
    //         console.log("-> created");
    //     }
    // })
    Vue.mixin = function (options) {
        this.options = mergeOptions(this.options,options)
        return this
    }
}