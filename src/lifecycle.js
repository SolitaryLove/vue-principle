import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";


export function initLifecycle(Vue){
    Vue.prototype._update=function(vnode){
        // console.log('update',vnode);
        const vm=this;
        const el=vm.$el;
        // console.log(el);
        // patch 既有初始化的功能,又有更新的功能
        // 用 vnode 创建新的节点替换 el(根节点 DOM)
        // vm.$el=patch(el,vnode);

        const prevVnode=vm._vnode;
        vm._vnode=vnode;// 保存上一次生成的虚拟dom
        if(prevVnode){// 已完成初渲染
            vm.$el=patch(prevVnode,vnode);// 旧虚拟节点与新虚拟节点
        }else{
            vm.$el=patch(el,vnode);// 挂载元素与新虚拟节点
        }
    }

    // _c('div',{},...children)
    Vue.prototype._c=function(){
        return createElementVNode(this,...arguments);
    }
    // _v(text)
    Vue.prototype._v=function(){
        return createTextVNode(this,...arguments);
    }
    Vue.prototype._s=function(value){
        if(typeof value!=='object') return value;
        return JSON.stringify(value);
    }

    Vue.prototype._render=function(){
        // console.log('render');
        // 通过 ast 语法树转译后生成的 render
        // 当渲染时会去实例中取值,我们就可以将属性和视图绑定在一起
        return this.$options.render.call(this);
    }
}

export function mountComponent(vm,el){
    // 将 el(真实DOM) 挂载在实例上
    vm.$el=el;
    /* 1.调用 render 方法产生虚拟 DOM
    vm._render();// vm.$options.render → 虚拟节点
    2.根据虚拟 DOM 产生真实 DOM
    vm._update();// 虚拟节点 → 真实节点
    3.插入到 el 元素中 */
    const updateComponent=()=>{
        vm._update(vm._render());
    }
    // 创建渲染 watcher
    const watcher=new Watcher(vm,updateComponent,true);// true标识是一个渲染过程
    // console.log(watch);
}


// 调用配置好的钩子函数
export function callHook(vm,hook){
    const handlers=vm.$options[hook];
    // console.log(handlers);
    if(handlers){
        handlers.forEach(handler=>handler.call(vm));
    }
}