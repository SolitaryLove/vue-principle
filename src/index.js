import { initMixin } from "./init";

function Vue(options){// options用户传入的配置对象
    this._init(options);// 默认调用init
}

initMixin(Vue);// 扩展了init方法

export default Vue;