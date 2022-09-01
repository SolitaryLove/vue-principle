let id=0;// 唯一标识

class Dep{
    constructor(){
        this.id=id++;
        // 属实的 dep 要收集 watcher
        this.subs=[];// 这里存放着当前属性对应的 watcher
    }
    depend(){
        // 不希望存放重复的 watcher
        // watcher 也需要记录 dep, 双向关系
        // this.subs.push(Dep.target);
        // 让 watcher 记住 dep
        Dep.target.addDep(this);// 等价于 watcher.addDep
        /* dep 和 watcher 是一个多对多关系
        一个属性可以在多个组件中使用(dep → n*watcher) 
        一个组件中可以包含多个属性,(watcher → n*dep) */
    }
    addSub(watcher){
        this.subs.push(watcher);
    }
    // 通知更新
    notify(){
        // 通知所有的 watcher 完成更新
        this.subs.forEach(watcher=>watcher.update());
    }
}


Dep.target=null;
// 维护一个关于 watcher 的栈结构
let stack=[];
export function pushTarget(watcher){
    stack.push(watcher);
    Dep.target=watcher;
}
export function popTarget(){
    stack.pop();
    Dep.target=stack[stack.length-1];
}


export default Dep;