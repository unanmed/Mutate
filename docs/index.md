# Mutate使用教程

[谱面编写文档](./edit.md)

## 安装Mutate

使用npm

```cmd
npm i mutate-game
```

使用pnpm

```cmd
pnpm add mutate-game
```

script标签引入，使用本地文件

```html
<script src="your mutate.js path"></script>
```

使用cdn

```html
<script src="https://cdn.jsdelivr.net/npm/mutate-game/dist/mutate-game.iife.js"></script>
```

使用后两种方法的时候，不再需要import引入，直接使用全局变量`Mutate`即可，例如`Mutate.core.create(canvas)`

> 该游戏暂不支持使用yarn安装

## 创建一个mutate游戏

### 准备工作

为了让`mutate`能够在你的页面上运行，首先需要一个`canvas`，`mutate`以`canvas`为基础运行

当然，`mutate`对这个画布还是有一定的要求的，它的长宽比需要是`16:9`，如果不是，那么会在不增大画布长宽的前提下自动调整画布的大小。同时，手机端的判定在画布上，因此该画布不应当被遮挡，且其`pointer-event`不能是`none`

注意，`mutate`运行时其长为`1920`，宽为`1080`，如果画布大小不为该值，会自动放大或缩小（并不会影响清晰度）

### 引入mutate

你可以很轻松地导入它

```js
import * as mutate from 'mutate-game';
```

### 创建游戏

`mutate`拥有非常简单的api，只需几行简单的代码，就能创建一个游戏出来

```js
const game = mutate.create(canvas);
```

这样，你就在一个`canvas`上创建了一个mutate游戏。但是只创建当然不行，你还没有加载音乐和谱面文件

你可以通过以下简单的一行代码来加载音乐和谱面文件

```js
await game.load('your music url', 'your mtt url');
```

其中第一个参数是音乐路径，第二个参数是谱面路径，谱面路径的后缀名一般为`.mtt`

之后，你只需要开始游戏就可以了

```js
game.start();
```

### 初始配置

`mutate`拥有一个初始配置选项，为`create`的第二个参数，它是一个对象，包含以下内容

1. `noteScale`: 音符的大小，默认为1
2. `noteWidth`: 音符的宽度，其中电脑端默认为`150px`，移动端为`200px`
3. `perfect`: 完美判定区间，默认为50
4. `good`: 好的判定区间，默认为80
5. `miss`: miss判定区间，默认为120

### core上面的方法和属性

常用方法：

1. `async load()`上面已经介绍过了
2. `start()`开始游戏
3. `pause()`暂停游戏
4. `resume()`继续游戏
5. `async restart()`重开游戏
6. `end()`结束游戏，取消与canvas的绑定
7. `getScore(): number`获取分数，分数计算方式暂不能自定义，目前的计分方式为：`900000 音符分（perfect算100%的分，good算50%的分） + 100000 连击分（最大连击 / 物量 * 100000）`
8. `setSound(type: NoteType, url: string)`设置特定类型音符的打击音效，url为音效地址
9. `getDetail()`获得成绩的详细信息，有多少个`perfect` `good` `miss` `late` `early`，注意`late`和`early`只有在不是`perfect`的情况下才会被记录

常用属性：

1. `status: MutateStatus`游戏状态，包括`pre` `playing` `pause` `exit`，分别表示未开始、正在游戏、暂停、已结束
2. `time: number`音乐的毫秒数
3. `length: number`谱面物量
4. `ended: boolean`游戏是否已经结束

以下为只读属性

1. `isMobile: boolean`是否为移动端。该游戏根据画面的长宽判断是否为移动端，长>宽则为电脑端，否则为手机端
2. `target: HTMLCanvasElement`与游戏绑定的画布
3. `ctx: CanvasRenderingContext2d`画布的context
4. `width: number`游戏宽度
5. `height: number`游戏高度
6. `scale: number`游戏放缩比例，`1920 * 1080`为1
7. `noteScale: number`音符放缩比例，该项可在初始配置中设置
8. `noteWidth`音符宽度，默认电脑端为150，手机端为200，可在初始配置中设置
9. `drawScale`音符的绘制比例，为游戏放缩比例*音符放缩比例
10. `drawWidth`音符的绘制宽度
11. `halfWidth`音符绘制宽度的一半
12. `drawHeight`音符的绘制高度
13. `halfHeight`音符绘制高度的一半
14. `topWidth`音符上部的宽度（游戏自带的绘制函数绘制出的音符与`phigros`类似，因此有这个属性）
15. `halfTopWidth`音符上部宽度的一半
16. `multiStroke`多押时的描边样式，默认为白-金-白的渐变
17. `perfect`完美判定区间
18. `good`好的判定区间
19. `miss`miss判定区间

---

20. `ticker`游戏的ticker实例，ticker在后面会有介绍
21. `ac`游戏的音频处理模块
22. `chart`游戏的谱面处理模块
23. `renderer`游戏的渲染模块

## 模块

`mutate`有很多模块及自定义内容，下面会一一介绍

### 动画

动画是`mutate`的一个核心模块，它简单但功能强大，游戏中几乎所有的动画都由它来实现，当然你也可以使用这个功能去做一些其它的事情。

动画的核心是一个类`mutate.animate.AnimationBase`，它是一个高度自定义化的类。

#### 动画属性

首先，说到动画，就一定会有一个作用属性。`AnimationBase`自身提供了4个系统自带的属性，分别是`x` `y` `angle` `size`，它们分别表示横坐标、纵坐标、旋转角度、放缩大小。当你创建了一个`AnimationBase`实例（这里命名为`ani`）后,你可以通过`ani.x` `ani.y` `ani.angle` `ani.size`来获取，注意这些属性理论上是只读的

你还可以自定义动画属性，你可以通过调用`ani.register(key: string, initValue: number)`来注册一个新的动画属性，注意注册后的属性会被保存在`ani.custom`中。其中`key`是属性名称，可以与系统属性重名，`initValue`是属性的初始值

#### 速率曲线

这个动画的核心是速率曲线。虽说叫做速率曲线，但其实是完成度曲线，它是一个函数，输入一个\[0,1\]间的数值，输出一个\[0,1\]间的数值（当然也可以超过这个区间，但一般来讲不要超过）。输入值表示了动画在时间上的完成度，输出值，也就是函数的返回值表示了动画在过程上的完成度。

`mutate`内置了丰富的速率曲线生成函数，这些函数可以根据输入的参数输出对应的速率曲线函数。它们处于`mutate.timing`中，包括以下内容：

1. 线性渐变函数  `linear()`，该函数返回一个线性变化函数

2. 三角渐变函数  `trigo(type: 'sin' | 'sec', mode: EaseMode)`，该函数返回一个指定属性的三角函数变化函数，其中`EaseMode`可以填`in` `out` `in-out` `center`，分别表示 `慢-快`  `快-慢`  `慢-快-慢` `快-慢-快`

3. 幂函数渐变  `power(n: number, mode: EaseMode)`，该函数返回一个以 $ x^n $ 变化的函数，n是指数

4. 双曲渐变函数  `hyper(type: 'sin' | 'tan' | 'sec', mode: EaseMode)`，该函数返回一个双曲函数，分别是 `双曲正弦` `双曲正切` `双曲正割`

5. 反三角渐变函数  `inverseTrigo(type: 'sin' | 'tan', mode: EaseMode)`，该函数返回一个反三角函数

6. 贝塞尔曲线渐变函数  `bezier(...cps)`，参数为贝塞尔曲线的控制点纵坐标（横坐标不能自定义，因为一个时刻不能对应多个速率）示例：`bezier(0.4, 0.2, 0.7); // 三个控制点的四次贝塞尔曲线渐变函数`

7. 震动变化函数  `shake(power: number, timing: TimingFn)`，它可以输出一个来回震动的速率函数，其中`power`是可能的最大震动量，`timing`是震动量的变化函数

当然，你也可以自定义速率曲线，只要满足`(input: number) => number`即可

#### 路径曲线

除了速率曲线，`mutate`的动画引擎还提供了一个路径曲线，它允许`x`和`y`在一定的路径下移动。它与速率曲线类似，只不过输出值变成了\[x,y\]数组。`mutate`内置了两种路径曲线，它们在`mutate.path`中，包括：

1. 圆形运动 `circle(r: number, n: number = 1, timing: TimingFn = () => 1, inverse: boolean = false)`，`r`是圆的半径，`n`是圈数，`timing`描述半径大小的变化，`inverse`说明了是否翻转`timing`函数，后面三个参数可以不填

2. 贝塞尔曲线 `bezierPath(start: Point, end: Point, ...cps: Point[])`，其中`start`和`end`是起点和结束点，应当填入`[x, y]`数组，`cps`是控制点，也是`[x, y]`数组，示例：`bezierPath([0, 0], [200, 200], [100, 50], [300, 150], [200, 180])`，这是一个起点为`[0, 0]`，终点为`[200, 200]`，有三个控制点的四次贝塞尔曲线

#### 动画设置

为了让动画能够正确运行，需要对动画进行设置，包括时间、相对模式等，请看以下示例

```js
ani.time(1000) // 设置动画时间，默认为0，不过注意当时间为0时执行动画仍需要1帧的时间
    .absolute() // 设置为绝对模式，相对模式为relative，默认为绝对模式，注意相对模式下属性为相加关系
    .mode(linear()) // 设置速率曲线，默认为线性变化
```

如果是震动变化的话（这里认为作用于坐标，如果不是，请依然按照上面的方式进行），请使用`ani.mode(shake(...), true)`

#### 运行动画

以上准备工作做完之后，我们就可以运行动画了，请看以下示例

```js
ani.move(100, 100); // 执行运动到100,100的动画
```

没错！运行动画就是这么简单！这样的话它的坐标就会按照指定的方式运动了。引擎本身提供了五种动画方式，分别是：

1. `move(x: number, y: number)`运动到某个点
2. `scale(size: number)`放缩
3. `rotate(angle: number)`旋转
4. `moveAs(path: PathFn)`按照路径函数移动，使用该动画时请先将相对模式改为相对
5. `shake()`震动

当然，还有运行自定义属性的动画的函数，它是`ani.apply(key: string, n: number)`，其中`key`是动画属性，`n`是动画的目标值

#### 等待

很多时候我们需要等待某个动画执行完毕，当然这个引擎也提供了这个功能，共有三种等待方式

1. `ani.n(n: number)`，等待n个动画执行完毕
2. `ani.w(type: string)`，等待某种动画执行完毕
3. `ani.all()`，等待所用动画执行完毕

他们都是`async function`，所以请使用`await`来执行等待

除此之外，在`mutate.animate`中还提供了一个等待函数`sleep(time: number)`，它允许你等待指定毫秒数，同样也是`async function`

#### 监听

你可以使用`ani.listen(type: string, fn: (e: AnimationBase) => void)`来监听动画信息，由于不常用，这里便不再赘述。

#### 绘制

通过上述描述，你会发现这个动画引擎并不参与绘制，因此绘制需要单独完成，你可以通过`ani.ticker.add(fn: (time: number) => void)`来添加绘制函数，其中`time`是自从这个动画被创建之后经过的毫秒数

### 判定

你可以修改某个特定音符的判定时间或其它配置，一般这个操作会在写谱的时候进行

### 渲染与物体

渲染主要分为三个部分：`camera` `base` `note`，它们都是`AnimationBase`的继承类，我们一一介绍

#### camera

摄像机，控制了画布整体的偏移等，相比于`AnimationBase`，它多了一个动画属性`css`，这意味着你可以直接通过它来设置画布的`css特效`，它的使用也很简单：

```js
game.chart.camera.css(`
    background-color: #000;
    border: 2px solid #fff;
    opacity: 0.6;
`)
```

没错！就像你写css的时候完全一样，不需要一个个地设置了

除此之外，摄像机还有个`save()`和`restore()`方法，与`CanvasRenderingContext2d`上的方法类似

#### base

基地，是`mutate`的核心物体之一，他有5个自定义动画属性`r` `g` `b` `a` `radius`，分别表示它的颜色和半径

你还可以通过`base.setRadius(r: number)`来设置其半径，`base.setSpeed(v: number)`来设置其旋转速度，单位为`bpm`，`base.rgba(r?: number, g?: number, g?: number, a?: number)`来设置其颜色。注意速度是立刻生效，不受动画影响，其余两个均是1帧动画

如果想要获得基地的角度，请使用`base.calRad()`，它会返回当前游戏时刻的基地旋转角度

这个上面没有什么常用的属性，硬要说的话就一个`note.bpm`吧，表示了旋转速度

#### note

音符，有一个自定义动画属性`opacity`，它控制音符的不透明度。不过说到底这也只是一个名字，使用的时候还是想怎么用怎么用，把它当成音符大小也没人管（

音符的方法较多，下面会一一介绍

1. `note.setSpeed(s: number)`设置音符的流速
2. `note.perfect()` `note.good()` `note.miss()`判定音符为完美、好、错过
3. `note.filter(f: string)`，与`CanvasRenderingContext2d.filter`相同，本质上也是设置这个，当然设置不设置还是要看渲染函数
4. `note.opacity(a: number)`，用1帧的时间将不透明度设置为目标值。如果想要动画，就用`note.apply()`，毕竟音符也是`AnimationBase`的继承
5. `note.shadow(x: number, y: number, blur: number, color: string)`设置音符的阴影。注意在系统默认的渲染函数下是无效的
6. `note.calDistance(): number`获得note距离基地的距离，当然不计算由于动画产生的距离
7. `note.calPosition(): [number, number, number]`获得note的绝对位置，不计算动画产生的位移，当然摄像机旋转之后就不一定相对左上角了，第三项是距离，当距离小于0时三者都是`NaN`，当音符没有打击时间时，距离为`NaN`

note也有不少常用属性

1. `speed: number`音符流速，单位是每秒多少像素
2. `res: string`perfect or good or miss，未打击的时候是`pre`
3. `detail: string`在good or miss的前提下是提前还是过晚，未打击时是`early`
4. `multi: boolean`当前音符是否是多押音符
5. `noteType: NoteType`音符类型，有`tap` `drag` `hold`三种，其中`hold`目前没有内置渲染函数
6. `base: Base`所属基地
7. `noteTime?: number`打击时间，也可能没有，没有就不会被判定
8. `perfectTime` `goodTime` `missTime`三种判定时间
9. `dir: [number, number]`音符进入时的方向，形式为\[sin, cos\]

#### renderer

渲染器，负责游戏中几乎所有的渲染，是一个单例，被挂载到`mutate.renderer`上，它有着极高的自定义空间，允许你自定义渲染函数等

首先是渲染函数，它分为两种，基地渲染函数和音符渲染函数，它们的类型分别是`(base: Base) => void` `(note: BaseNote<NoteType>) => void`，与游戏绑定的画布为`base.game.ctx`和`note.base.game.ctx`。如果你想要自定义它们，请使用`renderer.setBase(fn)`和`renderer.setNote(fn)`

除了音符渲染函数，还有打击特效，打击特效是一个特殊的类型，它的类型是`{ start: number, res: string, note: BaseNote, end: boolean }`，其中`start`表示开始时间，`res`表示打击结果，是`perfect`还是`good`还是`miss`，`note`就是打击的音符，`end`表示特效是否结束，当特效绘制完毕后，你应当将其设为`true`，比如在特效绘制函数里面。设置打击特效请使用`renderer.setEffect(fn: (e: ToDrawEffect) => void)`

> 游戏中内置了`tap`和`drag`的绘制函数及三种判定的打击特效函数

`renderer`还有一个功能性函数`renderer.inGame(x: number, y: number, r: number = 10)`，可以判定在`[x,y]`坐标，半径为`10`的圆是否在游戏画面内

`renderer`中没有常用的属性

### ticker

`Ticker`是一个类，它允许一个或多个函数每帧执行一次，在所有的`AnimationBase`和`Mutate`中都挂载了它。其中`AnimationBase`的`ticker`作用是执行动画，而`Mutate`则是一些核心判定函数等。

当你想要向其中添加函数时，请使用`ticker.add(fn: (time: number) => void)`，其中`time`是自从`ticker`开始运行后（一般在new之后便会立刻开始运行）到目前经过的毫秒数。如果函数中出现了报错或`throw`，那么这个`ticker`将会立刻停止，这样可以让你更加方便地检查报错。移除函数请使用`ticker.remove(fn: (time: number) => void)`。除了这两个，还有一个方法允许你直接删除所有的函数，它是`ticker.clear()`，以及一个删除所有函数并停止运行的函数，这会使这个`ticker`不能再使用，它是`ticker.destroy()`

`ticker`中没有常用的属性

### AudioExtractor

音频处理模块，挂载到了`mutate.ac`上

顾名思义，它负责游戏的音频处理，不过一般也用不到这个模块，有兴趣可以直接翻源码

### chart

谱面处理模块，挂载到了`mutate.chart`上

它上面包含所有的基地和音符信息，以及判定模块。它一般会在游戏谱面加载完成后进行一些操作，包括解析谱面信息，预处理所有动画等。

这里有几个非常重要的方法，涉及到谱面编写

1. `register<T extends keyof TimingMode>(type: T, name: string, func: TimingMode[T])`，它允许你注册一个动画渐变函数，其中`TimingMode`包含四类渐变函数，为`timing` `generator` `path` `pathG`，分别为渐变函数、渐变函数生成函数、路径函数、路径函数生成函数，其中生成函数应当返回一个对应的渐变函数或路径函数。`name`是注册的函数名，在编写谱面时需要用到，`func`便是执行的函数
2. `registerExecute<T extends keyof ExecuteDeclare>(type: T, key: string, fn: Executer<T>)`，注册一个谱面预执行函数，预处理简易动画。它的功能是在到达动画执行时间后执行注册的执行函数，从而达到简易动画的效果。其中`type`应为`note` `base` `camera`，`Executer`为执行函数，它有两个参数，第一个是`value`，是谱面文件中传入的参数，这方面会在谱面编写文档中有详细说明；第二个是`target`，是其作用目标，例如`note`的作用目标就是`BaseNote`