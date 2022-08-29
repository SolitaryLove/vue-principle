// 模板编译

import { parseHTML } from "./parse";

export function compileToFunction(template){
    // console.log(template)
    // 1.将template转换成ast语法树
    let ast=parseHTML(template);
    // console.log(ast);
    
    // 2.生成render方法(render方法执行后的结果就是虚拟DOM)
    /* render(h){
        return _c('div',{id:'app'},_c('div',{style:{color:'red'}},_v(_s(nickName)+'hello')));
    } */
    // 模板引擎的实现原理: with + new Function
    let code=codegen(ast);
    /* 
        with(vm){
            _v(_s(name)+'hello') → _v(_s(vm.name)+'hello')
        }
    */
    code=`with(this){return ${code}}`;// 传入 this → vm
    let render=new Function(code);
    return render;
    
}

// 生成渲染函数所需的参数代码
function genProps(attrs){
    let str=''// {name,value}
    for(let i=0;i<attrs.length;i++){
        let attr=attrs[i];
        // style属性需要特殊处理
        if(attr.name==='style' && (typeof attr.value)==='string'){
            // color:red;background:blue → {color:'red';background:'blue'}
            let obj={};
            attr.value.split(';').forEach(item=>{
                let [key,value]=item.split(':');
                obj[key]=value;
            });
            attr.value=obj;
        }
        str+=`${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`;// a:b,c:d, → a:b,c:d
}
function genChildren(children){
    if(children){
        return children.map(child=>gen(child)).join(',')
    }
}
const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g;// {{}}
function gen(node){
    if(node.type===1){// 子元素为节点时
        return codegen(node);
    }else{// 子元素为文本时
        let text=node.text;
        if(!defaultTagRE.test(text)){// 不包含{{}}的文本
            return `_v(${JSON.stringify(text)})`;
        }else{// 包含{{}}的文本
            //_v(_s(name)+'hello'+_s(name))
            let tokens=[];
            let match;
            defaultTagRE.lastIndex=0;// 重置游标位置
            let lastIndex=0;// 上一次匹配的位置
            while(match=defaultTagRE.exec(text)){
                let index=match.index;// 匹配{{}}的位置 {{name}} hello {{age}}
                if(index>lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex,index)));
                }
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex=index+match[0].length;
            }
            if(lastIndex<text.length){// {{name}} hello {{age}} world
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            // console.log(tokens);
            return `_v(${tokens.join('+')})`;
        }
    }
}

function codegen(ast){
    let children=genChildren(ast.children);
    let code=`_c('${ast.tag}',${
            ast.attrs.length>0?genProps(ast.attrs):'null'
        }${
            ast.children.length>0?`,${children}`:''
        }
    )`;
    return code;// 返回拼接完毕的函数字符串
}

