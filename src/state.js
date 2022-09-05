import { observe } from "./observe";
import Dep from "./observe/dep";
import Watcher, { nextTick } from "./observe/watcher";

export function initState(vm){
    const opts=vm.$options;// 获取配置对象
    if(opts.data){
        initData(vm);
    }

    if(opts.computed){
        initComputed(vm);
    }

    if(opts.watch){
        initWatch(vm);
    }

}

// 数据初始化
function initData(vm){
    // data → function | object
    let data=vm.$options.data;
    data=typeof data==='function'?data.call(vm):data;

    vm._data=data;
    // 对数据进行劫持
    observe(data);

    // 对数据进行代理
    for(let key in data){
        proxy(vm,'_data',key);
    }
    
}
// 数据代理 vm_data → vm
function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key];
        },
        set(newValue){
            vm[target][key]=newValue;
        }
    })
}


// 计算属性初始化
function initComputed(vm){
    const computed=vm.$options.computed;

    // 将计算属性 watcher 保存到 vm 上
    const watchers=vm._computedWatchers={};

    for(let key in computed){
        let userDef=computed[key];
        
        // 我们需要监控计算属性中 get 的变化
        let computedGetMethod=typeof userDef==='function'?userDef:userDef.get;
        
        // 如果直接 new Wather 默认就会执行 fn,将计算属性和 watcher 对应起来
        watchers[key]=new Watcher(vm,computedGetMethod,{lazy:true});

        defineComputed(vm,key,userDef);
    }
}
// 挂载计算属性到实例上
function defineComputed(target,key,userDef){
    // const getter=typeof userDef==='function'?userDef:userDef.get;
    const setter=userDef.setter||(()=>{});
    // 可以通过实例拿到对应的属性
    Object.defineProperty(target,key,{
        get:createComputedGetter(key),
        set:setter
    });
}
// 计算属性根本不会收集依赖,只会让自己的依赖属性去收集依赖
function createComputedGetter(key){
    // 检测是否要执行这个 getter
    return function(){
        // 获取到对应计算属性的 watcher
        const watcher=this._computedWatchers[key];
        if(watcher.dirty){
            // 如果是脏的就去执行用户传入的函数
            watcher.evaluate();// 求值后 dirty 变为 false,下次就不求值了
        }
        // 计算属性出栈后还有渲染 watcher,应该让计算属性 watcher 里面的属性也去收集上层的渲染 wathcer
        if(Dep.target){
            watcher.depend()
        }
        return watcher.value;
    }

}


// 侦听器初始化
function initWatch(vm){
    let watch=vm.$options.watch;
    for(let key in watch){
        const handler=watch[key];// 字符串|数组|函数
        if(Array.isArray(handler)){
            for(let i=0;i<handler.length;i++){
                createWatcher(vm,key,handler[i]);
            }
        }else{
            createWatcher(vm,key,handler);
        }
    }
}
function createWatcher(vm,key,handler){
    // handler → 字符串|函数
    if(typeof handler==='string'){
        handler=vm[handler];
    }
    // key → exprOrFn
    return vm.$watch(key,handler);
}



export function initStateMixin(Vue){
    Vue.prototype.$nextTick=nextTick;

    Vue.prototype.$watch=function(exprOrFn,cb){
        // console.log(exprOrFn,cb);
        // exprOrFn → firstname:string 
        // cb → ()=>vm.firstname
        // firstname 的值变化了,直接执行 cb 函数即可
        new Watcher(this,exprOrFn,{user:true},cb);
    }
}