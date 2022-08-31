import { compileToFunction } from "./compiler";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";

// 初始化
export function initMixin(Vue){ // 给Vue增加init方法
    Vue.prototype._init=function(options){
        const vm=this;

        // 以$开头的方法或属性表示挂载在实例上
        // vm.$options=options;// 获取用户的配置

        // 合并配置对象(Vue.mixin 全局混入 + $options 用户配置对象)
        // 使用 mixin 我们定义的全局指令和过滤器...都会挂载到 Vue 实例上
        vm.$options=mergeOptions(this.constructor.options,options);
        // console.log(vm.$options);

        // 调用生命周期钩子-beforeCreated
        callHook(vm,'beforeCreate'); // 内部调用的 beforeCreate 写错了就不执行

        // 初始化状态
        initState(vm);

        // 调用生命周期钩子-created
        callHook(vm,'created')

        // 元素挂载
        if(options.el){
            vm.$mount(options.el);
        }
    }

    Vue.prototype.$mount=function(el){
        const vm=this;
        el=document.querySelector(el);
        let ops=vm.$options;
        // render > template > el
        if(!ops.render){// 先进行查找有没有render函数
            let template;// 没有render函数看一下是否写了template
            if(!ops.template&&el){// 没有写template,但是写了el
                template=el.outerHTML;
            }else{
                if(el){// 如果写了template
                    template=ops.template;
                }
            }
            // 如果写了template就用template(不管哪种情况最后都会收集到模板)
            if(template){
                // 对模板进行编译
                const render=compileToFunction(template);
                // 渲染函数
                ops.render=render;
            }
        }
        // console.log(ops.render);// 最终统一成render

        mountComponent(vm,el);// 组件的挂载
        
    }
}

// runtime是不包含模板编译(template配置项)的,整个编译是打包的时候通过loader来转译.vue文件的