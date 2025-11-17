// 图片处理工具类 - 只处理v-zw-tabContent容器内的图片
const ImageHandler = {
    // 目标容器ID
    targetContainerId: 'v-zw-tabContent',
    
    // 代理服务配置
    proxyUrl: 'https://images.weserv.nl/?url=',
    
    // 初始化图片处理
    init: function() {
        const container = document.getElementById(this.targetContainerId);
        if (!container) {
            console.warn('目标容器未找到:', this.targetContainerId);
            return;
        }
        
        this.container = container;
        this.processExistingImages();
        this.processBackgroundImages();
        this.setupDynamicImageHandling();
        this.setupErrorHandling();
    },
    
    // 处理已存在的img标签
    processExistingImages: function() {
        if (!this.container) return;
        
        this.container.querySelectorAll('img').forEach(img => {
            this.processImageSource(img);
        });
    },
    
    // 处理背景图片
    processBackgroundImages: function() {
        if (!this.container) return;
        
        const elements = this.container.querySelectorAll('*');
        elements.forEach(element => {
            const bgStyle = window.getComputedStyle(element).backgroundImage;
            if (bgStyle && bgStyle !== 'none') {
                this.processBackgroundImageStyle(element, bgStyle);
            }
        });
    },
    
    // 处理单个图片源
    processImageSource: function(img) {
        const originalSrc = img.src || img.dataset.src || img.getAttribute('data-src');
        
        if (!originalSrc) return;
        
        // 检查是否需要处理
        if (this.shouldProcessUrl(originalSrc)) {
            const processedSrc = this.getProxyUrl(originalSrc);
            
            // 保存原始URL用于恢复
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = originalSrc;
            }
            
            // 设置处理后的URL
            if (img.src !== processedSrc) {
                img.src = processedSrc;
            }
            
            // 处理data-src属性
            if (img.dataset.src && img.dataset.src !== processedSrc) {
                img.dataset.src = processedSrc;
            }
        }
    },
    
    // 处理背景图片样式
    processBackgroundImageStyle: function(element, bgStyle) {
        // 匹配所有背景图片URL
        const urlRegex = /url\((['"]?)(https?:\/\/[^'")]+)\1\)/gi;
        let match;
        let newBgStyle = bgStyle;
        
        while ((match = urlRegex.exec(bgStyle)) !== null) {
            const originalUrl = match[2];
            if (this.shouldProcessUrl(originalUrl)) {
                const processedUrl = this.getProxyUrl(originalUrl);
                newBgStyle = newBgStyle.replace(match[0], `url("${processedUrl}")`);
            }
        }
        
        if (newBgStyle !== bgStyle) {
            element.style.backgroundImage = newBgStyle;
        }
    },
    
    // 检查URL是否需要处理
    shouldProcessUrl: function(url) {
        return url && 
               !url.startsWith('data:') && 
               !url.startsWith('blob:') && 
               !url.includes('images.weserv.nl') &&
               (url.startsWith('http://') || url.startsWith('https://'));
    },
    
    // 获取代理URL
    getProxyUrl: function(url) {
        return this.proxyUrl + encodeURIComponent(url);
    },
    
    // 设置动态图片处理
    setupDynamicImageHandling: function() {
        if (!this.container) return;
        
        // 监听目标容器内的DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // 元素节点
                        // 处理新添加的img标签
                        if (node.tagName === 'IMG') {
                            this.processImageSource(node);
                        }
                        
                        // 处理新添加元素中的所有图片
                        node.querySelectorAll('img').forEach(img => {
                            this.processImageSource(img);
                        });
                        
                        // 处理新添加元素的背景图片
                        const bgStyle = window.getComputedStyle(node).backgroundImage;
                        if (bgStyle && bgStyle !== 'none') {
                            this.processBackgroundImageStyle(node, bgStyle);
                        }
                    }
                });
            });
        });
        
        observer.observe(this.container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'data-src', 'style']
        });
    },
    
    // 设置错误处理
    setupErrorHandling: function() {
        if (!this.container) return;
        
        // 监听目标容器内的图片加载错误
        this.container.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    },
    
    // 处理图片加载错误
    handleImageError: function(img) {
        const originalSrc = img.dataset.originalSrc || img.src;
        
        if (!originalSrc) return;
        
        // 尝试直接加载原始URL（如果还没试过）
        if (img.src.includes('images.weserv.nl') && !img.dataset.triedDirect) {
            img.dataset.triedDirect = 'true';
            img.src = originalSrc;
            return;
        }
        
        // 尝试使用备用代理服务
        if (!img.dataset.triedBackupProxy) {
            img.dataset.triedBackupProxy = 'true';
            const backupProxy = 'https://proxy.duckduckgo.com/iu/?u=';
            img.src = backupProxy + encodeURIComponent(originalSrc);
            return;
        }
        
        // 显示默认图片
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzRBODVGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5paw5Yiw5Zu+5Lq6PC90ZXh0Pgo8L3N2Zz4=';
        img.alt = '图片加载失败';
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    ImageHandler.init();
    
    // 额外的延迟处理，确保所有图片都被处理
    setTimeout(() => {
        ImageHandler.processExistingImages();
        ImageHandler.processBackgroundImages();
    }, 1000);
});

// 处理动态加载的内容
function processTabContentImages() {
    if (window.ImageHandler) {
        ImageHandler.processExistingImages();
        ImageHandler.processBackgroundImages();
    }
}

// 导出工具类供外部使用
window.ImageHandler = ImageHandler;