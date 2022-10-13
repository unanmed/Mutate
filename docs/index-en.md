# Tutorials for Mutate Game

In the game, `mutate` means `music` and `rotate`.

[Documentation for Chart Editing](./edit-en.md)

[中文文档](./index.md)

## Install

Use npm.

```cmd
npm i mutate-game.
```

Use pnpm.

```cmd
pnpm add mutate-game.
```

Use script tag, with local mutate.iife.js

```html
<script src="your mutate.iife.js path"></script>
```

Use cdn.

```html
<script src="https://cdn.jsdelivr.net/npm/mutate-game/dist/mutate-game.iife.js"></script>
```

There is no need to import mutate from `mutate-game` when you use script or cdn. Use global var `Mutate` instead. For example, `Mutate.core.create(canvas)`.

> Yarn is not supported.

## Create

### Preparation

To run `mutate` on your page, a canvas is needed, which is the basis of `mutate`.

The canvas aspect ratio needs to be `16:9`. If not, `mutate` will change it to `16:9` without increasing the length and width of the canvas. Besides, the mobile judgement is on the canvas, so the canvas should not be obscured and its `pointer-event` cannot be `none`.

The width of mutate is 1920, and height is 1080. If the canvas size is not this value, it will automatically zoom in or out (and will not affect sharpness).

### Import 

Just use

```js
import * as mutate from 'mutate-game';
```

### Create on Canvas

You can use the function `create` to create a mutate game.

```js
const game = mutate.create(canvas);
```

Next, you need to load the music and the chart file.

```js
await game.load('your music url', 'your mtt url');
```

The first parameter is the music path and the second parameter is the chart path, which generally has a suffix of `.mtt`

The, just to start the game.

```js
game.start();
```

### Initial Configuration

`mutate` has an initial configuration as the second parameter of `create`, which is an object containing the following options. They are all optional.

1. `noteScale`: Size of the note. default: `1`
2. `noteWidth`: Width of the note. default: `150` on pc and `200` on mobile
3. `perfect`: Perfect judgement interval. default: `50`
4. `good`: Good judgement interval. default: `80`
5. `miss`: Miss judgement interval. default: `120`

### The Methods And Properties on core

Commonly used methods:

1. `async load()`As already described above.
2. `start()`Start the game.
3. `pause()`pause the game.
4. `resume()`resume the game.
5. `async restart()`restart the game.
6. `end()`End the game and unbind to the canvas.
7. `getScore(): number`Get the score of the game. The default scoring method is: `900000 notes (perfect counts as 100% of the score, good counts as 50% of the score) + 100000 combo points (max combo / amount of notes * 100000)`.
8. `async setSound(type: NoteType, url: string)`Set the percussive sound for a specific type of note, `url` is the sound url.
9. `getDetail()`Get details of how many `perfect` `good` `miss` `late` `early`, note that `late` and `early` are only recorded if the note's result is not `perfect`.

Commonly used properties:

1. `status: MutateStatus`Game status, including `pre`, `playing`, `pause` and `exit`, indicating before started, in play, paused and finished respectively.
2. `time: number`Current music time milliseconds.
3. `length: number`The note number of the chart.
4. `ended: boolean`Whether is the game over.

以下为只读属性

1. `isMobile: boolean`Is mobile or not. The game determines if the game is mobile based on the length and width of the screen, if `length > width`, it is computer side, otherwise it is mobile side.
2. `target: HTMLCanvasElement`The canvas bound to the game.
3. `ctx: CanvasRenderingContext2d`The context of the canvas.
4. `width: number`The width of the game.
5. `height: number`The height of the game.
6. `scale: number`The game scale, `1920 * 1080` is 1.
7. `noteScale: number`Note scaling, this can be set in the initial configuration.
8. `noteWidth`Note width, default is 150 for PC, 200 for mobile, can be set in the initial configuration.
9. `drawScale`The scale of the notes, it is the game scale * note scale.
10. `drawWidth`The width of the notes to draw.
11. `halfWidth`Half of the draw width of the note.
12. `drawHeight`The height at which the notes are drawn.
13. `halfHeight`Half of the draw height of the note.
14. `topWidth`The width of the top of the note (the game's built-in draw function draws notes similar to `phigros`, hence this property).
15. `halfTopWidth`Half of the width of the top of the note.
16. `multiStroke`The stroke style for multi-hit, default is `white-gold-white gradient`.
17. `perfect`The perfect judgement interval.
18. `good`Good judgement interval.
19. `miss`The miss judgement interval.

---

20. `ticker`The game's ticker instance.
21. `ac`The game's audio processing module.
22. `chart`The game's spectral processing module.
23. `renderer`The game's rendering module.

## Modules of Mutate

### Animation

Animation is a core module of `mutate`. It is simple but powerful. Almost all the animations in the game are implemented by it, but of course you can use this functionality for some other things as well.

The core of animation is a class `mutate.animationBase`, which is a highly customisable class.

#### Animatable Properties

Firstly, when it comes to animation, there must be a role property. `AnimationBase` itself provides four system properties, `x`, `y`, `angle` and `size`, which represent the horizontal coordinate, vertical coordinate, rotation angle and zoom size respectively. Once you have created an instance of `AnimationBase` (named `ani` in this case), you can access them via `ani.x`, `ani.y`, `ani.angle` and `ani.size`, noting that these properties are read-only.

You can also customise animation properties, you can register a new animation property by calling `ani.register(key: string, initValue: number)`, note that the registered property will be stored in `ani.custom`. where `key` is the name of the property, which can be the same with the system property, and `initValue` is the initial value of the property.

#### Rate Curve

At the heart of this animation is the rate curve. Although it is called a rate curve, it is in fact a completion curve. It is a function that inputs a value between \[0,1\] and outputs a value between \[0,1\] (it can of course exceed this interval, but generally speaking do not exceed it). The input value represents the completion of the animation in time, and the output value, the return value of the function, represents the completion of the animation in process.

`mutate` has a rich set of built-in rate curve generating functions which output the corresponding rate curve functions based on the input parameters. They are in `mutate.timing` and include the followings.

1. The linear rate function `linear()`, which returns a linear rate function.

2. The trigonometric rate function`trigo(type: 'sin' | 'sec', mode: EaseMode)`, which returns a trigonometric rate function with the specified properties, where `EaseMode` can be filled with `in` `out` `in-out` `center`, which means `slow-fast` `fast-slow` `slow-fast-slow ` `fast-slow-fast`.

3. The power rate function `power(n: number, mode: EaseMode)`, which returns a function that varies by `x^n`, with n being the exponent.

4. The hyperbolic rate function `hyper(type: 'sin' | 'tan' | 'sec', mode: EaseMode)`, which returns a hyperbolic rate function, respectively ` hyperbolic sine` ` hyperbolic tangent` ` hyperbolic secant`

5. The inverse trigonometric rate function `inverseTrigo(type: 'sin' | 'tan', mode: EaseMode)`, which returns an inverse trigonometric rate function.

6. The bezier curve rate function `bezier(.. .cps)`, the parameters for the bezier curve control point vertical coordinates (horizontal coordinates can not be customized, because a moment can not correspond to more than one rate) Example: `bezier(0.4, 0.2, 0.7); // bezier curve rate function three control points`.

7. The shake function `shake(power: number, timing: TimingFn)`, which outputs a rate function for the back and forth shake, where `power` is the maximum possible amount of shake and `timing` is the rate function for the amount of shake.

Of course, you can also customize the rate curve, as long as it match `(input: number) => number`.

#### Path Curve

In addition to the rate curve, the animation engine also provides a path curve which allows `x` and `y` to move under a certain path. It is similar to the rate curve, except that the output values become \[x,y\] arrays. `mutate` has two built-in path curves which are in `mutate.path` and includes the followings.

1. Circular path `circle(r: number, n: number = 1, timing: TimingFn = () => 1, inverse: boolean = false)`. `r` is the radius of the circle, `n` is the number of laps, `timing` describes the change in radius size, and `inverse` states whether to flip `timing` function. The last three parameters can be left out.

2. Bezier curve path `bezierPath(start: Point, end: Point, ...cps: Point[])`. `start` and `end` are the start and end points, which should be filled into the `[x, y]` array, and `cps` is the control point, which is also the `[x, y]` array. Example: `bezierPath([0, 0], [200, 200], [100, 50], [300, 150], [200, 180])`, which is a quadratic Bezier curve starting at `[0, 0]` and ending at `[200, 200]`, with three control points.

#### Options

In order for the animation to run correctly, it needs to be set up, including timing, relative mode, etc. See the following example.

```js
// Set the animation time, default is 0, but note that when the time is 0 it still takes 1 frame to execute the animation.
ani.time(1000) 
    // Set to absolute mode, default is absolute, note that in relative mode the properties are added when set.
    .absolute() 
    // Set the rate curve, the default is linear.
    .mode(linear()) 
```

If it's a shake function (considered to animate on x and y here, if not, please still do as above), use `ani.mode(shake(...) , true)`

#### Running

Once the above preparations have been made, we are ready to run the animation, see the following example.

```js
ani.move(100, 100); // Execute the motion to [100,100] animation.
```

Running the animation is as simple as that! That way its coordinates will move in the specified way. The engine itself provides five built-in animation methods, which are as followings.

1. `move(x: number, y: number)`Move to a point
2. `scale(size: number)`Zoom in and out
3. `rotate(angle: number)`Rotate
4. `moveAs(path: PathFn)`Follow the path function, change the relative mode to relative first when using this animation
5. `shake(x: number, y: number)`Shake the object. x and y denote the magnitude of the vibration on the horizontal and vertical coordinates respectively, 1 being the maximum and 0 the minimum.

Of course, there is also the function that runs the animation of a custom property, which is `ani.apply(key: string, n: number)`, where `key` is the animation property and `n` is the target value of the animation.

#### Waiting

There are many times when we need to wait for an animation to finish, and the engine provides this function, there are three ways to wait.

1. `ani.n(n: number)`, which waits for n animations to finish.
2. `ani.w(type: string)`, which waits for a certain animation to finish.
3. `ani.all()`, which waits for all animations to finish.

They are both `async function`, so please use `await` or `promise` to perform the wait.

In addition, there is a wait function `sleep(time: number)` in `mutate.animate`, which allows you to wait for a specified number of milliseconds, also as an `async function`.

#### Listening

You can use `ani.listen(type: string, fn: (e: AnimationBase) => void)` to listen for animation information, which is not often used, so I won't go into it here.

#### Drawing

As you can see from the above description, the animation engine is not involved in drawing, so drawing needs to be done separately. You can add a drawing function by using `ani.ticker.add(fn: (time: number) => void)`, where `time` is the number of milliseconds that have passed since the animation was created.

### Judgement

The Judgement module, which is not normally used, is only briefly explained here。

You can modify the judgement time of a particular note or other configurations, this is usually done when writing the chart. Refer to the chart editing documentation for details.

### Render and Object

Rendering is divided into three main parts: `camera` `base` `note`, which all extend class `AnimationBase`, and we introduce them one by one.

#### Camera

Camera, which controls the overall offset of the canvas, etc. Compared to `AnimationBase`, it has an additional animation property `css`, which means that you can set the `css effects` of the canvas directly through it, and it is simple to use:

```js
game.chart.camera.css(`
    background-color: #000;
    border: 2px solid #fff;
    opacity: 0.6;
`)
```

It's exactly like when you write css, you don't have to set it up one by one. You can alse do it when you write the chart! See the chart editing documentation for details.

In addition, the camera has a `save()` and `restore()` method, similar to the one on `CanvasRenderingContext2d`

#### Base

The base, one of the core objects of `mutate`, has 5 custom animation properties `r` `g` `b` `a` `radius`, which represent its color and radius respectively.

You can also set its radius with `base.setRadius(r: number)`, its rotation speed in `bpm` with `base.setSpeed(v: number)`, and its color with `base.rgba(r?: number, g?: number, g?: number, a? number)`. Note that the speed is effective immediately and is not affected by the animation, the remaining two are 1 frame animations.

If you want to get the angle of the base, use `base.calRad()`, it will return the rotation angle of the base at the current game moment.

There are no common properties on this one, just a `note.bpm` if you want, which indicates the rotation speed.

#### Note

Note, with a custom animation property `opacity`, which controls the opacity of the note. But in the end, it's just a name, so when you use it, you can use it how you want, and no one cares if you use it as a note size.

There are more ways to use notes, and they will be introduced one by one below.

1. `note.setSpeed(s: number)`Set the flow speed of the note.
2. `note.perfect()` `note.good()` `note.miss()`Judge the note by perfect, good, or miss.
3. `note.filter(f: string)`Same as `CanvasRenderingContext2d.filter`, essentially set this too, but of course it depends on the rendering function if it is set or not.
4. `note.opacity(a: number)`Use 1 frame to set the opacity to the target value. If you want to animate, use `note.apply()` instead. After all, notes are also extended from `AnimationBase`.
5. `note.shadow(x: number, y: number, blur: number, color: string)`Set the note's shadow. Note that this is not valid with the built-in rendering function.
6. `note.calDistance(): number` Get the distance of the note from the base, without calculate the distance due to animation.
7. `note.calPosition(): [number, number, number]`Get the absolute position of the note, without calculating the displacement generated by the animation. But of course after rotating the camera, it is not necessarily relative to the upper left corner. The third item is the distance, when the distance is less than 0 all three are `NaN`. When the note has no judge time, the distance is `NaN`.

Note also has a number of common properties.

1. `speed: number`The flow speed of the note, in pixels per second.
2. `res: string`Perfect or good or miss, `pre` when not hit.
3. `detail: string`In the premise of good or miss, The result is early or late, and `late` when not hit.
4. `multi: boolean` whether the current note is a multi note
5. `noteType: NoteType`Note type, there are `tap`, `drag` and `hold`, where `hold` currently has no built-in rendering function.
6. `base: Base`The base the note belongs to.
7. `noteTime?: number`The hit time. If void, it will not be judged.
8. `perfectTime` `goodTime` `missTime`Three kinds of judge time.
9. `dir: [number, number]`The direction of the note entry, in the form of \[sin, cos\].

#### Renderer

The renderer, which is responsible for almost all rendering in the game, is a single instance that is mounted to `mutate.renderer`. It has a very high customization space, allowing you to customize rendering functions and so on.

First of all, there are two types of rendering functions, base rendering functions and note rendering functions, which are of type `(base: Base) => void` and `(note: BaseNote<NoteType>) => void`. And the canvas bound to the game is `base.game.ctx` and `note.base.game.ctx`. If you want to customize them, use `renderer.setBase(fn)` and `renderer.setNote(fn)`

In addition to the note rendering functions, there are also hit effect functions, whose type is `{ start: number, res: string, note: BaseNote, end: boolean }`, where `start` indicates the start time, `res` indicates the result of the hit, `perfect` or ` good` or `miss`, `note` is the note of the hit, and `end` indicates whether the effect is finished or not, which you should set to `true` when the effect is finished. To set the hit effect, use `renderer.setEffect(fn: (e: ToDrawEffect) => void)`

> The game has built-in `tap` and `drag` drawing functions and three kinds of hit effects functions.

`renderer` also has a functional function `renderer.inGame(x: number, y: number, r: number = 10)` that determines whether a circle with radius `r` at `[x,y]` coordinates is inside the game screen.

There are no commonly used properties in `renderer`.

### Ticker

`Ticker` is a class that allows one or more functions to be executed once per frame, and it is mounted in all `AnimationBase` and `Mutate`. The `ticker` role of `AnimationBase` is to execute the animation, while `Mutate` is for some core functions and so on.

When you want to add a function to it, use `ticker.add(fn: (time: number) => void)`, where `time` is the number of milliseconds that have passed since `ticker` started running (usually run immediately after being constructed). If there is an error or `throw` in the function, the `ticker` will stop immediately, so that you can check for errors more easily. To remove the function use `ticker.remove(fn: (time: number) => void)`. In addition to these two, there is another method that allows you to remove all functions directly, which is `ticker.clear()`. A  nd a function that removes all functions and stops running, which will make this `ticker` unusable, which is `ticker.destroy()`

There are no commonly used properties in `ticker`

### AudioExtractor

Audio processing module, which is mounted on `mutate.ac`.

As the name suggests, it is responsible for the game's audio processing. But it is rarely used. If you are interested, you can view the source code on github.

### Chart

The chart processing module, which is mounted on `mutate.chart`

It contains all the base and note information, as well as the judgement module. It usually performs some operations after the game chart is loaded, including parsing the chart information, pre-processing all animations, etc.

There are a few very important methods related to the editing of the chart.

1. `register<T extends keyof TimingMode>(type: T, name: string, func: TimingMode[T])`, which allows you to register an animation rate function, where `TimingMode` contains four types of rate functions, for `timing` ` generator` `path` `pathG`, which are the rate function, rate function generator, path function, path function generator, where the generator function should return a corresponding rate function or path function. `name` is the name of the registered function, which needs to be used when editing the chart, `func` is the function to be executed.
2. `registerExecute<T extends keyof ExecuteDeclare>(type: T, key: string, fn: Executer<T>)`, registers a chart pre-execution function to pre-process simple animations. Its function is to execute the registered execution function after the animation execution time is reached, so as to achieve the effect of simple animation. Where `type` should be `note` `base` `camera`, `Executer` is the execution function, it has two parameters, the first one is `value`. It is the parameter passed in the chart file, this will be explained in detail in the chart writing document. The second one is `target`, which is its animation target, for example, the target of `note` is `BaseNote`.