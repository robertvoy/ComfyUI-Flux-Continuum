import { app } from "../../../scripts/app.js";

// Configuration Constants
const TAB_CONFIG = {
    width: 40,
    height: 18,
    fontSize: 10,
    normalColor: "#333333",
    selectedColor: "#666666",
    textColor: "white",
    borderRadius: 4,
    spacing: 10,
    offset: 10,
    labels: ["1", "2", "3", "4", "5"], // 5 tabs
    yPosition: 10
};

// Debounce function
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
        
        // Preserve original methods
        const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
        const originalOnDrawForeground = nodeType.prototype.onDrawForeground;
        const originalGetBounding = nodeType.prototype.getBounding;
        const originalOnSerialize = nodeType.prototype.onSerialize;
        const originalOnConfigure = nodeType.prototype.onConfigure;

        nodeType.prototype.onNodeCreated = function() {
            if (originalOnNodeCreated) {
                originalOnNodeCreated.apply(this, arguments);
            }
            
            // Initialize tab state and content based on number of tabs
            this.activeTab = 0;
            this.tabContents = TAB_CONFIG.labels.map(() => "");
            
            // Store reference to the text widget
            this.textWidget = this.widgets.find(w => w.name === "text");
            
            // Initial content setup
            if (this.textWidget) {
                this.textWidget.value = this.tabContents[this.activeTab];
                
                // Add debounced change event listener
                if (this.textWidget.inputEl) {
                    const saveContent = debounce(() => {
                        this.tabContents[this.activeTab] = this.textWidget.value;
                    }, 300); // Wait 300ms after last keystroke before saving

                    this.textWidget.inputEl.addEventListener("input", saveContent);
                }
            }
        };
        
        nodeType.prototype.updateTabContent = function() {
            if (!this.textWidget) return;
            this.tabContents[this.activeTab] = this.textWidget.value;
        };
        
        nodeType.prototype.onDrawForeground = function(ctx) {
            if (originalOnDrawForeground) {
                originalOnDrawForeground.apply(this, arguments);
            }
            
            if (this.flags.collapsed) return;
            
            ctx.save();
            
            // Draw tabs
            TAB_CONFIG.labels.forEach((label, i) => {
                const x = TAB_CONFIG.offset + (TAB_CONFIG.width + TAB_CONFIG.spacing) * i;
                const y = TAB_CONFIG.yPosition;
                
                // Draw tab background
                ctx.fillStyle = i === this.activeTab ? TAB_CONFIG.selectedColor : TAB_CONFIG.normalColor;
                ctx.beginPath();
                ctx.roundRect(x, y, TAB_CONFIG.width, TAB_CONFIG.height, TAB_CONFIG.borderRadius);
                ctx.fill();
                
                // Draw tab text
                ctx.fillStyle = TAB_CONFIG.textColor;
                ctx.font = `${TAB_CONFIG.fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(label, x + TAB_CONFIG.width / 2, y + TAB_CONFIG.height / 2);
            });
            
            ctx.restore();
        };
        
        nodeType.prototype.onMouseDown = function(event, local_pos, graphCanvas) {
            const [x, y] = local_pos;
            const { yPosition, height, width, spacing, offset, labels } = TAB_CONFIG;
            
            // Check if click is in tab area
            if (y >= yPosition && y <= yPosition + height) {
                for (let i = 0; i < labels.length; i++) {
                    const tabX = offset + (width + spacing) * i;
                    if (x >= tabX && x <= tabX + width) {
                        if (i === this.activeTab) return false;
                        
                        // Save current content
                        if (this.textWidget) {
                            this.tabContents[this.activeTab] = this.textWidget.value;
                        }
                        
                        // Switch tab
                        this.activeTab = i;
                        
                        // Load content for new tab
                        if (this.textWidget) {
                            this.textWidget.value = this.tabContents[i];
                        }
                        
                        this.updateTabContent();
                        this.setDirtyCanvas(true);
                        return true;
                    }
                }
            }
            
            return false;
        };
        
        nodeType.prototype.getBounding = function(out) {
            const bounds = originalGetBounding.call(this, out);
            const tabsHeight = Math.abs(TAB_CONFIG.yPosition) + TAB_CONFIG.height;
            bounds[1] -= tabsHeight; // Extend top boundary to include tabs
            bounds[3] += tabsHeight; // Add tab height to total height
            return bounds;
        };

        nodeType.prototype.onSerialize = function(o) {
            if (originalOnSerialize) {
                originalOnSerialize.apply(this, arguments);
            }
            o.tabContents = this.tabContents;
            o.activeTab = this.activeTab;
        };

        nodeType.prototype.onConfigure = function(o) {
            if (originalOnConfigure) {
                originalOnConfigure.apply(this, arguments);
            }
            if (o.tabContents && Array.isArray(o.tabContents)) {
                // Ensure tabContents length matches number of tabs
                this.tabContents = TAB_CONFIG.labels.map((_, i) => o.tabContents[i] || "");
                this.activeTab = o.activeTab >= 0 && o.activeTab < TAB_CONFIG.labels.length ? o.activeTab : 0;
                if (this.textWidget) {
                    this.textWidget.value = this.tabContents[this.activeTab];
                }
            }
        };
    }
});