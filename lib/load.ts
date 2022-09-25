/**
 * 从网络上加载一个音频
 * @param url 音频地址
 * @returns 音频的buffer
 */
export async function load(url: string): Promise<AudioBuffer> {
    return new AudioContext().createBuffer(1, 1, 1);
}

/**
 * 从本地加载音频
 */
export async function loadLocal(): Promise<AudioBuffer> {
    return new AudioContext().createBuffer(1, 1, 1);
}

/**
 * 从网络上加载谱面文件
 */
export async function loadMTT() {

}

/**
 * 从本地加载谱面文件
 */
export async function loadMTTLocal() {

}