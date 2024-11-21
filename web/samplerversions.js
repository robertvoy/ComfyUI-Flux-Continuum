import { app } from "../../../scripts/app.js";

// Configuration Constants
const TAB_CONFIG = {
    width: 40,
    height: 18,
    fontSize: 10,
    normalColor: "#0d0d0d",
    selectedColor: "#666666",
    textColor: "white",
    borderRadius: 4,
    spacing: 10,
    offset: 16,
    labels: ["1", "2", "3"], // 3 tabs
    yPosition: 4
};

app.registerExtension({
    name: "SamplerParameterPacker",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeType.comfyClass !== "SamplerParameterPacker") return;
        
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
            
            // Initialize tab state and content
            this.activeTab = 0;
            this.tabContents = TAB_CONFIG.labels.map(() => ({
                sampler: this.widgets[0].value,
                scheduler: this.widgets[1].value
            }));
            
            // Store widget references
            this.samplerWidget = this.widgets[0];
            this.schedulerWidget = this.widgets[1];
            
            // Add change listeners to widgets
            this.samplerWidget.callback = () => {
                this.tabContents[this.activeTab].sampler = this.samplerWidget.value;
            };

            this.schedulerWidget.callback = () => {
                this.tabContents[this.activeTab].scheduler = this.schedulerWidget.value;
            };
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
                        
                        // Save current widget values to current tab
                        this.tabContents[this.activeTab] = {
                            sampler: this.samplerWidget.value,
                            scheduler: this.schedulerWidget.value
                        };
                        
                        // Switch tab
                        this.activeTab = i;
                        
                        // Load content from new tab
                        this.samplerWidget.value = this.tabContents[i].sampler;
                        this.schedulerWidget.value = this.tabContents[i].scheduler;
                        
                        this.setDirtyCanvas(true);
                        return true;
                    }
                }
            }
            
            return false;
        };
        
        nodeType.prototype.getBounding = function() {
            const bounds = originalGetBounding ? originalGetBounding.apply(this, arguments) : [0, 0, 200, 100];
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
                this.tabContents = TAB_CONFIG.labels.map((_, i) => 
                    o.tabContents[i] || {
                        sampler: this.samplerWidget.value,
                        scheduler: this.schedulerWidget.value
                    }
                );
                this.activeTab = o.activeTab >= 0 && o.activeTab < TAB_CONFIG.labels.length ? o.activeTab : 0;
                
                // Load the active tab's content
                if (this.samplerWidget && this.schedulerWidget) {
                    this.samplerWidget.value = this.tabContents[this.activeTab].sampler;
                    this.schedulerWidget.value = this.tabContents[this.activeTab].scheduler;
                }
            }
        };
    }
});