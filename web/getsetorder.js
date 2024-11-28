import { app } from "../../../scripts/app.js";

const originalAlert = window.alert;
window.alert = (message) => {
    if (message === "Error: Set node input undefined. Most likely you're missing custom nodes") {
        return;
    }
    originalAlert(message);
};

// Configuration for nodes that should be forced to back
const BACKGROUND_NODE_CONFIG = {
    nodes: {
        "ImagePass": -200,
        "GetNode": -100,
        "SetNode": -150
    }
};

app.registerExtension({
    name: "GetSetNodeOrdering",
    async setup() {
        const originalLoadGraphData = app.loadGraphData;
        app.loadGraphData = function(graph_data) {
            const result = originalLoadGraphData.apply(this, arguments);
            
            // Using requestAnimationFrame instead of setTimeout for better performance
            requestAnimationFrame(() => {
                if (!app.graph?._nodes?.length) return;
                
                const nodes = app.graph._nodes;
                
                // Batch z-index updates
                for (let i = 0; i < nodes.length; i++) {
                    const zIndex = BACKGROUND_NODE_CONFIG.nodes[nodes[i].type];
                    if (zIndex !== undefined) {
                        nodes[i].z_index = zIndex;
                    }
                }
                
                // In-place sort
                nodes.sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
                
                // Mark canvas as dirty
                app.canvas.setDirty(true, true);
            });
            
            return result;
        };
    },

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        const zIndex = BACKGROUND_NODE_CONFIG.nodes[nodeType.type];
        if (zIndex === undefined) return;
        
        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function() {
            if (onNodeCreated) {
                onNodeCreated.apply(this, arguments);
            }
            this.z_index = zIndex;
        };
    }
});