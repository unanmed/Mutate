# 谱面编写参考

谱面的后缀名一般为`.mtt`，为`json`格式，类型为

```ts
// 谱面文件的动画类型
type MTTAnimate = Array<{
    custom: boolean; // 是否是自定义
    start: number; // 开始时间
    type: string; // 动画的名称，如果不是自定义，就是'move' 'rotate' 'resize' 'moveAs' 'shake'的其中一个，如果是，一般就是属性名
    time: number; // 执行时长
    n: number; // 目标值，在不是'move' 'moveAs'的前提下
    mode: {
        // 渐变函数
        fnType: 'generator' | 'timing'; // generator是timing生成函数，在路径模式下，此项依然必填，表示路径进度
        fn: string; // timing或generator函数名称
        args: any[]; // timing函数参数列表
        pathType?: 'path' | 'pathG'; // 路径函数类型，pathG是路径生成函数，是否是路径由fn是否为'moveAs'决定
        pathFn?: string; // path或pathG函数名称
        pathArg?: any[]; // 参数列表
        // 以上内容应当在游戏中注册，注册方法在chart一栏有说明，之后也会详细说明其运作机理
    };
    relation: 'absolute' | 'relative'; // 相对模式
    first?: boolean; // 是否将动画插入到当前对象的所有动画的开头
    shake?: boolean; // 是否是震动变化
    x?: number; // 移动时的横坐标
    y?: number; // 移动时的纵坐标
}>;

// 这个是谱面文件的类型
type MTT = {
    option: {
        // 全局设置
        background?: string; // 背景色
    };
    bases: Array<{
        // 所有的基地
        id: string; // 基地的id
        x: number; // 初始横坐标
        y: number; // 初始纵坐标
        angle: number; // 初始旋转角度
        r: {
            // 简易半径变化方式，索引表示变化时间，值表示变化到的目标值，动画时间1帧
            [time: number]: number;
        };
        bpm: {
            // 简易旋转速度变化方式，同上
            [time: number]: number;
        };
        rgba: {
            // 同上
            [time: number]: [number, number, number, number];
        };
        filter: {
            [time: number]: string;
        };
        animate: MTTAnimate; // 所有的动画
    }>;
    notes: Array<{
        base: string; // 所属基地
        type: NoteType; // note类型，tap drag hold
        config?: {
            playTime?: number; // 打击时间
            perfectTime?: number; // perfect判定区间
            goodTime?: number; // good判定区间
            missTime?: number; // miss判定区间
            time?: number; // 长按的时间
        };
        speed: {
            // 建议流速变化方式
            [time: number]: number;
        };
        filter: {
            // 在特定时间设置滤镜为，无动画
            [time: number]: string;
        };
        shadow: {
            // 阴影
            [time: number]: {
                x: number;
                y: number;
                blur: number;
                color: string;
            };
        };
        opacity: {
            // 不透明度
            [time: number]: number;
        };
        animate: MTTAnimate; // 动画
    }>;
    camera: {
        id: string; // 摄像机id
        animate: MTTAnimate; // 动画
        css: {
            // 在特定时间设置css，写法与css一致
            [time: number]: string;
        };
    };
};
```

## 初始配置

> `option`配置项

目前包括：

1. `background`背景色

## 基地

> `bases`配置项

类型已经在上面提到，不再需要详细说明

## 音符

> `notes`配置项

其中`filter`与`CanvasRenderingContext2d.filter`写法相同

## 摄像机

> `camera`配置项

其中`css`项与`css`写法完全相同，例如`opacity: 0.8;`

## 动画

> 动画配置项及简易动画配置项

以上三者都含有这个配置项，我们先来说明执行原理。

首先，我们注册了一些渐变函数和预执行函数。我们注意到动画中有一个`mode`属性，它便是控制渐变函数的。首先`type`说明了要执行的类型，这与`register`的第一个参数对应。接下来是`fn`和`pathFn`，它是注册的函数名称，与`register`的第二个参数对应。然后是`args`和`pathArg`，它们是在执行注册的函数时传入的所有参数，相当于`Function.apply`的第二个参数。例如，当`type`为`generator`，`fn`是`power`，`args`是`[3, 'in-out']`时，实际执行的函数是`power(3, 'in-out')`，返回一个渐变函数，供动画使用。

对于预执行函数，其机理类似，不过它的对象是每个时间点的简易动画，相当于在游戏加载过程中，指定好动画执行的时间点，然后在对于时间执行注册的动画。它对应的注册函数是`registerExecute`，第一个参数对应的是目标类型，为`note` `base` `camera`的其中一个，第二个参数是其作用的属性，例如`base`含有`bpm`这个可作用属性，第三个参数就是执行的函数。我们发现每个简易动画都是`时间: 值`的键值对，那么当到达对应时间时，这个值就会当作执行函数的第一个参数传递过去，而第二个参数就是其作用的对象。例如一个基地的一个键值对为`1000: [100, 200, 150, 0.5]`，注册的对应的执行函数为`([r, g, b, a]: number[], target: Base) => target.rgba(r, g, b, a)`，那么到达 1000 毫秒这个时间点时，就会将`[100, 200, 150, 0.5]`这个值作为执行函数的第一个参数传递过去，第二个参数便是其作用的基地

以上是二者的执行原理，其余的较为简单，不再赘述

## 自定义简易动画

如上一栏所说，简易动画的执行由`registerExecute`完成，因此只需要注册一个对应属性的预执行函数，在谱面文件中就可以写自己定义的简易动画了，与系统自带的写法类似
