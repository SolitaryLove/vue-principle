import { newArrayProto } from "./array";
import Dep from "./dep";

// 将数据data变成可观察的
class Observe{
    constructor(data){
        // data 可能是对象或数组
        // 给每个对象都增加收集功能
        this.dep=new Dep();
        // console.log(this,data)

        // Object.defineProperty只能劫持已经存在的属性(Vue2 中会单独写一些 api:$set)
        // 将 Observe 的实例挂载到 data 上,间接给数据加了标识判定是否被观测
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


// 对数组进行递归完成依赖收集
// 解决嵌套数组无法成为响应式数据
// 深层次嵌套会递归,递归多了性能差,不存在的属性监控不到,存在的属性要重写方法,所以 vue3 → proxy
function dependArray(value){
    for(let i=0;i<value.length;i++){
        let current=value[i];
        current.__ob__ && current.__ob__.dep.depend();
        if(Array.isArray(current)){
            dependArray(current);
        }
    }
}

// 数据劫持
export function defineReactive(target,key,value){
    // childOb.dep 用来收集依赖
    let childOb=observe(value);// 递归实现深度属性劫持,对所有对象都进行数据劫持
    
    let dep=new Dep();// 每一个属性都有一个 dep
    
    Object.defineProperty(target,key,{
        get(){
            // console.log('getKey',key);
            // 只能在模板中取值时才会做依赖收集(渲染取值时触发getter完成依赖收集)
            if(Dep.target){
                dep.depend();// 让该属性收集器记住当前的 watcher(闭包)

                if(childOb){
                    childOb.dep.depend();// 让数组和对象本身也实现依赖收集

                    if(Array.isArray(value)){
                        // 对数组中包含数组也进行依赖收集
                        dependArray(value);
                    }
                }
            }
            return value;
        },
        set(newValue){
            if(newValue===value) return;
            observe(newValue);// 赋值的是对象,则再次进行代理
            // console.log('setKey',key);
            value=newValue;
            // 通知更新
            dep.notify();
        }
    });
}


// 对传入的对象进行劫持
export function observe(data){
    // typeof arr='object'
    if(typeof data!=='object'||data==null){return};
    // 判断对象是否被劫持(如果被劫持过了,那就不需要再劫持了)
    if(data.__ob__ instanceof Observe) return data.__ob__;
    return new Observe(data);
}