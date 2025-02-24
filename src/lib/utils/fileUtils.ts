import chardet from 'chardet';

export interface FileWithEncoding {
    file: File;
    encoding: string;
    text: string;
    type: string;
}

export async function readFileWithEncoding(file: DataTransfer | File): Promise<string> {
    // 如果是 DataTransfer，获取第一个文件或文本
    if (file instanceof DataTransfer) {
        // 首先尝试获取文本数据
        const textData = file.getData('text/plain');
        if (textData) {
            return textData;
        }
        // 如果没有文本数据，获取文件
        const targetFile = file.files?.[0];
        if (!targetFile) {
            throw new Error('没有可读取的文件');
        }
        file = targetFile;
    }

    try {
        // 读取文件内容为 ArrayBuffer
        const buffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
                
        // 使用 jschardet 检测编码
        const detected = chardet.detect(uint8Array);
        const encoding = detected || "UTF-8"

        // 使用检测到的编码解码文本
        const decoder = new TextDecoder(encoding);
        return decoder.decode(buffer);
    } catch (e) {
        console.error('文件读取失败:', e);
        throw new Error('文件读取失败，请检查文件编码');
    }
}

// 简单的乱码检测函数
function containsGarbledText(text: string): boolean {
    // 检查是否包含常见的乱码字符
    const garbledPattern = /[\ufffd\u0000-\u0008\u00b7\u00d7\u00f7]/;
    return garbledPattern.test(text);
}
