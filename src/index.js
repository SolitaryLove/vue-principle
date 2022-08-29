import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";

function Vue(options){// options用户传入的配置对象
    this._init(options);// 默认调用init
}

initMixin(Vue);// 扩展了init方法
initLifecycle(Vue);// 扩展了生命周期

export default Vue;