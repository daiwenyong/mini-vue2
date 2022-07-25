export default function initComponent(Vue) {
    Vue.options.components = {}
    Vue.component = function (id,definition) {
        definition = this.options._base.extend(definition)
        this.options.components[id] = definition
    }
}