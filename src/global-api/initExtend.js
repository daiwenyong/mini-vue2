import { mergeOptions } from "../utils/index";

export default function initExtend(Vue) {
    /**
     *  const Child = Vue.extend({
            template:'<div>extend</div>'
        })
     new Child({}).$mount()
     * */
    Vue.cId = 0
    let cId = 1
    Vue.extend = function (extendOptions) { // 给一个对象返回一个构造函数
        const Sub = function VueComponent(options={}) {
            this.init(options)
        }
        const Super = this // 父类 也就是Vue
        Sub.prototype = Object.create(Super.prototype) // 原型式继承
        Object.defineProperty(Sub.prototype, 'constructor', {
            value: Sub,
            enumerable: false,
            writable:true,// 不写就是false
            configurable:true
        })
        //Sub.prototype.constructor = Sub // 默认三者都是true
        //console.log(Object.getOwnPropertyDescriptors(Sub.prototype))

        // 合并父类options(包括Vue.mixin函数里的参数) 和自有的extendOptions
        Sub.options = mergeOptions(Super.options,extendOptions)
        Sub.cId = cId++
        return Sub
    }
}