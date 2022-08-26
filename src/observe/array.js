// 重写数组中的部分方法

let oldArrayProto=Array.prototype;// 获取数组的原型

// newArrayProto.__proto__=oldArrayProto
export let newArrayProto=Object.create(oldArrayProto);

let methods=[// 找到所有需要重写的方法(能改变原数组的方法)
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method=>{
    newArrayProto[method]=function(...args){// 重写了数组的方法
        // 内部调用原来的方法,函数的劫持
        // push() pop() ...
        const result=oldArrayProto[method].call(this,...args);
        // 需要对数组中新增的元素进行劫持
        let inserted;
        let ob=this.__ob__;
        switch(method){
            case 'push':
            case 'unshift':
                inserted=args;
                break;
            case 'splice':// arr.splice(0,1,{a:1})
                inserted=args.slice(2);
            default:
                break;
        }
        if(inserted){// 对新增的内容两次进行观测
            ob.observeArray(inserted);
        }
        console.log('method',method);
        return result;
    }
})