import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options){// options用户传入的配置对象
    this._init(options);// 默认调用init
}

Vue.prototype.$nextTick=nextTick;

initMixin(Vue);// 扩展了init方法
initLifecycle(Vue);// 扩展了生命周期

initGlobalAPI(Vue);// 扩展了全局方法



export default Vue;