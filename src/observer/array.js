const arrayProto = Array.prototype

export const arrayMethods = Object.create(arrayProto)
const methods = [
    'push',
    'unshift',
    'splice',
    'reverse',
    'pop',
    'shift',
    'sort'
]

methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        const result = arrayProto[method].apply(this, args)
        const ob = this.__ob__ // __ob__是Observe实例
        let insered;
        switch (method) {
            case 'push':
            case 'unshift':
                insered = args
                break
            case 'splice':
                insered = args.slice(2);
                break
            default:
                break
        }
        if (insered) {
            ob.observeArray(insered)
        }
        ob.dep.notify()
        return result
    }
})