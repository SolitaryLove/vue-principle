import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";

// 创建真实节点的属性
function patchProps(el,props){
    for(let key in props){
        // 处理 style 属性
        if(key==='style'){
            for(let styleName in props.style){
                el.style[styleName]=props.style[styleName];
            }
        }else{
            el.setAttribute(key,props[key]);
        }
        
    }
}

// 创建真实节点
function createElm(vnode){
    let {tag,data,children,text}=vnode;
    if(typeof tag==='string'){// 标签元素
        // 将真实节点和虚拟节点对应起来
        vnode.el=document.createElement(tag);
        // 更新节点属性
        patchProps(vnode.el,data);
        // 递归生成子节点
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child));
        });
    }else{// 文本元素
        vnode.el=document.createTextNode(text);
    }
    return vnode.el;// 返回真实节点
}

// 虚拟 DOM → 真实 DOM
function patch(oldVNode,vnode){
    // 初渲染流程
    const isRealElement=oldVNode.nodeType;
    if(isRealElement){
        const elm=oldVNode;// 获取真实元素
        const parentElm=elm.parentNode;// 获取父元素
        let newElm=createElm(vnode);// 创建并获取新元素
        // console.log(newElm)
        parentElm.insertBefore(newElm,elm.nextSibling);// 将新元素插入到旧元素之前
        parentElm.removeChild(elm);// 删除旧元素
        
        return newElm;
    }else{
        // diff 算法
    }
}

export function initLifecycle(Vue){
    Vue.prototype._update=function(vnode){
        // console.log('update',vnode);
        const vm=this;
        const el=vm.$el;
        // console.log(el);
        // patch 既有初始化的功能,又有更新的功能
        // 用 vnode 创建新的节点替换 el(根节点 DOM)
        vm.$el=patch(el,vnode);
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
    // 将 el 挂载在实例上
    vm.$el=el;
    /* 1.调用 render 方法产生虚拟 DOM
    vm._render();// vm.$options.render → 虚拟节点
    2.根据虚拟 DOM 产生真实 DOM
    vm._update();// 虚拟节点 → 真实节点
    3.插入到 el 元素中 */
    const updateComponent=()=>{
        vm._update(vm._render());
    }
    const watch=new Watcher(vm,updateComponent,true);// true标识是一个渲染过程
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