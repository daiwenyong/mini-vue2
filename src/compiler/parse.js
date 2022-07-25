const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"


/*
* <div id="app">
         <div>
            hello{{name}}
            <span>world</span>
         </div>
    </div>
    *
*   {
*       tag:'div',
*       type:1,
*       children:[],
*       attrs:[],
*       parent:null,
*   }
* */
export function parse(html) {
    let root,currentParent
    let stack = []
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    function createASTText(text) {
        return {
            type:TEXT_TYPE,
            text
        }
    }

    // 处理开始标签
    function handleStartTag({tagName, attrs}) {
        let element = createASTElement(tagName,attrs)
        if(!root){
            root = element
        }
        currentParent = element
        stack.push(element)
    }

    // 处理文本
    function handleChars(text) {
        text = text.trim()
        if(text){
            currentParent.children.push(createASTText(text))
        }
    }

    // 处理结束标签
    function handleEndTag(tagName) {
        let element = stack.pop()
        if(element.tag !== tagName){
            throw Error('标签闭合有误')
        }
        // 比如 <div><span></span></div> 当遇到第一个结束标签</span>时 会匹配到栈顶<span>元素对应的ast 并取出来
        currentParent = stack[stack.length - 1]
        if(currentParent){
            element.parent = currentParent
            element.parent.children.push(element)
        }
    }

    // 截取html
    function advance(len) {
        html = html.slice(len)
    }
    // 匹配开始标签
    function parseStartTag() {
        const start = html.match(startTagOpen)

        if (start) {
            const match = {
                tagName: start[1],
                attrs:[]
            }
            advance(start[0].length)

            // 匹配属性
            let end,attr
            // 没有匹配到
            while (!(end=html.match(startTagClose)) && (attr = html.match(attribute)) ){
                advance(attr[0].length)
                // [' id="app"', 'id', '=', 'app', undefined, undefined, index: 0, ]
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if(end){
                // 匹配到> 代表开始标签解析完毕
                advance(1)
                return match
            }
        }
    }

    while (html) {
        // 查找<
        let textEnd = html.indexOf('<')
        // 可能是<div>123</div> 可能是</div>
        if (textEnd === 0) {
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                handleStartTag(startTagMatch)
                continue // 跳出这次循环
            }
            const endTagMatch = html.match(endTag)
            if(endTagMatch){
                advance(endTagMatch[0].length)
                handleEndTag(endTagMatch[1])
                continue
            }
        }

        let text
        // 123<span>1</span>
        if(textEnd>0){
            text = html.slice(0,textEnd)
        }
        if(text){
            advance(text.length)
            handleChars(text)
        }
    }

    return root
}