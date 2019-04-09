上一次介绍了使用`gulp-file-include`实现了HTML模板的复用，这次我们介绍一个新的npm包来完成这项任务，会有更好的体验呢；

---------------------------------------------

## `gulp-file-include`存在的问题：

* 非JS语法；
* 循环、条件语句无法嵌套；
<!---------------------more------------------------------->

## 搭建目录结构

开始项目之前，我们先构建一下目录结构：

```
|-source  // 生产环境的资源文件夹
	|-client  // 可视资源存放的文件夹
		|-index.ejs  // 主页html 文件
		|-templates  // 可复用的html片段
		|-lib  // 第三方工具库
		|-logic  // 自定义JS逻辑代码
		|-scss  // 项目样式文件
			|-index.scss
			|-modules  // 可复用的样式文件夹
			|-images  // 各页面公共图片
			|-fonts  // 字体文件：iconfont
		|-images  // 项目示例图片
	|-server // 数据资源存放的文件夹
|-config //编辑部分配置文件：站点模板/图标
```

## 搭建复用HTML的环境

win7安装node：
![安装node与gulp][win7-node+gulp]

win7系统下安装`node`直接下一步就可以的，这是使用`gulp`的环境，先安装`node`再安装`gulp`，`gulp`是复用HTML工具的环境;

**注意：**
1. node和npm绑定安装，使用`node -v`与`npm -v`来检验是否安装成功;
2. 使用`gulp -v`检验gulp是否安装成功，如果command not found，则需要考虑设置全局变量;（正常不会，如有问题自行[百度](https://www.baidu.com/)）

----------------------------------------------------------

## gulp-ejs

建立项目根目录，本地安装gulp以及gulp-ejs、gulp-data：
![gulp-ejs][gulp-ejs]
![gulp-data][gulp-data]
```
mkdir gulpFileInclude && cd gulpEjs
npm install --save-dev gulp gulp-ejs gulp-data
```

### 建立目录结构：

如上所述构建目录：
![build structure][build-structure]

**提取模板**：

将可共用的部分提取为HTML Segments：
![stract segments][stract-segments]

**配置gulp任务**：

使用gulp来合成整体的HTML：
![set gulpfile.js][set-gulpfile]

```
var gulp = require('gulp');
var ejs = require('gulp-ejs');

gulp.task('compile-ejs', function () {
  gulp.src('../source/index.ejs')
	//生成扩展名为.html的文件
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest(PATH.dest.html));
})
```

好了，上面是使用纯静态的页面来实现HTML复用的，可以简单的提高自己的效率，使得自己写的HTML代码更加具有维护性和可复用性。

在[demo01][demo01]中查看;

### 引入数据

#### 全局变量

在`gulpfile.js`文件中传递给`ejs`第一个参数为数据对象：

```
var gulp = require('gulp');
var ejs = require('gulp-ejs');

gulp.task('compile-ejs', function () {
  gulp.src('../source/index.ejs')
	//生成扩展名为.html的文件
    .pipe(ejs({
		name:'寡人',
	}, {}, { ext: '.html' }))
    .pipe(gulp.dest(PATH.dest.html));
})
```

在各个HTML页面或片段中可以直接通过`<%= name %>`来调用该变量。

|-index.html
```
<body>
  <div>
    <%- include('./templates/header.ejs') %>
    <section>这里是内容，<%= name %></section>
    <%- include('./include/footer.ejs') %>
  </div>
</body>
```

在[demo02][demo02]中查看;

#### 局部变量

在include其它文件时传入第二个参数，类型为对象（属性名/值都必须带引号）：
```
<body>
  <div>
    <%- include('./include/header.html',{
      "name":"横竖撇捺",
      "socials": {
        "qq": "qq.com/1100000",
        "email": "email@163.com"
      }
    }) %>
    <section>这里是内容，@@name</section>
    <%- include('./include/footer.html') ->
  </div>
</body>
```
这里传入的与全局同名的参数，就近使用，即：局部覆盖全局同名变量;

|-header.html
```
<header>
  <h2>恭迎陛下：<%= name %></h2>
  <p>
    <span>@@socials.qq</span>
    <span>@@socials.email</span>
  </p>
</header>
```
|-footer.html
```
<footer>这里是尾部，<%= name %></footer>
```

============

|-生成的HTML
```
<body>
  <div>
    <header>
      <h2>恭迎陛下：横竖撇捺</h2>
      <p>
        <span>qq.com/1100000</span>
        <span>email@163.com</span>
      </p>
    </header>

    <section>这里是内容，这是全局的变量</section>
    <footer>这里是尾部，这是全局的变量</footer>
	
  </div>
</body>
```

#### 引入外部数据

通过`gulp-data`包引入外部数据；

```
var gulp = require('gulp');
var ejs = require('gulp-ejs');
var data = require('gulp-data');

gulp.task('compile-ejs', function () {
  gulp.src('../source/index.ejs')
  //引入数据；
    .pipe(data(function (file) {
      return Object.assign(
        {},
        {
          "classes": JSON.parse(fs.readFileSync('../source/json/class.json'))
        },
        {
          "itemDetails": JSON.parse(fs.readFileSync('../source/json/items.json'))
        })
    }))
	//生成扩展名为.html的文件
    .pipe(ejs({}, {}, { ext: '.html' }))
    .pipe(gulp.dest(PATH.dest.html));
})
```

|-index.html
@@loop引入模板和数据，并**循环数据**生成;
```
<body>
 	...
    <section>
      <p>这里是内容，@@name</p>
      @@loop("./include/listItem.html", "../server/data.json")
    </section>
    ...
  </div>
</body>
```
|-data.json
```
[
  { "title": "今天",
    "text":[
      "1这位刚离世的原省委书记曾把儿子下放到基层",
      "2蔡英文访尼加拉瓜或有变 台当局忧'中途断交'",
      "3上将王建平落马记：父亲老革命 儿子'包工头'",
      "4见5位正国级后 阮富仲为啥去见这位省委书记",
      "5台湾女艺人力挺辽宁舰过海峡:想射辽宁舰才无脑",
      "6天津调料造假存十余年 部分打假者'养假'",
      "7日右翼背景酒店遭中韩抵制 韩网友呼吁对其避开",
      "8攀枝花枪手局长曾在纪委工作11年 与贪官有交集",
      "9北京部署中小学幼儿园安装空气净化器试点工作",
      "10台元旦升五星红旗人士遭恐吓:当局将多方面打压"
    ]
  },
  { "title": "昨天",
    "text":[
      "1攀枝花局长枪击书记市长后自杀 公安部介入",
      "2新列车运行图今实施 全国最长高铁列车G403首发",
      "3马英九：台湾面前没有'台独' 只有要不要统一",
      "4台军官:辽宁舰若进台湾海峡 将被数百导弹瞄准",
      "5海协会原副会长:2017年变数增加 但大局可控",
      "6台学者称蔡英文支持率已崩盘 民意洪水引发危机",
      "7新加坡的装甲车在香港被扣 外交部：你坏了规矩",
      "8台湾制定艺人赴大陆表演注意事项 被讽刷存在感",
      "9河北官员海南度假身亡 曾与纪委书记'相遇'",
      "10北京城区飘雪 气象局：雪很脏尽量打伞(图)"
    ]
  },
  { "title": "一周",
    "text":[
      "1四川原省长魏宏被查 女市委书记狱中与其串供",
      "2黄奇帆辞去重庆市市长职务",
      "3江苏渔民在黄海发现某国可疑装置 举报获重奖",
      "4首集反腐大片 点了哪8个违纪纪检干部的名",
      "52017年首个断崖降级官员曝光 他犯了什么事",
      "6马兴瑞任广东省代理省长 朱小丹辞职",
      "7中国科学家取得这三项大突破 将影响你未来生活",
      "8纪检大老虎将现身中纪委反腐大片 他们都是谁？",
      "9江苏太仓副市长元旦坠亡 亲属称其近来身体不好",
      "10多省份常委班子换血 全国首位70后省委常委产生"
    ]
  }
]
```
|-listItem.html
**注意：**这里text[i]使用反引号（Esc下边的按键）包裹;
```
<section>
  <h1>@@title</h1>
  <ul>
    @@for (var i = 0; i < text.length; i++) {
      <li>`+text[i]+`</li>
    }
  </ul>
</section>
```

参考文档：
[HTML 代码复用实践](https://segmentfault.com/a/1190000003043326)
[gulp-ejs](https://www.npmjs.com/package/gulp-ejs)
[gulp-data](https://www.npmjs.com/package/gulp-data)

[win7-node+gulp]: /images/gulpFileInclude/GIF.gif "GIF"
[gulp-file-include]: /images/gulpFileInclude/localInstall.gif "localInstall"
[build-structure]: /images/gulpFileInclude/instruction.gif "instruction"
[stract-segments]: /images/gulpFileInclude/stractSegment.gif "stractSegment"
[set-gulpfile]: /images/gulpFileInclude/gulpfile.gif "gulpfile"
