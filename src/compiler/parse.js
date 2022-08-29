// 模板解析

const ncname=`[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture=`((?:${ncname}\\:)?${ncname})`;// 标签名

// 匹配到的分组是一个开始标签名,<xxx
const startTagOpen=new RegExp(`^<${qnameCapture}`);
// 匹配到的分组是一个结束标签名 </xxx>
const endTag=new RegExp(`^<\\/${qnameCapture}[^>]*>`);

// 标签属性 属性名 key 为第 1 分组,属性值 value 可能为第 3|4|5 分组
const attribute=/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;

const startTagClose=/^\s*(\/?)>/;// 开始标签的结束 > 自闭合标签 <br/>

// const defaultTagRE=/\{\{((?:.|\r?\n)+?)\}\}/g;// {{}}

// 对模板进行解析处理
export function parseHTML(html){// html最开始肯定是一个 <
    // console.log(html);
    /* html:
    <div id="app" style="color:red;background:yellow">
        <div style="color:orange">
            {{name}} hello {{age}} hello
        </div>
        <span>world</span>
    </div> */

    const ELEMENT_TYPE=1;// 标签元素
    const TEXT_TYPE=3;// 文本元素
    const stack=[];// 用于存放标签元素
    let currentParent;// 指向的是栈中的最后一个元素(当前父级元素)
    let root;// 根节点

    /* AST 语法树:
    {tag: 'div', type: 1, children: Array(2), attrs: Array(2), parent: null}
        attrs: (2) [{…}, {…}]
        children: (2) [{…}, {…}]
        parent: null
        tag: "div"
        type: 1
        [[Prototype]]: Object */

    // 对解析出的标签内容进行处理,最终需要转换成一颗抽象语法树
    function createASTElement(tag,attrs){
        return {
            tag,
            type:ELEMENT_TYPE,
            children:[],
            attrs:attrs,
            parent:null
        }
    }
    // 利用栈型结构来构造 ast 语法树
    function start(tag,attrs){
        // console.log(tag,attrs,'开始标签');
        let node=createASTElement(tag,attrs);// 创建一个 ast 节点
        if(!root){root=node;}// 是否为空树,是则标识为根节点
        if(currentParent){// 如果当前栈中有节点
            node.parent=currentParent;
            currentParent.children.push(node);
        }
        stack.push(node);// 压入节点
        currentParent=node;// currentParent 为栈中的最后一个元素
    }
    function chars(text){
        // console.log(text,'文本内容');
        text=text.replace(/^\s+|\s+$/g,'');
        if(!text) return;
        currentParent.children.push({
            type:TEXT_TYPE,
            text,
            parent:currentParent
        });

    }
    function end(tag){
        // console.log(tag,'结束标签');
        let node=stack.pop();// 弹出最后一个节点,校验标签是否合法
        currentParent=stack[stack.length-1];// 重新标识栈中最后一个元素
    }
  

    // 截取并删除字符
    function advance(n){ 
        html=html.substring(n);
    }


    // 解析开始标签
    function parseStartTag(){
        const start=html.match(startTagOpen);
        if(start){
            // 构建节点对象
            const match={
                tagName:start[1],
                attrs:[],
            }
            // 截取开始标签<div
            advance(start[0].length);

            // 如果不是开始标签的结束(>)就一直匹配下去(匹配所有标签属性)
            let attr,end;
            while(!(end=html.match(startTagClose))&&(attr=html.match(attribute))){
                advance(attr[0].length);
                // ||true 考虑像 disable 一类的属性值默认为 true
                match.attrs.push({name:attr[1],value:attr[3]||attr[4]||attr[5]||true});
            }
            if(end){advance(end[0].length)};// 截取开始标签的结束(>)
            // console.log(match);
            return match;
        }
        // console.log(html);
        return false;// 不是开始标签
    }
    
    // 解析标签
    while(html){
        // 如果 textEnd=0 则说明是一个开始或结束标签
        let textEnd=html.indexOf('<');// 如果 indexOf 中的索引为 0,是说明是个标签
        if(textEnd===0){
            // 开始标签的匹配结果
            const startTagMatch=parseStartTag();
            if(startTagMatch){// 解析到的开始标签
                start(startTagMatch.tagName,startTagMatch.attrs);
                continue;
            }
            // 结束标签的匹配结果
            let endTagMatch=html.match(endTag);
            if(endTagMatch){// 解析到的结束标签
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        // 如果 textEnd>0 则说明是文本的结束位置
        if(textEnd>0){
            let text=html.substring(0,textEnd);// 文本内容
            if(text){// 解析到的文本内容
                chars(text);
                advance(text.length);
            }
        }
    }
    // console.log(root);
    return root;
}

// 确认标签之间的嵌套关系
// 栈中的最后一个元素是当前匹配到开始标签的父亲


