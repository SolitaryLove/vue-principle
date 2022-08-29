let id=0;// 唯一标识

class Watcher{// 不同的组件有不同的 watcher
    // vm:Vue实例 fn:render函数
    constructor(vm,fn){
        this.id++;
    }
}

export default Watcher;