const strats={};

// 生命周期钩子的合并处理策略
const LIFECYCLE=[
    'beforeCreate',
    'created',
]
LIFECYCLE.forEach(hook=>{
    strats[hook]=function(p,c){
        // {} + Vue.mixin({created:function(){...}}) => {created:[fn]}
        // {created:[fn]} + Vue.mixin({created:function(){...}}) => {created:[fn,fn]}
        if(c){
            if(p){// 如果子项有且父项有
                return p.concat(c);// 合并父项和子项
            }else{// 如果子项有但父项没有
                return [c];// 将子项包装成数组
            }
        }else{// 如果子项没有则用父项
            return p;
        }
    }
})

export function mergeOptions(parent,child){
    const options={};

    for(let key in parent){
        mergeField(key);
    }
    for(let key in child){
        if(!parent.hasOwnProperty(key)){
            mergeField(key);
        }
    }

    function mergeField(key){
        // 策略模式,减少 if/else
        if(strats[key]){
            // 如果在策略中则按策略中的规则为主
            options[key]=strats[key](parent[key],child[key]);
        }else{
            // 如果不在策略中则以子项为主
            options[key]=child[key]||parent[key];// 优先采用子项,再采用父项
        }
    }

    return options;
}