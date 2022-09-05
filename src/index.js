import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

function Vue(options){// options用户传入的配置对象
    this._init(options);// 默认调用init
}



initMixin(Vue);// 扩展了 init 方法

initLifecycle(Vue);// 扩展了生命周期,实现了 vm._update vm._render

initGlobalAPI(Vue);// 扩展了全局方法,实现了 Vue.mixin()

initStateMixin(Vue);// 实现了 vm.$nextTick() 和 vm.$watch


// -------- 方便观察前后的虚拟节点比对-测试 --------
/* let render1=compileToFunction(`<ul a="1" style="color:red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`); // 生成 render 函数
let vm1=new Vue({data:{name:'solitary'}});
let prevVnode=render1.call(vm1);

let el=createElm(prevVnode);
document.body.appendChild(el);


// 如果用户自己操作 dom,可能会有性能问题
// Vue内部做了许多优化,确保性能下限
let render2=compileToFunction(`<ul a="1" style="color:blue;">
    <li key="b">b</li>
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>
    <li key="c">c</li>
    <li key="q">q</li>
</ul>`);
let vm2=new Vue({data:{name:'haha'}});
let nextVnode=render2.call(vm2);

// 直接将旧节点用新节点替换掉会有性能浪费
// diff 算法不是直接替换,而是比较新旧虚拟节点的区别之后再替换
// diff 算法是一个平级比较的过程,父级比父级,子级比子级
setTimeout(()=>{
    // let newEl=createElm(nextVnode);
    // el.parentNode.replaceChild(newEl,el);
    patch(prevVnode,nextVnode);
},1000) */


export default Vue;