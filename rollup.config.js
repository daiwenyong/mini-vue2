import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'
export default {
    input:'./src/index.js',
    output:{
        format:'umd',
        file: "dist/index.js",
        name:'Vue',
        sourceMap: true
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        }),

    ]

}
// process.env.ENV=='development'?
//     serve({
//         open:true,
//         openPage:'/index2.html',
//         port:'8888'
//     }):null