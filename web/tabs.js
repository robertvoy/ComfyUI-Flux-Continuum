import { app } from "../../../scripts/app.js";

/**
 * Constants for node and tab dimensions and appearance
 * @readonly
 */
const NODE_METRICS = {
    TITLE_HEIGHT: 30,
    TAB_HEIGHT: 48,
    DEFAULT_TAB_X_OFFSET: 10,
    DEFAULT_SECOND_TAB_OFFSET: 80,
    MIN_TAB_SPACING: 5  // Minimum spacing between tabs
};

/**
 * Style configuration for tabs
 * @readonly
 */
const TAB_STYLE = {
    defaultWidth: 65,
    minWidth: 30,         // Minimum allowed tab width
    maxWidth: 200,        // Maximum allowed tab width
    height: 18,
    fontSize: 9,
    normalColor: "#5a5a5a",
    textColor: "white",
    borderRadius: 4,
    fontFamily: "'Segoe UI', Arial, sans-serif"
};

/**
 * Utility class for bounding box calculations
 * Optimizes memory usage by reusing a single Float32Array
 */
class BoundingBoxCalculator {
    constructor() {
        this.boundingBoxBuffer = new Float32Array(4);
    }

    /**
     * Calculate the bounding box containing all provided rectangles
     * @param {Array<{x: number, y: number, width: number, height: number}>} rects - Array of rectangles
     * @returns {Float32Array} Bounding box as [x, y, width, height]
     */
    calculate(rects) {
        if (!rects || rects.length === 0) {
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

// Create a single instance of the calculator for reuse
const boundingBoxCalculator = new BoundingBoxCalculator();

/**
 * Class to handle tab interactions and rendering
 */
class TabManager {
    /**
     * Get the width of a tab, with validation
     * @param {Object} config - Tab configuration
     * @param {boolean} isSecondTab - Whether this is the second tab
     * @returns {number} - The tab width
     */
    static getTabWidth(config, isSecondTab = false) {
        try {
            if (!config) {
                return TAB_STYLE.defaultWidth;
            }
            
            let width;
            if (isSecondTab) {
                width = config.secondTabWidth || TAB_STYLE.defaultWidth;
            } else {
                width = config.width || TAB_STYLE.defaultWidth;
            }
            
            // Validate width is within acceptable range
            return Math.min(Math.max(width, TAB_STYLE.minWidth), TAB_STYLE.maxWidth);
        } catch (error) {
            console.warn("Error getting tab width:", error);
            return TAB_STYLE.defaultWidth;
        }
    }

    /**
     * Check if tabs would overlap with current configuration
     * @param {Object} properties - Node properties
     * @returns {boolean} - True if tabs would overlap
     */
    static wouldTabsOverlap(properties) {
        if (!properties.hasSecondTab) return false;
        
        const tab1End = properties.tabXOffset + properties.tabWidth;
        const tab2Start = properties.secondTabOffset;
        
        return tab2Start < tab1End + NODE_METRICS.MIN_TAB_SPACING;
    }

    /**
     * Draw a tab on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Tab text
     * @param {number} width - Tab width
     */
    static drawTab(ctx, x, y, text, width) {
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

        // Text rendering with optimizations
        ctx.fillStyle = textColor;
        ctx.textRendering = 'optimizeLegibility';
        ctx.imageSmoothingEnabled = true;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Truncate text if it's too long for the tab
        let displayText = text;
        const textWidth = ctx.measureText(text).width;
        if (textWidth > width - 10) {
            // Create ellipsis if text is too long
            while (ctx.measureText(displayText + "...").width > width - 10 && displayText.length > 0) {
                displayText = displayText.slice(0, -1);
            }
            displayText += "...";
        }
        
        ctx.fillText(displayText, x + width / 2, y + height / 2);
        ctx.restore();
    }

    /**
     * Handle tab click to reorder the node
     * @param {LiteGraph.LGraphNode} node - The node being clicked
     * @param {boolean} toFront - Whether to bring the node to front
     * @returns {Function} - Cleanup function
     */
    static handleNodeOrder(node, toFront = true) {
        const { graph } = node;
        if (!graph?._nodes) return null;

        const index = graph._nodes.indexOf(node);
        if (index === -1) return null;

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
    }
}

/**
 * Helper function to check if a point is inside a rectangle
 * @param {number} x - Point X coordinate
 * @param {number} y - Point Y coordinate
 * @param {number} rx - Rectangle X coordinate
 * @param {number} ry - Rectangle Y coordinate
 * @param {number} rw - Rectangle width
 * @param {number} rh - Rectangle height
 * @returns {boolean} - True if point is inside rectangle
 */
const isInsideRect = (x, y, rx, ry, rw, rh) => (
    x >= rx && x <= rx + rw && y >= ry && y <= ry + rh
);

/**
 * Main class to handle node tab functionality
 */
class NodeWithTabs {
    /**
     * Initialize a node with tab properties
     * @param {LiteGraph.LGraphNode} node - The node being created
     */
    static onNodeCreated(node) {
        // Add properties to the node when it's created
        node.addProperty("enableTabs", false, "boolean", "Enable tabs above the node");
        node.addProperty("tabWidth", TAB_STYLE.defaultWidth, "number", "Width of the main tab");
        node.addProperty("tabXOffset", NODE_METRICS.DEFAULT_TAB_X_OFFSET, "number", "X offset for the main tab");
        node.addProperty("hasSecondTab", false, "boolean", "Enable a second tab");
        node.addProperty("secondTabText", "Send Back", "string", "Text for the second tab");
        node.addProperty("secondTabOffset", NODE_METRICS.DEFAULT_SECOND_TAB_OFFSET, "number", "X offset for second tab");
        node.addProperty("secondTabWidth", TAB_STYLE.defaultWidth, "number", "Width of the second tab");
        
        // Add a method to validate tab configuration
        node.validateTabConfiguration = function() {
            // Ensure tabs don't overlap
            if (TabManager.wouldTabsOverlap(this.properties)) {
                this.properties.secondTabOffset = this.properties.tabXOffset + 
                    this.properties.tabWidth + NODE_METRICS.MIN_TAB_SPACING;
            }
            
            // Validate tab widths
            this.properties.tabWidth = TabManager.getTabWidth({ width: this.properties.tabWidth });
            this.properties.secondTabWidth = TabManager.getTabWidth(
                { secondTabWidth: this.properties.secondTabWidth }, 
                true
            );
        };
    }
}

/**
 * ComfyUI NodeTabExtension
 * 
 * This extension adds customizable tabs to ComfyUI nodes.
 * Features:
 * - Add one or two tabs to a node
 * - Customize tab text, width, and position
 * - Click tabs to bring node to front or send to back
 * 
 * Usage:
 * 1. Enable tabs on a node by setting the "enableTabs" property to true
 * 2. Customize the main tab width and position with "tabWidth" and "tabXOffset"
 * 3. Enable a second tab with "hasSecondTab" and customize with "secondTabText",
 *    "secondTabOffset", and "secondTabWidth"
 */
app.registerExtension({
    name: "FluxContinuum.NodeTabExtension",
    
    // Using the modern nodeCreated hook that works with the latest ComfyUI version
    nodeCreated(node) {
        try {
            // Store original methods to call them when appropriate
            const originalMethods = {
                onNodeCreated: node.onNodeCreated,
                getBounding: node.getBounding,
                isPointInside: node.isPointInside,
                onMouseDown: node.onMouseDown,
                onMouseUp: node.onMouseUp,
                onDrawForeground: node.onDrawForeground,
                onPropertyChanged: node.onPropertyChanged
            };

            // Override onNodeCreated method
            node.onNodeCreated = function() {
                if (originalMethods.onNodeCreated) {
                    originalMethods.onNodeCreated.apply(this, arguments);
                }
                NodeWithTabs.onNodeCreated(this);
            };
            
            // Call onNodeCreated immediately if the node is already created
            if (node.flags && !node._tabsInitialized) {
                NodeWithTabs.onNodeCreated(node);
                node._tabsInitialized = true;
            }

            // Add support for property validation
            node.onPropertyChanged = function(property, value) {
                if (originalMethods.onPropertyChanged) {
                    originalMethods.onPropertyChanged.call(this, property, value);
                }
                
                // If a tab-related property changed, validate the configuration
                const tabProperties = [
                    "tabWidth", "tabXOffset", "hasSecondTab", 
                    "secondTabOffset", "secondTabWidth"
                ];
                
                if (tabProperties.includes(property)) {
                    this.validateTabConfiguration();
                }
            };

            /**
             * Get the bounding box for the node including tabs
             */
            node.getBounding = function(out) {
                if (!this.properties?.enableTabs || this.flags.collapsed) {
                    return originalMethods.getBounding.call(this, out);
                }

                // Validate tab configuration
                this.validateTabConfiguration();

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

            /**
             * Check if a point is inside the node or its tabs
             */
            node.isPointInside = function(x, y, margin = 0) {
                if (!this.properties?.enableTabs || this.flags.collapsed) {
                    return originalMethods.isPointInside.call(this, x, y, margin);
                }

                // Validate tab configuration
                this.validateTabConfiguration();

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

            /**
             * Handle mouse down event on the node or its tabs
             */
            node.onMouseDown = function(event, local_pos, graphCanvas) {
                if (!this.properties?.enableTabs || this.flags.collapsed) {
                    return originalMethods.onMouseDown?.call(this, event, local_pos, graphCanvas) ?? false;
                }

                // Validate tab configuration
                this.validateTabConfiguration();

                const [localX, localY] = local_pos;
                let tabHandled = false;
                let cleanup = null;

                // Check main tab click
                const mainTabHit = isInsideRect(localX, localY,
                    this.properties.tabXOffset, -NODE_METRICS.TAB_HEIGHT,
                    this.properties.tabWidth, TAB_STYLE.height
                );
                if (mainTabHit) {
                    cleanup = TabManager.handleNodeOrder(this, true);
                    tabHandled = true;
                }

                // Check second tab click
                if (!tabHandled && this.properties.hasSecondTab) {
                    const secondTabHit = isInsideRect(localX, localY,
                        this.properties.secondTabOffset, -NODE_METRICS.TAB_HEIGHT,
                        this.properties.secondTabWidth, TAB_STYLE.height
                    );
                    if (secondTabHit) {
                        cleanup = TabManager.handleNodeOrder(this, false);
                        tabHandled = true;
                    }
                }

                // If tab was handled, return early
                if (tabHandled) {
                    // Store cleanup function to be called later
                    this._tabCleanup = cleanup;
                    return true;
                }

                // If no tab was clicked, delegate to original handler
                const originalResult = originalMethods.onMouseDown?.call(this, event, local_pos, graphCanvas) ?? false;
                return originalResult;
            };

            /**
             * Clean up any pending tab operations when mouse is released
             */
            node.onMouseUp = function(event) {
                // Call any pending tab cleanup
                if (this._tabCleanup) {
                    this._tabCleanup();
                    this._tabCleanup = null;
                }
                
                // Call original handler
                if (originalMethods.onMouseUp) {
                    return originalMethods.onMouseUp.call(this, event);
                }
            };

            /**
             * Draw the tabs above the node
             */
            node.onDrawForeground = function(ctx) {
                // Call original method first
                if (originalMethods.onDrawForeground) {
                    originalMethods.onDrawForeground.call(this, ctx);
                }

                if (!this.properties?.enableTabs || this.flags.collapsed) {
                    return;
                }

                // Validate tab configuration
                this.validateTabConfiguration();

                ctx.save();
                const baseY = -NODE_METRICS.TAB_HEIGHT;

                // Draw main tab
                TabManager.drawTab(ctx, this.properties.tabXOffset, baseY, this.title, this.properties.tabWidth);

                // Draw second tab if enabled
                if (this.properties.hasSecondTab) {
                    TabManager.drawTab(ctx, this.properties.secondTabOffset, baseY, 
                        this.properties.secondTabText, this.properties.secondTabWidth);
                }

                ctx.restore();
            };
        } catch (error) {
            console.error("NodeTabExtension: Error initializing node", error);
        }
    }
});