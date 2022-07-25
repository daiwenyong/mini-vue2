const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配花括号 {{  }} 捕获花括号里面的内容

function genProps(attrs) {
    if (!attrs.length) {
        return 'undefined'
    }
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]

        if (attr.name === 'style') {
            // { name: 'style', value: 'color: red;font-size:20px' }
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }

        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if (node.type === 1) {
        return generate(node)
    } else { // 文本节点  'hello{{name}}'
        //console.log("-> node", node);
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        }

        let lastIndex = defaultTagRE.lastIndex = 0
        let tokens = []
        let match, index
        // console.log(defaultTagRE.exec(text))
        // console.log(text.match(defaultTagRE))
        while (match = defaultTagRE.exec(text)) {
            index = match.index
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`) // 变量内容用_s
            lastIndex = index + match[0].length
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})` // `_v("hello"+_s(name))`

    }
}

function genChildren(chidren) {
    return chidren.map(c => gen(c)).join(',')
}

// ${attrs.length ?${genProps(attrs)} : 'undefined'}
export function generate(ast) {
    const { tag, attrs, children } = ast
    let code = ` _c('${tag}',${genProps(attrs)}${children.length ? `,${
        genChildren(children)}` : ''})`
    return code

}