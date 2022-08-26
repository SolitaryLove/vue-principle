import { initState } from "./state";

// 初始化
export function initMixin(Vue){ // 给Vue增加init方法
    Vue.prototype._init=function(options){
        const vm=this;

        // 以$开头的方法或属性表示挂载在实例上
        vm.$options=options;// 获取用户的配置

        // 初始化状态
        initState(vm);
    }
}

