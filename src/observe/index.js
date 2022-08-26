import { newArrayProto } from "./array";

// 将数据data变成可观察的
class Observe{
    constructor(data){
        // Object.defineProperty只能劫持已经存在的属性(Vue2中会单独写一些api:$set)
        // 将Observe的实例挂载到data上,间接给数据加了标识是否被观测
        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable:false,// 不可枚举,防止遍历属性时死循环
        });
        if(Array.isArray(data)){
            /* 修改数组很少用索引来操作数据,全部做劫持会浪费性能
            用户一般修改数组,都是通过方法来修改 */
            // 需要保留数组原有的特性,并且可以重写部分方法
            data.__proto__=newArrayProto;
            // 如果数组中有元素是对象,可以监控到对象的变化
            this.observeArray(data);
        }else{
            this.walk(data);
        }
        
    }
    walk(data){// 遍历对象,对属性依次劫持
        Object.keys(data).forEach(key=>defineReactive(data,key,data[key]));
    }
    observeArray(data){// 观测数组
        data.forEach(item=>observe(item));
    }
}

// 数据劫持
export function defineReactive(target,key,value){
    observe(value);// 递归实现深度属性劫持,对所有对象都进行数据劫持
    Object.defineProperty(target,key,{
        get(){
            console.log('getKey',key);
            return value;
        },
        set(newValue){
            if(newValue===value) return;
            observe(newValue);// 赋值的是对象,则再次进行代理
            console.log('setKey',key);
            value=newValue;
        }
    });
}

// 对传入的对象进行劫持
export function observe(data){
    if(typeof data!=='object'||data==null){return};
    if(data.__ob__ instanceof Observe) return data.__ob__;
    // 判断对象是否被劫持(如果被劫持过了,那就不需要再劫持了)
    return new Observe(data);
}