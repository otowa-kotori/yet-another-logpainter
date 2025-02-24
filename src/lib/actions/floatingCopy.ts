type FloatingCopyOptions = {
    buttonText?: string;
    onCopy?: () => void;
    onError?: (error: any) => void;
}

export function floatingCopy(node: HTMLTextAreaElement | HTMLInputElement, options: FloatingCopyOptions = {}) {
    // 创建一个容器来包裹原始元素和按钮
    const wrapper = document.createElement('div');
    wrapper.className = 'floating-copy-wrapper';
    
    // 将原始元素移到包裹器中
    node.parentNode?.insertBefore(wrapper, node);
    wrapper.appendChild(node);
    
    // 创建复制按钮
    const button = document.createElement('button');
    button.className = 'floating-copy-btn';
    button.textContent = options.buttonText || '复制';
    wrapper.appendChild(button);

    const copyText = async () => {
        try {
            const text = node.value || '';
            await navigator.clipboard.writeText(text);
            options.onCopy?.();
        } catch (error) {
            options.onError?.(error);
        }
    };

    button.addEventListener('click', copyText);

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .floating-copy-wrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }

        .floating-copy-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 6px 12px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s;
        }
        .floating-copy-btn:hover {
            background-color: #1976D2;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transform: translateY(-1px);
        }
    `;
    document.head.appendChild(style);

    return {
        destroy() {
            button.removeEventListener('click', copyText);
            // 将原始元素移回原位
            wrapper.parentNode?.insertBefore(node, wrapper);
            wrapper.remove();
            style.remove();
        }
    };
} 