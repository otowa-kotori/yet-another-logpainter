type DropzoneParams = {
    onDrop: (dataTransfer: DataTransfer) => void;
};

export function dropzone(node: HTMLElement, params: DropzoneParams) {
    function handleDrop(event: DragEvent) {
        event.preventDefault();
        
        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) return;
        params.onDrop(dataTransfer);
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    node.addEventListener('drop', handleDrop);
    node.addEventListener('dragover', handleDragOver);

    return {
        destroy() {
            node.removeEventListener('drop', handleDrop);
            node.removeEventListener('dragover', handleDragOver);
        },
        update(newParams: DropzoneParams) {
            params = newParams;
        }
    };
} 