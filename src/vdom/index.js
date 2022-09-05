// 虚拟 DOM 生成器

// h()  _c()
export function createElementVNode(vm,tag,data,...children){
    if(data==null) data={};
    let key=data.key;
    if(key) delete data.key;
    return vnode(vm,tag,key,data,children,undefined);
}

// _v();
export function createTextVNode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text);
}

// AST 描述的是语法层面的转化, 它描述的是语法本身(描述 html css js)
// vnode 是描述的 dom 元素,可以增加一些自定义属性(描述 dom)
function vnode(vm,tag,key,data,children,text){
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        // ...
    }
}


// 判断两个节点是否相同
export function isSameVnode(prevVnode,nextVnode){
    return prevVnode.tag===nextVnode.tag && prevVnode.key===nextVnode.key;
}