# Chart Editing Reference

The suffix name of the chart is usually `.mtt`, in `json` format. Its type is

```ts
// The animation type of the chart file
type MTTAnimate = Array<{
    custom: boolean // Whether it is custom or not
    start: number // Start time of the animation
    type: string // The name of the animation. If it is not custom, it is one of 'move', 'rotate', 'resize', 'moveAs' and 'shake'. If it is, it is usually the property name.
    time: number // Duration of execution
    n: number // Target value, if it is not 'move' or 'moveAs'
    mode: { // Animation rate function
        fnType: 'generator' | 'timing' | 'path' | 'pathG' // Generator is the rate generator, pathG is the path generator
        fn: string // Timing or generator function name
        args: any[] // List of arguments for the timing generator
        pathFn?: string // Path or pathG function name
        pathArg?: any[] // List of arguments for the path or path generator
        // The above should be registered in the game, the registration method is described in the chart section, and the mechanism will be explained in detail afterwards
    }
    relation: 'absolute' | 'relative' // Relative or absolute
    first?: boolean // Whether to insert the animation at the beginning of all animations of the current object
    shake?: boolean // If or not it is a shake change
    x?: number // The horizontal coordinate to move to
    y?: number // The vertical coordinate when moving
}>

// The type of the chart file
type MTT = {
    option: { // Global settings
        background?: string // Background color
    }
    bases: Array<{ // All bases
        id: string // The id of the base
        x: number // Initial horizontal coordinate
        y: number // Initial vertical coordinate
        angle: number // The initial rotation angle
        r: { // Simple radius change method, index indicates the change time, value indicates the target value. It will be animated in 1 frame.
            [time: number]: number
        } 
        bpm: { // Rotation speed change method, same as above
            [time: number]: number
        }
        rgba: { // Same as above
            [time: number]: [number, number, number, number]
        }
        animate: MTTAnimate // All animations
    }>
    notes: Array<{
        base: string // The base to which it belongs
        type: NoteType // Note type, tap or drag or hold
        config?: {
            playTime?: number // Hit time
            perfectTime?: number // Perfect judgement interval
            goodTime?: number // Good judgement interval
            missTime?: number // Miss judgment interval
            time?: number // Time of long press
        }
        speed: { // Flow speed change method
            [time: number]: number
        }
        filter: { // Set the filter at a specific time, no animation
            [time: number]: string
        }
        shadow: { // Shadow
            [time: number]: {
                x: number
                y: number
                blur: number
                color: string
            }
        }
        opacity: { // Opacity
            [time: number]: number
        }
        animate: MTTAnimate // Animation
    }>
    camera: {
        id: string // Camera id
        animate: MTTAnimate // Animation
        css: { // Set the css at a specific time, written in the same way as css
            [time: number]: string
        }
    }
}
```

## Initial Configuration

> `option` configuration item

Currently includes:

1. `background` background color

## Bases

> `bases` configuration item

The types are already mentioned above and do not need to be detailed.

## Notes

> `notes` configuration item

The `filter` is written in the same way as `CanvasRenderingContext2d.filter`.

## Camera

> `camera` configuration item

The `css` item is written in exactly the same way as `css`. e.g. `opacity: 0.8;`

## Animation

> Animation Configuration Item and Simple Animation Configuration Item

All three of the above contain this configuration item, so let's start by explaining the implementation principle.

First, we register some rate functions and pre-execution functions. We notice that there is a `mode` property in the animation, which controls the rate functions. First, `type` specifies the type to be executed, which corresponds to the first parameter of `register`. Next are `fn` and `pathFn`, which are the names of the registered functions and correspond to the second parameter of `register`. Then comes `args` and `pathArg`, which are all the arguments passed in when the registered function is executed, corresponding to the second argument to `Function.apply`. For example, when `type` is `generator`, `fn` is `power`, and `args` is `[3, 'in-out']`, the actual function executed is `power(3, 'in-out')`, returning a rate function for animation.

For the pre-execution function, the mechanism is similar, but its object is a simple animation for each time point, which is equivalent to specifying a time point for animation execution during the game loading process, and then executing the registered animation at its time. Its corresponding registration function is `registerExecute`, the first parameter corresponds to the target type, which is one of `note` `base` `camera`, the second parameter is its role property, for example, `base` contains `bpm` which can be role property, and the third parameter is the function to execute. We find that each simple animation is a key-value pair of `time: value`, so when the corresponding time is reached, the value is passed as the first argument to the executing function, and the second argument is the object on which it acts. For example, if a base has a key-value pair of `1000: [100, 200, 150, 0.5]` and the corresponding execution function is registered as `([r, g, b, a]: number[], target: Base) => target.rgba(r, g, b, a)`, then when the time point of 1000 milliseconds is reached, `[ 100, 200, 150, 0.5]` is passed as the first argument of the execution function, and the second argument is the base.

The above is the principle of execution of the two, the rest is simple and will not be detailed.

## Customizing Simple Animations

As mentioned in the previous column, the execution of the simple animation is done by `registerExecute`, so you only need to register a pre-execute function corresponding to the property, and you can write your own simple animation in the chart file.