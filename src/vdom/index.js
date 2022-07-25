import { isObject, isReservedTag } from "../utils/index";

// _c中调用
export function createElement(vm, tag, data = {}, ...children) {
    const key = data.key
    if (isReservedTag(tag)) { // 常规标签
        return createVNode(vm, tag, data, key, children, undefined)
    } else { // 组件
        const Ctor = vm.$options.components[tag]
        return createComponent(vm, tag, data, key, children, Ctor)
    }
}

// _v中调用
export function createTextNode(vm, text) {
    return createVNode(vm, undefined, undefined, undefined, undefined, text)
}

function createComponent(vm, tag, data, key, children, Ctor) {
    if (isObject(Ctor)) {
        Ctor = vm.options._base.extend(Ctor)
    }
    data.hook = { // 给组件注册钩子函数
        init(vnode) { // 初始化
            const vm = vnode.componentInstance = new Ctor({ _isComponent: true })
            vm.$mount()
        }
    }
    return createVNode(
        vm,
        `vue-component-${Ctor.cId}-${tag}`,
        data,
        key,
        children,
        undefined,
        {
            Ctor,
            children,
        })
}

function createVNode(vm, tag, data, key, children, text, componentOptions) {
    return {
        vm,
        tag,
        data,
        key,
        children,
        text,
        componentOptions
    }
}

// class Vnode{
//     constructor() {
//     }
// }