export const is = type => data => Object.prototype.toString.call(data) === `[object ${type}]`
export const isArray = is('Array')
export const isObject = is('Object')

export const isObj = function (obj) {
    return typeof obj === 'object' && obj !== null
}

const _toString = Object.prototype.toString

export function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]'
}

export const LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeDestroy',
    'destroyed'
]

const strats = {}

// 合并生命周期
function margeHook(parentVal, childVal) {
    if (childVal) {
        if (parentVal) {
            return parentVal.concat(childVal)
        } else {
            return [childVal]
        }
    } else {
        return parentVal
    }
}

LIFECYCLE_HOOKS.forEach(hook => {
    strats[hook] = margeHook
})

// 合并components
strats.components = function (parentVal, childVal) {
    const obj = Object.create(parentVal)
    if (childVal) {
        for (const k in childVal) {
            obj[k] = childVal[k]
        }
    }
    return obj
}

// {} {created:()=>{}} ==>{created:[()=>{}]}
// {created:[()=>{}]}  {created:()=>{}} ==>{created:[()=>{},()=>{}]}
export function mergeOptions(parent, child) {
    let options = {}

    for (let k in parent) {
        mergeField(k)
    }
    for (let k in child) {
        if (parent.hasOwnProperty(k)) {
            continue
        }
        mergeField(k)
    }

    function mergeField(k) {
        const parentVal = parent[k]
        const childVal = child[k]

        if (strats[k]) { // 生命周期
            options[k] = strats[k](parentVal, childVal)
        } else {
            options[k] = childVal || parentVal
        }
    }

    return options
}

const tagMap = {}
const reservedTag = 'a,div,span,p,img,button,ul,li';
reservedTag.split(',').forEach(tag => tagMap[tag] = true)

export function isReservedTag(tag) {
    return tagMap[tag];
}