import Dep, { popTarget, pushTarget } from "./dep";

let id=0;// 唯一标识

// 1)当我们创建渲染 watcher 的时候我们会把当前的渲染 watcher 放到 Dep.target 上
// 2)调用_render() 会取值, 触发 get

// 观察者模式
// 每个属性都有一个 dep(被观察者), watcher就是观察者(属性变化了会通知观察者更新)
class Watcher{// 不同的组件有不同的 watcher
    /* 
        vm:Vue实例
        fn:render函数 
        options:是一个渲染 watcher
    */
    constructor(vm,fn,options){
        this.id=id++;
        this.renderWatcher=options;
        this.getter=fn;// getter意味着调用这个函数可以发生取值操作
        this.deps=[];// 后续实现计算属性和一些清楚工作需要用到
        this.depsId=new Set();// 用于去重

        // 针对 computed 的 watcher 进行处理
        this.lazy=options.lazy;
        this.dirty=this.lazy;// 脏值标识
        // 如果是脏值就不用重新计算,直接使用缓存值
        this.dirty?undefined:this.get();
        this.vm=vm;// 缓存实例
        // this.get();// new 时默认调用
    }
    addDep(dep){
        // 1个组件对应多个属性,重复的属性不用记录
        let id=dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep);// watcher 记住 dep
            this.depsId.add(id);
            // watcher 已经记住 dep 并完成去重,此时让 dep 记住 watcher
            dep.addSub(this);
        }
    }
    // 让 watcher 的中 dep.depend()
    depend(){
        let i=this.deps.length;
        while(i--){
            // 让计算属性 watcher 也收集渲染 watcher
            this.deps[i].depend();
            // this.deps[i]<dep>.depend => Dep.target<watcher>.addDep(dep)
            // => this<watcher>.deps.push(dep) => dep.addSub(this<watcher>)
            // => this<dep>.subs.push(wathcher)
        }
    }
    // 求值(计算属性)
    evaluate(){
        this.value=this.get();// 获取到 computed get() 的返回值
        this.dirty=false;// 并且要更改脏值标识
    }
    // 渲染: ast语法树 → 虚拟DOM → 真实DOM
    get(){
        // 将当前 watcher 记录到 Dep.target, Dep.target 是全局唯一的
        /* Dep.target=this;// 静态属性
        this.getter();// vm._update(vm._render)会去 vm 上取值
        Dep.target=null;// 渲染完毕后就清空 */
        
        pushTarget(this);// 将当前 watcher 入栈
        // {lazy:true}时则为 computed 的 get()
        let value=this.getter.call(this.vm);// vm._update(vm._render)会去 vm 上取值
        popTarget();// 将当前 watcher 入栈

        return value
    }
    // 更新
    update(){
        // this.get();

        // 如果是计算属性
        if(this.lazy){
            // 依赖的值变化了,就标识计算属性是脏值了
            this.dirty=true;
        }else{
            queueWatcher(this);// 把当前 watcher 暂存起来
        }
        
    }
    // 调用渲染
    run(){
        this.get();
        // console.log('run');
    }
}

// 去重
let queue=[];
let has={};
let pending=false;// 防抖
function flushSchedulerQueue(){
    let flushQueue=queue.slice(0);
    queue=[];
    has={};
    pending=false;
    flushQueue.forEach(q=>q.run());
}
function queueWatcher(watcher){
    const id=watcher.id;
    if(!has[id]){// 相同 watcher 中的属性更新多次只算一次
        queue.push(watcher);
        has[id]=true;
        // 不管 update 执行多少次,但是最终只执行一轮刷新操作
        if(!pending){
            nextTick(flushSchedulerQueue);
            pending=true;
        }
    }
}


// 批处理,多次执行合成为一次
let callbacks=[];// 队列
let waiting=false;
function flushCallbacks(){
    waiting=false;
    let cbs=callbacks.slice(0);
    callbacks=[];
    cbs.forEach(cb=>cb());// 按照顺序依次执行
}

// nextTick 没有直接使用某个api,而是采用优雅降级的方式
// 内部采用顺序:promise → MutationObserver(h5的api) → setImmediate(ie) → setTimeout
let timerFunc;
if(Promise){
    timerFunc=(flushCallbacks)=>{
        Promise.resolve().then(flushCallbacks);
    }
}else if(MutationObserver){
    let observer=new MutationObserver(flushCallbacks);// 这里传入的回调是异步执行的
    let textNode=document.createTextNode(1);
    // 监控 DOM元素的变化
    observer.observe(textNode,{
        characterData:true
    });
    // DOM元素改变重新执行 new MutationObserver传入的回调
    timerFunc=()=>{
        textNode.textContent=2;
    }
}else if(setImmediate){
    timerFunc=()=>{
        setImmediate(flushCallbacks);
    }
}else{
    timerFunc=()=>{
        setTimeout(flushCallbacks);
    }
}

export function nextTick(cb){
    callbacks.push(cb);// 维护 nextTick 中的 callback 方法
    if(!waiting){
        timerFunc(flushCallbacks);
        waiting=true;
    }
}

// 需要给每个属性增加一个 dep,目的就是收集 watcher
// 1个组件中有多个属性, n个属性会对应一个组件(n个 dep 对应一个 watcher)
// 1个属性对应着多个组件(1个 dep 对应多个 watcher)
// 多对多关系

export default Watcher;