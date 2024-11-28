import { app } from "../../../scripts/app.js";

/**
 * Default and limit configurations
 */
const CONFIG = {
    DEFAULT_VERSION_AMOUNT: 5,
    MAX_VERSION_AMOUNT: 100,
    MIN_VERSION_AMOUNT: 1
};

/**
 * Visual style configuration for version tabs
 */
const TAB_STYLE = {
    width: 40,
    height: 18,
    fontSize: 10,
    normalColor: "#333333",
    selectedColor: "#666666",
    textColor: "white",
    borderRadius: 4,
    spacing: 10,
    offset: 10,
    yPosition: 10
};

function createTabConfig(numVersions) {
    return {
        ...TAB_STYLE,
        labels: Array.from({length: numVersions}, (_, i) => (i + 1).toString())
    };
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

app.registerExtension({
    name: "TextVersions",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeType.comfyClass !== "TextVersions") return;

        // Store original methods
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        const onDrawBackground = nodeType.prototype.onDrawBackground;
        const getBounding = nodeType.prototype.getBounding;
        const onSerialize = nodeType.prototype.onSerialize;
        const onConfigure = nodeType.prototype.onConfigure;

        // Add onNodeCreated to the node type
        nodeType.prototype.onNodeCreated = function() {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }

            // Add properties
            this.addProperty("versionAmount", CONFIG.DEFAULT_VERSION_AMOUNT, "number");
            
            // Initialize node
            if (!this.properties) {
                this.properties = {};
            }
            this.properties.versionAmount = this.properties.versionAmount || CONFIG.DEFAULT_VERSION_AMOUNT;
            
            // Create tab config based on number of versions
            this.tabConfig = createTabConfig(this.properties.versionAmount);
            
            // Initialize tab state and content
            this.activeTab = 0;
            this.tabContents = Array(this.properties.versionAmount).fill("");
            
            // Store reference to the text widget
            this.textWidget = this.widgets.find(w => w.name === "text");
            
            // Initial content setup
            if (this.textWidget) {
                this.textWidget.value = this.tabContents[this.activeTab];
                
                // Add debounced change event listener
                if (this.textWidget.inputEl) {
                    const saveContent = debounce(() => {
                        this.tabContents[this.activeTab] = this.textWidget.value;
                    }, 300);

                    this.textWidget.inputEl.addEventListener("input", saveContent);
                }
            }
        };

        nodeType.prototype.onPropertyChanged = function(name, value) {
            if (name === "versionAmount") {
                const newValue = Math.max(CONFIG.MIN_VERSION_AMOUNT, 
                    Math.min(CONFIG.MAX_VERSION_AMOUNT, Math.floor(value)));
                const oldContents = [...this.tabContents];
                this.properties.versionAmount = newValue;
                this.tabConfig = createTabConfig(newValue);
                this.tabContents = Array(newValue).fill("").map((_, i) => oldContents[i] || "");
                this.activeTab = Math.min(this.activeTab, newValue - 1);
                if (this.textWidget) {
                    this.textWidget.value = this.tabContents[this.activeTab];
                }
                this.setDirtyCanvas(true);
            }
        };

        nodeType.prototype.onDrawBackground = function(ctx) {
            if (onDrawBackground) {
                onDrawBackground.apply(this, arguments);
            }
            
            if (this.flags.collapsed) return;
            
            ctx.save();

            // Create clipping region for overflow
            const nodeWidth = this.size[0];
            const clipPadding = 10;
            ctx.beginPath();
            ctx.rect(clipPadding, this.tabConfig.yPosition - 5, 
                    nodeWidth - (2 * clipPadding), 
                    this.tabConfig.height + 10);
            ctx.clip();
            
            // Draw tabs
            this.tabConfig.labels.forEach((label, i) => {
                const x = this.tabConfig.offset + (this.tabConfig.width + this.tabConfig.spacing) * i;
                const y = this.tabConfig.yPosition;
                
                ctx.fillStyle = i === this.activeTab ? this.tabConfig.selectedColor : this.tabConfig.normalColor;
                ctx.beginPath();
                ctx.roundRect(x, y, this.tabConfig.width, this.tabConfig.height, this.tabConfig.borderRadius);
                ctx.fill();
                
                ctx.fillStyle = this.tabConfig.textColor;
                ctx.font = `${this.tabConfig.fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, x + this.tabConfig.width / 2, y + this.tabConfig.height / 2);
            });
            
            ctx.restore();
        };
        
        nodeType.prototype.onMouseDown = function(event, local_pos, graphCanvas) {
            const [x, y] = local_pos;
            const { yPosition, height, width, spacing, offset, labels } = this.tabConfig;
            
            if (y >= yPosition && y <= yPosition + height) {
                for (let i = 0; i < labels.length; i++) {
                    const tabX = offset + (width + spacing) * i;
                    if (x >= tabX && x <= tabX + width) {
                        if (i === this.activeTab) return false;
                        
                        if (this.textWidget) {
                            this.tabContents[this.activeTab] = this.textWidget.value;
                        }
                        
                        this.activeTab = i;
                        
                        if (this.textWidget) {
                            this.textWidget.value = this.tabContents[i];
                        }
                        
                        this.setDirtyCanvas(true);
                        return true;
                    }
                }
            }
            
            return false;
        };
        
        nodeType.prototype.getBounding = function() {
            const bounds = getBounding?.apply(this, arguments) || new Float32Array(4);
            const tabsHeight = Math.abs(this.tabConfig.yPosition) + this.tabConfig.height;
            bounds[1] -= tabsHeight;
            bounds[3] += tabsHeight;
            return bounds;
        };

        nodeType.prototype.onSerialize = function(o) {
            if (onSerialize) {
                onSerialize.apply(this, arguments);
            }
            o.tabContents = this.tabContents;
            o.activeTab = this.activeTab;
        };

        nodeType.prototype.onConfigure = function(o) {
            if (onConfigure) {
                onConfigure.apply(this, arguments);
            }
            
            this.tabConfig = createTabConfig(this.properties.versionAmount);
            
            if (o.tabContents && Array.isArray(o.tabContents)) {
                this.tabContents = Array(this.properties.versionAmount).fill("").map((_, i) => o.tabContents[i] || "");
                this.activeTab = o.activeTab >= 0 && o.activeTab < this.properties.versionAmount ? o.activeTab : 0;
                if (this.textWidget) {
                    this.textWidget.value = this.tabContents[this.activeTab];
                }
            }
        };
    }
});