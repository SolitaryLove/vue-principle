import { isSameVnode } from ".";

// 比较的方式:同层比较 遍历的方式:深度优先; 

// 比较并创建真实节点的属性
export function patchProps(el,oldProps={},props={}){
    // 旧节点属性中多余的 style 需要删除
    let oldStyles=oldProps.style;
    let newStyles=props.style;
    for(let key in oldStyles){
        if(!newStyles[key]){
            el.style[key]='';
        }
    }
    // 旧节点属性中多余的属性需要删除
    for(let key in oldProps){
        if(!props[key]){
            el.removeAttribute(key);
        }
    }
    // 用新节点的属性覆盖旧节点的属性
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
export function createElm(vnode){
    let {tag,data,children,text}=vnode;
    if(typeof tag==='string'){// 标签元素
        // 将真实节点和虚拟节点对应起来
        vnode.el=document.createElement(tag);
        // 更新节点属性
        patchProps(vnode.el,{},data);
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
// 旧虚拟 DOM VS 新虚拟 DOM
export function patch(oldVNode,vnode){
    // 初渲染流程
    const isRealElement=oldVNode.nodeType;
    if(isRealElement){// 判断是否为真实元素
        const elm=oldVNode;// 获取真实元素
        const parentElm=elm.parentNode;// 获取父元素
        let newElm=createElm(vnode);// 创建并获取新元素
        // console.log(newElm)
        parentElm.insertBefore(newElm,elm.nextSibling);// 将新元素插入到旧元素之前
        parentElm.removeChild(elm);// 删除旧元素
        
        return newElm;
    }else{
        // diff 算法
        // 1.两个节点不是同一个节点,直接删除旧的替换上新的(没有后续比对了)
        // 2.两个节点是同一个节点(判断节点的 tag 和 key),比较两个节点的属性是否有差异(复用旧节点的属性,将差异的属性更新)
        // 3.节点比较完毕后就需要比较它们的子节点

        patchVnode(oldVNode,vnode);
    }
}

// 比较虚拟节点
function patchVnode(oldVNode,vnode){
    // 判断是否为相同节点
    if(!isSameVnode(oldVNode,vnode)){
        // 用旧节点的父级进行替换操作,将旧节点替换成新节点
        let el=createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el,oldVNode.el);
        return el;// 返回新节点
    }

    let el=vnode.el=oldVNode.el;// 复用旧节点的元素

    // 文本元素的情况,期望比较一下文本的内容
    if(!oldVNode.tag){// 是文本
        if(oldVNode.text!==vnode.text){
            el.textContent=vnode.text;// 用新的文本覆盖掉旧的
        }
    }

    // 标签元素的情况 需要比对标签的属性
    patchProps(el,oldVNode.data,vnode.data);

    // 比较子节点,分不同情况
    // (1)一方有子节点,一方没子节点
    // (2)两方都有子节点
    let oldChildren=oldVNode.children||[];
    let newChildren=vnode.children||[];
    if(oldChildren.length>0 && newChildren.length>0){
        // 完整的 diff 算法,需要比较新旧节点的子节点
        updateChildren(el,oldChildren,newChildren);
    }else if(newChildren.length>0){ // 旧节点没有子节点
        // 插入新节点的所有子节点
        mountChild(el,newChildren);
    }else if(oldChildren.length>0){ // 新节点没有子节点
        // 删除旧节点的所有子节点
        unmountChild(el,oldChildren);
    }

    return el;
}

// 插入子节点
function mountChild(el,newChildren){
    for(let i=0;i<newChildren.length;i++){
        let child=newChildren[i];
        el.appendChild(createElm(child));
    }
}
// 删除子节点
function unmountChild(el,oldChildren){
    for(let i=0;i<oldChildren.length;i++){
        el.removeChild(oldChildren[i].el);
    }
}
// 比较并更新子节点
function updateChildren(el,oldChildren,newChildren){
    // 我们操作列表,经常会有 push shift pop unshift reverse sort 这些方法
    // 比较子节点时为了提高性能,做一些特殊优化
    // Vue2 中采用双指针的方式比较两个子节点
    let oldStartIndex = 0;
    let newStartIndex = 0;
    let oldEndIndex = oldChildren.length-1;
    let newEndIndex = newChildren.length-1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];
    // console.log(oldStartVnode,newStartVnode,oldEndVnode,newEndVnode);

    // 构建旧节点的子节点 key→index 映射表
    function makeIndexByKey(children){
        let map={};
        children.forEach((child,index)=>{
            map[child.key]=index;
        });
        return map;
    }
    let map=makeIndexByKey(oldChildren);
    // console.log(map);

    // 在给动态列表添加 key 的时候,要尽量避免使用索引,可能会发生错误复用
    while(oldStartIndex <= oldEndIndex && newStartIndex <=newEndIndex){
        // 双方有一方头指针,大于尾部指针则停止循环
        if(!oldStartVnode){
            oldStartVnode=oldChildren[++oldStartIndex];

        }else if(!oldEndVnode){
            oldEndVnode=oldChildren[--oldEndIndex];

        }else if(isSameVnode(oldStartVnode, newStartVnode)){ // 从开头比较
            // 如果是相同节点,则递归比较子节点
            patchVnode(oldStartVnode, newStartVnode);
            oldStartVnode = oldChildren[++oldStartIndex];
            newStartVnode = newChildren[++newStartIndex];

        }else if(isSameVnode(oldEndVnode, newEndVnode)){ // 从结尾比较
            patchVnode(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];

        }else if(isSameVnode(oldEndVnode, newStartVnode)){ // 旧尾比新头
            patchVnode(oldEndVnode, newStartVnode);
            // insertBefore 具备移动性,会将原来元素移动走
            // 将旧尾移动到旧头之前
            el.insertBefore(oldEndVnode.el, oldStartVnode.el);
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStartIndex];

        }else if(isSameVnode(oldStartVnode, newEndVnode)){ // 旧头比新尾
            patchVnode(oldStartVnode, newEndVnode);
            // 将旧头移动到旧尾之后
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newStartIndex];

        }else{ // 乱序比对
            // 根据旧的列表做一个映射关系,用新的去找,找到则移动,找不到则添加,最后多余的就删除
            let moveIndex=map[newStartIndex.key];
            if(moveIndex!==undefined){ // 如果拿到则说明是要移动的索引
                let moveVnode=oldChildren[moveIndex]; // 找到对应的虚拟节点进行复用
                el.insertBefore(moveVnode.el,oldStartVnode.el); // 插入到旧头之前
                // 如果直接删除数组中的元素,可能会导致数组塌陷
                oldChildren[moveIndex]=undefined; // 表示这个节点已经移动走了
                patchVnode(moveVnode,newStartVnode);// 比对属性和子节点
            }else{ // 如果找不到则直接创建新的节点插到到旧子点之前
                el.insertBefore(createElm(newStartVnode),oldStartVnode.el);
            }
            newStartVnode=newChildren[++newStartIndex];
        }
    }
    
    if(newStartIndex <= newEndIndex){ // 新的多了,多余的就插入进去
        for(let i=newStartIndex; i<=newEndIndex; i++){
            let childEl = createElm(newChildren[i]);
            // 这里可能是像后追加,还有可能是向前追加(获取下一个元素作为参照物)
            let anchor = newChildren[newEndIndex+1]?newChildren[newEndIndex+1].el:null;
            el.insertBefore(childEl,anchor);// anchor为null时则会认为是appendChild
        }
    }
    if(oldStartIndex <= oldEndIndex){ // 旧的多了,多余的就删除
        for(let i=oldStartIndex; i<=oldEndIndex; i++){
            if(oldChildren[i]){
                let childEl = oldChildren[i].el
                el.removeChild(childEl);
            }
        }
    }
}