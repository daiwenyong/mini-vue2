import { parse } from "./parse";
import { generate } from "./codegen";

/**
 * html字符串转换成render函数
 * @params template
 *  <div id="app">
         <div>
            hello{{name}}
            <span>world</span>
         </div>
    </div>
 *
 */
export function compileToFunction(template) {
    // 先转成ast语法树
    // ast: 用来描述语法 可以js css
    // 虚拟dom: 只能用来描述dom
    const ast = parse(template)
    // {tag: 'div', type: 1, children: Array(1), attrs: Array(2), parent: null}
    //console.log("-> ast", ast);

    // 通过ast 生成字符串代码
    // ==> '_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name))),_c('span',undefined,_v("world")))'
    const code = generate(ast)
    //console.log("-> code", code);

    const renderFn = new Function(`with(this){return ${code}}`)
    //console.log("-> renderFn", renderFn);
    return renderFn
}