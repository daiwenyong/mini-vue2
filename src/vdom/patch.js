export function patch(oldVnode, vnode) {
    if (!oldVnode) { // 组件渲染
        return createElm(vnode)
    }
    if (oldVnode.nodeType === 1) { // 元素节点
        const el = createElm(vnode)
        const parentElm = oldVnode.parentNode
        parentElm.insertBefore(el, oldVnode.nextSibling)
        parentElm.removeChild(oldVnode)
        return el
    } else {
        //console.log(oldVnode, vnode)

        if (oldVnode.tag !== vnode.tag) { // 标签不一样直接替换
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
        }
        let el = vnode.el = oldVnode.el // 标签一样复用
        if (oldVnode.tag === undefined) { // 都是文本
            if (oldVnode.text !== vnode.text) {
                //console.log(el, vnode)
                el.textContent = vnode.text
            }
            return
        }

        patchProps(vnode, oldVnode.data)

        let oldChildren = oldVnode.children || [];
        let newChildren = vnode.children || [];

        if (oldChildren.length > 0 && newChildren.length > 0) {
            // 双方都有儿子
            patchChildren(el, oldChildren, newChildren);
        }
        return el
    }
}


export function createElm(vnode) {
    const { tag, data, key, children = [], text } = vnode
    if (typeof tag === "string") {
        if (createComponent(vnode)) { // 是组件
            return vnode.componentInstance.$el
        }
        vnode.el = document.createElement(tag)
        patchProps(vnode)
        children.forEach((child) => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 创建组件实例
function createComponent(vnode) {
    let i = vnode.data
    if ((i = i.hook) && (i = i.init)) {
        i(vnode) // .$mount()
    }
    if (vnode.componentInstance) {
        return true
    }
}

function patchProps(vnode, oldProps = {}) {
    const el = vnode.el
    const props = vnode.data

    const newStyle = props.style || {}
    const oldStyle = oldProps.style || {}
    for (const k in oldStyle) { // 针对style
        if (!newStyle[k]) { // // 老的有 新的没有
            el.style[k] = ''
        }
    }

    for (const k in oldProps) {
        if (!props[k]) { // 老的有 新的没有
            el.removeAttribute(k)
        }
    }

    // 设置属性
    for (const k in props) {
        if (k === 'style') {
            for (let s in props[k]) {
                el.style[s] = props.style[s]
            }
        } else if (k === 'class') {
            el.className = props.class
        } else {
            el.setAttribute(k, props[k])
        }
    }

}

function patchChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0;
    let oldStartVnode = oldChildren[0];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndVnode = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newStartVnode = newChildren[0];
    let newEndIndex = newChildren.length - 1;
    let newEndVnode = newChildren[newEndIndex];
    const map = createKeyToOldIdx(oldChildren) // {A: 0, B: 1, C: 2, D: 3}
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        if (isSameVnode(oldStartVnode, newStartVnode)) { // 老头 新头
            patch(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) { // 老尾 新尾
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 老头 新尾 ==> ABCD BCDA
            patch(oldStartVnode, newEndVnode)
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 老尾 新头 ==> ABCD DABC
            patch(oldEndVnode, newStartVnode)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else { // 乱序比对  ABCD EFAC  EABCD/EFABCD/
            const moveIndex = map[newStartVnode.key]
            if (moveIndex === undefined) { // 如果没找到
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el) // 新节点放到最前面
            } else {
                const moveNode = oldChildren[moveIndex]
                el.insertBefore(moveNode.el, oldStartVnode.el)
                oldChildren[moveIndex] = null// 占位 防止数组坍陷
                patch(moveNode, newStartVnode)
            }
            newStartVnode = newChildren[++newStartIndex]
        }
    }
    // 追加的情况：新的比老的多
    // 1.后面追加：ABCD ==> ABCDE
    // 2.前面追加：ABCD ==> EABCD
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // anchor为null 就是在后面添加 不为null就是在前面添加
            let anchor = newChildren[newEndIndex + 1] === null ? null : newChildren[newEndIndex + 1].el
            el.insertBefore(createElm(newChildren[i]), anchor)
        }
    }
    // 删除的情况 新的比老的少
    // 1.ABCD ==> ABC
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            oldChildren[i] && el.removeChild(oldChildren[i].el)
        }
    }
}

function isSameVnode(oldVnode, newVnode) {
    return (oldVnode.tag == newVnode.tag) && (oldVnode.key == newVnode.key);
}

// 根据key创建map
function createKeyToOldIdx(children) {
    return children.reduce((pre, next, index) => {
        const key = next && next.key
        if (key) {
            pre[key] = index
        }
        return pre
    }, {})
}