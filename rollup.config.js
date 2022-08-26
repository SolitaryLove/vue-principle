import babel from 'rollup-plugin-babel';

export default {
    input:'./src/index.js',
    output:{
        file:'./dist/vue.js',
        name:'Vue',// global.Vue
        format:'umd',// 打包格式:esm commonjs iife umd(兼容cjs,adm,iife)...
        sourcemap:true,// 源代码映射,方便调试
    },
    plugins:[
        babel({
            exclude:'node_modules/**'// 排除node_modules所有文件和文件夹
        })
    ]
}