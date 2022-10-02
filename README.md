# Mutate简介

`Mutate`是融合了`music`和`rotate`形成的单词，意为融合了音乐和旋转

## 安装

使用npm:

```cmd
npm i mutate
```

使用pnpm:

```cmd
pnpm add mutate
```

## 插入到你的项目中

首先，你需要一个canvas，这是mutate运行的基础，当然也只需要一个canvas，mutate就能运行。

然后，你可以使用以下代码来向你的项目中插入mutate游戏

```js
import mutate from 'mutate';

const canvas = document.getElementById('mutate');

const game = mutate.core.create(canvas);
await game.load('your music url', 'your mtt url');
game.start(); // 开始游戏
```

## 开发

如果你想开发本项目，在github上拉取后，可以按照以下步骤操作

### 安装依赖包

使用pnpm进行安装

```cmd
pnpm i
```

### 进入开发环境

执行

```cmd
pnpm dev
```

便可进入开发环境，在这里，你可以使用vue3+ts+less进行测试开发

### 打包

执行

```cmd
pnpm build
```

便可进行打包，打包后的入口为`dist/mutate.js`，该项可以在`vite.config.ts`中配置