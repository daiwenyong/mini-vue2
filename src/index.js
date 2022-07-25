import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle'
import { renderMixin } from "./render";
import {stateMixin} from "./state";
import { initGlobalApi } from "./global-api/index";

function Vue(options) {
    this.init(options)
}

initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
stateMixin(Vue)
initGlobalApi(Vue)
export default Vue

// diff
// import { compileToFunction } from './compiler/index.js';
// import { createElm, patch } from './vdom/patch.js'
// let vm = new Vue({data:{a:1}})
// let oldTemplate = `<div>
//     <li key="A">A</li>
//     <li key="B">B</li>
//     <li key="C">C</li>
//     <li key="D">D</li>
// </div>`
// let rend = compileToFunction(oldTemplate)
// let oldVnode = rend.call(vm)
// document.body.appendChild(createElm(oldVnode))
//
// let newTemplate = `<div>
//     <li key="A">A1</li>
//     <li key="B">B1</li>
//     <li key="C">C1</li>
//     <li key="D">D1</li>
// </div>`;
// // let vm2 = new Vue({ data: { message: 'zf' } });
// const render2 = compileToFunction(newTemplate)
// const newVnode = render2.call(vm); // 虚拟dom
// // 根据新的虚拟节点更新老的节点，老的能复用尽量复用
//
// setTimeout(() => {
//     patch(oldVnode, newVnode);
// }, 1000);
