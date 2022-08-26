import { observe } from "./observe/index";

export function initState(vm){
    const opts=vm.$options;// 获取配置对象
    if(opts.data){
        initData(vm);
    }
}
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