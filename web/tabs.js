import { app } from "../../../scripts/app.js";

/**
 * Constants for node and tab dimensions
 * @readonly
 */
const NODE_METRICS = {
    TITLE_HEIGHT: 30,
    TAB_HEIGHT: 48
};

/**
 * Style configuration for tabs
 * @readonly
 */
const TAB_STYLE = {
    defaultWidth: 65,
    height: 18,
    fontSize: 9,
    normalColor: "#5a5a5a",
    textColor: "white",
    borderRadius: 4,
    fontFamily: "'Segoe UI', Arial, sans-serif"
};

// Utility class for bounding box calculations
class BoundingBoxCalculator {
    constructor() {
        this.boundingBoxBuffer = new Float32Array(4);
    }

    calculate(rects) {
        if (rects.length === 0) {
            this.boundingBoxBuffer.set([0, 0, 0, 0]);
            return this.boundingBoxBuffer;
        }

        let minX = rects[0].x;
        let minY = rects[0].y;
        let maxX = rects[0].x + rects[0].width;
        let maxY = rects[0].y + rects[0].height;

        for (let i = 1; i < rects.length; i++) {
            const rect = rects[i];
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        }

        this.boundingBoxBuffer.set([minX, minY, maxX - minX, maxY - minY]);
        return this.boundingBoxBuffer;
    }
}

// Create a single instance of the calculator
const boundingBoxCalculator = new BoundingBoxCalculator();

// Utility functions
const getTabWidth = (config, isSecondTab = false) => {
    if (!config) {
        throw new Error('Config object is required');
    }
    if (isSecondTab) {
        return config.secondTabWidth || TAB_STYLE.defaultWidth;
    }
    return config.width || TAB_STYLE.defaultWidth;
};

const isInsideRect = (x, y, rx, ry, rw, rh) => (
    x >= rx && x <= rx + rw && y >= ry && y <= ry + rh
);

const handleNodeOrder = (node, toFront = true) => {
    const { graph } = node;
    if (!graph?._nodes) return;

    const index = graph._nodes.indexOf(node);
    if (index === -1) return;

    let frameId;

    const handleDeselection = () => {
        frameId = requestAnimationFrame(() => {
            app.canvas.deselectNode(node);
            node.setDirtyCanvas(true, true);
        });
    };

    // Reorder the node
    graph._nodes.splice(index, 1);
    if (toFront) {
        graph._nodes.push(node);
    } else {
        graph._nodes.unshift(node);
    }

    handleDeselection();

    // Return cleanup function
    return () => {
        if (frameId) {
            cancelAnimationFrame(frameId);
        }
    };
};

const drawTab = (ctx, x, y, text, width) => {
    const { height, fontSize, normalColor, textColor, borderRadius, fontFamily } = TAB_STYLE;

    ctx.save();
    ctx.fillStyle = normalColor;

    // Draw tab background
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.fill();

    // Text rendering with just the essential improvements
    ctx.fillStyle = textColor;
    ctx.textRendering = 'optimizeLegibility';
    ctx.imageSmoothingEnabled = true;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.fillText(text, x + width / 2, y + height / 2);
    ctx.restore();
};

class NodeWithTabs {
    static onNodeCreated(node) {
        // Add properties to the node when it's created
        node.addProperty("enableTabs", false, "boolean");
        node.addProperty("tabWidth", TAB_STYLE.defaultWidth, "number");
        node.addProperty("tabXOffset", 10, "number");  // Added tabXOffset as a property
        node.addProperty("hasSecondTab", false, "boolean");
        node.addProperty("secondTabText", "Send Back", "string");
        node.addProperty("secondTabOffset", 80, "number");
        node.addProperty("secondTabWidth", TAB_STYLE.defaultWidth, "number");
    }
}

app.registerExtension({
    name: "NodeTabExtension",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        // Add onNodeCreated to the node type
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function() {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            NodeWithTabs.onNodeCreated(this);
        };

        const originalMethods = {
            getBounding: nodeType.prototype.getBounding,
            isPointInside: nodeType.prototype.isPointInside,
            onMouseDown: nodeType.prototype.onMouseDown,
            onDrawForeground: nodeType.prototype.onDrawForeground
        };

        nodeType.prototype.getBounding = function(out) {
            if (!this.properties?.enableTabs || this.flags.collapsed) {
                return originalMethods.getBounding.call(this, out);
            }

            out = out || new Float32Array(4);
            const [width, height] = this.size;
            const [nodeX, nodeY] = this.pos;

            const rects = [
                // Body and title
                {
                    x: nodeX,
                    y: nodeY - NODE_METRICS.TITLE_HEIGHT,
                    width,
                    height: height + NODE_METRICS.TITLE_HEIGHT
                },
                // Main tab
                {
                    x: nodeX + this.properties.tabXOffset,
                    y: nodeY - NODE_METRICS.TAB_HEIGHT,
                    width: this.properties.tabWidth,
                    height: TAB_STYLE.height
                }
            ];

            if (this.properties.hasSecondTab) {
                rects.push({
                    x: nodeX + this.properties.secondTabOffset,
                    y: nodeY - NODE_METRICS.TAB_HEIGHT,
                    width: this.properties.secondTabWidth,
                    height: TAB_STYLE.height
                });
            }

            // Calculate the bounding box
            const result = boundingBoxCalculator.calculate(rects);
            
            // Copy values to the out parameter
            out.set(result);
            return out;
        };

        nodeType.prototype.isPointInside = function(x, y, margin = 0) {
            if (!this.properties?.enableTabs || this.flags.collapsed) {
                return originalMethods.isPointInside.call(this, x, y, margin);
            }

            const [nodeX, nodeY] = this.pos;
            const [width, height] = this.size;

            // During rectangle selection, use a simpler hit test that includes the margin
            if (margin > 0) {
                const boundingBox = this.getBounding();
                return isInsideRect(
                    x, y,
                    boundingBox[0] - margin,
                    boundingBox[1] - margin,
                    boundingBox[2] + 2 * margin,
                    boundingBox[3] + 2 * margin
                );
            }

            // For regular clicking, keep the detailed hit testing
            const bodyAndTitle = isInsideRect(x, y, 
                nodeX, nodeY - NODE_METRICS.TITLE_HEIGHT, 
                width, height + NODE_METRICS.TITLE_HEIGHT
            );
            if (bodyAndTitle) return true;

            const mainTabHit = isInsideRect(x, y,
                nodeX + this.properties.tabXOffset, 
                nodeY - NODE_METRICS.TAB_HEIGHT,
                this.properties.tabWidth, 
                TAB_STYLE.height
            );
            if (mainTabHit) return true;

            if (this.properties.hasSecondTab) {
                return isInsideRect(x, y,
                    nodeX + this.properties.secondTabOffset,
                    nodeY - NODE_METRICS.TAB_HEIGHT,
                    this.properties.secondTabWidth,
                    TAB_STYLE.height
                );
            }

            return false;
        };

        nodeType.prototype.onMouseDown = function(event, local_pos, graphCanvas) {
            if (!this.properties?.enableTabs || this.flags.collapsed) {
                return originalMethods.onMouseDown?.call(this, event, local_pos, graphCanvas) ?? false;
            }

            const [localX, localY] = local_pos;

            // Check main tab click
            const mainTabHit = isInsideRect(localX, localY,
                this.properties.tabXOffset, -NODE_METRICS.TAB_HEIGHT,
                this.properties.tabWidth, TAB_STYLE.height
            );
            if (mainTabHit) {
                handleNodeOrder(this, true);
                return true;
            }

            // Check second tab click
            if (this.properties.hasSecondTab) {
                const secondTabHit = isInsideRect(localX, localY,
                    this.properties.secondTabOffset, -NODE_METRICS.TAB_HEIGHT,
                    this.properties.secondTabWidth, TAB_STYLE.height
                );
                if (secondTabHit) {
                    handleNodeOrder(this, false);
                    return true;
                }
            }

            return false;
        };

        nodeType.prototype.onDrawForeground = function(ctx) {
            if (!this.properties?.enableTabs || this.flags.collapsed) {
                return originalMethods.onDrawForeground?.call(this, ctx);
            }

            ctx.save();
            const baseY = -NODE_METRICS.TAB_HEIGHT;

            drawTab(ctx, this.properties.tabXOffset, baseY, this.title, this.properties.tabWidth);

            if (this.properties.hasSecondTab) {
                drawTab(ctx, this.properties.secondTabOffset, baseY, 
                    this.properties.secondTabText, this.properties.secondTabWidth);
            }

            ctx.restore();
        };
    }
});