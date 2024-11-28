import { app } from "../../../scripts/app.js";

//based on KJNodes SetGet: https://github.com/kijai/ComfyUI-KJNodes

// Configuration
const CONFIG = {
    NODE: {
        name: "OutputGet",
        category: "Flux-Continuum/Utilities",
        title: "OutputGet",
        defaultColor: "#FFF",
        prefix: "Output -"
    },
    CACHE: {
        timeout: 1000,
        debounceWait: 100
    },
    ERRORS: {
        singletonError: "Error: Only one OutputGet node is allowed.",
        noSetNodeError: "No Output SetNode found for",
        errorTimeout: 5000
    }
};

// Helper functions
function debounce(func, wait = CONFIG.CACHE.debounceWait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function createCachedFunction(fn) {
    let cache = null;
    let lastUpdate = 0;

    return function (...args) {
        const now = Date.now();
        if (!cache || (now - lastUpdate) > CONFIG.CACHE.timeout) {
            cache = fn.apply(this, args);
            lastUpdate = now;
        }
        return cache;
    };
}

app.registerExtension({
    name: CONFIG.NODE.name,
    registerCustomNodes() {
        class OutputGetNode extends LGraphNode {
            static instance = null;

            constructor(title) {
                super(title);

                if (OutputGetNode.instance) {
                    alert(CONFIG.ERRORS.singletonError);
                    setTimeout(() => this.graph?.remove(this), 0);
                    return;
                }
                
                OutputGetNode.instance = this;

                if (!this.properties) {
                    this.properties = {};
                }
                this.properties.showOutputText = true;
                const node = this;

                const widget = this.addWidget(
                    "combo",
                    "Selected",
                    "",
                    function (value, canvas, node, pos, event) {
                        try {
                            this.value = value;
                            node.widgets[0].value = value;
                            node.onRename();
                            node.graph._version++;
                            node.setDirtyCanvas(true, true);
                            node.updateGetStringTitles();
                        } catch (error) {
                            console.error("Error in combo widget callback:", error);
                        }
                    },
                    {
                        values: () => node.getSetterNodeTitles(node.graph),
                    }
                );

                this.addOutput("*", '*');

                this.onConnectionsChange = function (slotType, slot, isChangeConnect, link_info, output) {
                    try {
                        this.validateLinks();
                        if (link_info && node.graph) {
                            const setter = node.findSetter(node.graph);
                            if (setter) {
                                let linkType = setter.inputs[0].type;
                                node.setType(linkType);
                                node.updateGetStringTitles();
                            }
                        }
                        node.setDirtyCanvas(true, true);
                    } catch (error) {
                        console.error("Error in onConnectionsChange:", error);
                    }
                };

                this.setName = function (name) {
                    try {
                        node.widgets[0].value = name;
                        node.onRename();
                        node.serialize();
                        node.updateGetStringTitles();
                    } catch (error) {
                        console.error("Error in setName:", error);
                    }
                };

                this.onRename = function () {
                    try {
                        const setter = node.findSetter(node.graph);
                        if (setter) {
                            let linkType = setter.inputs[0].type;
                            node.setType(linkType);
                            node.title = setter.widgets[0].value;

                            if (app.ui.settings.getSettingValue("KJNodes.nodeAutoColor")) {
                                setColorAndBgColor.call(node, linkType);
                            }

                            node.updateGetStringTitles();
                        } else {
                            node.setType('*');
                        }
                    } catch (error) {
                        console.error("Error in onRename:", error);
                    }
                };

                this.updateGetStringTitles = debounce(function () {
                    try {
                        const getStringNodes = this.graph._nodes.filter((n) => n.type === "OutputGetString");
                        getStringNodes.forEach((getStringNode) => {
                            getStringNode.title = "GetString_" + this.title;
                        });
                    } catch (error) {
                        console.error("Error updating GetString titles:", error);
                    }
                }, CONFIG.CACHE.debounceWait);

                this.getSetterNodeTitles = createCachedFunction(function (graph) {
                    return graph._nodes
                        .filter(node => node.type === 'SetNode' && node.widgets[0].value.startsWith(CONFIG.NODE.prefix))
                        .map(node => node.widgets[0].value)
                        .sort();
                });

                this.defaultVisibility = true;
                this.serialize_widgets = true;
                this.drawConnection = false;
                this.slotColor = CONFIG.NODE.defaultColor;
                this.currentSetter = null;
                this.canvas = app.canvas;
                this.isVirtualNode = true;
            }

            onRemoved() {
                if (OutputGetNode.instance === this) {
                    OutputGetNode.instance = null;
                }
                this.drawConnection = false;
                this.currentSetter = null;
            }

            validateLinks() {
                if (this.outputs[0].type !== '*' && this.outputs[0].links) {
                    this.outputs[0].links.filter((linkId) => {
                        const link = this.graph.links[linkId];
                        return link && (link.type !== this.outputs[0].type && link.type !== '*');
                    }).forEach((linkId) => {
                        this.graph.removeLink(linkId);
                    });
                }
            }

            setType(type) {
                this.outputs[0].name = type;
                this.outputs[0].type = type;
                this.validateLinks();
            }

            findSetter(graph) {
                const name = this.widgets[0].value;
                return graph._nodes.find(
                    (otherNode) =>
                        otherNode.type === 'SetNode' &&
                        otherNode.widgets[0].value === name &&
                        name !== '' &&
                        name.startsWith(CONFIG.NODE.prefix)
                );
            }

            goToSetter() {
                const setter = this.findSetter(this.graph);
                if (setter) {
                    this.canvas.centerOnNode(setter);
                    this.canvas.selectNode(setter);
                }
            }

            getInputLink(slot) {
                try {
                    const setter = this.findSetter(this.graph);
                    if (setter) {
                        const slotInfo = setter.inputs[slot];
                        return this.graph.links[slotInfo.link];
                    } else {
                        const message = `${CONFIG.ERRORS.noSetNodeError} ${this.widgets[0].value}`;
                        if (!window.isAlertShown) {
                            window.isAlertShown = true;
                            alert(message);
                            setTimeout(() => (window.isAlertShown = false), CONFIG.ERRORS.errorTimeout);
                        }
                    }
                } catch (error) {
                    console.error("Error in getInputLink:", error);
                    return null;
                }
            }

            getExtraMenuOptions(_, options) {
                let menuEntry = this.drawConnection ? "Hide connections" : "Show connections";

                options.unshift(
                    {
                        content: "Go to output setter",
                        callback: () => {
                            this.goToSetter();
                        },
                    },
                    {
                        content: menuEntry,
                        callback: () => {
                            try {
                                this.currentSetter = this.findSetter(this.graph);
                                if (!this.currentSetter) return;
                                let linkType = this.currentSetter.inputs[0].type;
                                this.drawConnection = !this.drawConnection;
                                this.slotColor = this.canvas.default_connection_color_byType[linkType];
                                this.canvas.setDirty(true, true);
                            } catch (error) {
                                console.error("Error in menu callback:", error);
                            }
                        },
                    }
                );
            }

            onDrawForeground(ctx, lGraphCanvas) {
                if (this.drawConnection) {
                    this._drawVirtualLink(lGraphCanvas, ctx);
                }
            }

            _drawVirtualLink(lGraphCanvas, ctx) {
                if (!this.currentSetter) return;

                try {
                    let start_node_slotpos = this.currentSetter.getConnectionPos(false, 0);
                    start_node_slotpos = [
                        start_node_slotpos[0] - this.pos[0],
                        start_node_slotpos[1] - this.pos[1],
                    ];
                    let end_node_slotpos = [0, -LiteGraph.NODE_TITLE_HEIGHT * 0.5];
                    lGraphCanvas.renderLink(
                        ctx,
                        start_node_slotpos,
                        end_node_slotpos,
                        null,
                        false,
                        null,
                        this.slotColor
                    );
                } catch (error) {
                    console.error("Error drawing virtual link:", error);
                }
            }
        }

        LiteGraph.registerNodeType(CONFIG.NODE.name, OutputGetNode);
        OutputGetNode.category = CONFIG.NODE.category;

        const originalCheckNodeTypes = LGraphCanvas.prototype.checkNodeTypes;
        LGraphCanvas.prototype.checkNodeTypes = function() {
            const r = originalCheckNodeTypes.apply(this, arguments);
            
            if (r && r.type === CONFIG.NODE.name && OutputGetNode.hasInstance()) {
                r.disabled = true;
                r.tooltip = CONFIG.ERRORS.singletonError;
            }
            
            return r;
        };
    },
});

app.registerExtension({
  name: "OutputGetString",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "OutputGetString") {
      return;
    }

    // Ensure the widget is hidden and updated
    const ensureHiddenWidget = (node) => {
      let widget = node.widgets?.find((w) => w.name === "title");
      if (!widget) {
        // If the widget does not exist, create it
        widget = { name: "title", value: "", hidden: true, serialize: true };
        node.widgets = node.widgets || [];
        node.widgets.push(widget);
      }
      // Keep it hidden and serialized
      widget.hidden = true;
      return widget;
    };

    // Update title and widget values
    const updateGetStringTitles = (graph) => {
      const getStringNodes = graph._nodes.filter((n) => n.type === "OutputGetString");
      const outputGetNode = graph._nodes.find((n) => n.type === CONFIG.NODE.name);

      getStringNodes.forEach((node) => {
        const titleWidget = ensureHiddenWidget(node);
        if (outputGetNode) {
          // Update the title and widget value
          const newTitle = "GetString_" + outputGetNode.title;
          node.title = newTitle;
          titleWidget.value = newTitle.replace("GetString_", "");
        } else {
          // Default title if no OutputGet node
          node.title = "GetString";
          titleWidget.value = "";
        }
      });
    };

    // Hijack app.queuePrompt to update titles on execution
    const originalQueuePrompt = app.queuePrompt;
    app.queuePrompt = async function () {
      const graph = app.graph;
      if (graph) {
        updateGetStringTitles(graph);
      }
      return await originalQueuePrompt.apply(this, arguments);
    };

    // Initialize hidden widget on node addition
    nodeType.prototype.onAdded = function (graph) {
      ensureHiddenWidget(this);
      this.updateTitle();
    };

    // Update title when called
    nodeType.prototype.updateTitle = function () {
      if (!this.graph) {
        return;
      }
      const outputGetNode = this.findOutputGetNode(this.graph);
      if (outputGetNode) {
        this.title = "GetString_" + outputGetNode.title;
      } else {
        this.title = "GetString";
      }
    };

    // Find the OutputGet node in the graph
    nodeType.prototype.findOutputGetNode = function (graph) {
      return graph._nodes.find((node) => node.type === CONFIG.NODE.name);
    };
  },
});

class TextDisplay extends LGraphNode {
    constructor() {
        super();
        this.isVirtualNode = true;
        this.shape = LiteGraph.BOX_SHAPE;
        this.size = [200, 50];
        this.resizable = true;
        this.properties = {
            fontSize: 24,
            fontFamily: "Arial",
            fontColor: "#ffffff",
            textAlign: "center",
            bgColor: "transparent",
            padding: 10
        };
        this.widgets_up = true;
        this.bgcolor = "#00000000";
    }

    onAdded(graph) {
        // When added to a graph, move to end of nodes array
        if (graph && graph._nodes) {
            const index = graph._nodes.indexOf(this);
            if (index !== -1) {
                graph._nodes.splice(index, 1);
                graph._nodes.push(this);
            }
        }
    }

    onDragFinished() {
        // After dragging, ensure node stays at end of array
        if (this.graph && this.graph._nodes) {
            const index = this.graph._nodes.indexOf(this);
            if (index !== -1) {
                this.graph._nodes.splice(index, 1);
                this.graph._nodes.push(this);
            }
        }
    }

    onDrawForeground(ctx) {
        if (!this.graph) return;
        
        // Always ensure this node is at the end of the array before drawing
        const index = this.graph._nodes.indexOf(this);
        if (index !== -1 && index !== this.graph._nodes.length - 1) {
            this.graph._nodes.splice(index, 1);
            this.graph._nodes.push(this);
        }
        
        const outputGetNode = this.findOutputGetNode(this.graph);
        if (!outputGetNode || !outputGetNode.widgets[0]) {
            this.displayText = "NO OUTPUTGET NODE FOUND";
        } else {
            this.displayText = outputGetNode.widgets[0].value || "NO SELECTION";
            this.displayText = this.displayText.toUpperCase();
        }

        ctx.save();
        ctx.textAlign = this.properties.textAlign;
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.properties.fontColor || "#ffffff";
        ctx.font = `${this.properties.fontSize}px ${this.properties.fontFamily}`;

        const x = this.properties.textAlign === "center" ? this.size[0] / 2 : 
                 this.properties.textAlign === "right" ? this.size[0] - 10 : 10;
        
        const y = this.size[1] / 2;
        ctx.fillText(this.displayText, x, y);
        ctx.restore();
    }

    findOutputGetNode(graph) {
        return graph._nodes.find((node) => node.type === "OutputGet");
    }

    onResize(size) {
        size[0] = Math.max(50, size[0]);
        size[1] = Math.max(20, size[1]);
        return size;
    }

    onDblClick(event, pos, canvas) {
        LGraphCanvas.active_canvas.showShowNodePanel(this);
    }
}

// Node type registration with required static properties
TextDisplay.title = "OutputTextDisplay";
TextDisplay.title_mode = LiteGraph.NO_TITLE;
TextDisplay.collapsable = false;

const oldDrawNode = LGraphCanvas.prototype.drawNode;
LGraphCanvas.prototype.drawNode = function(node, ctx) {
    if (node.constructor === TextDisplay) {
        const tmp_shape = node.shape;
        node.shape = null;
        const r = oldDrawNode.apply(this, arguments);
        if (node.onDrawForeground) {
            node.onDrawForeground(ctx);
        }
        node.shape = tmp_shape;
        return r;
    }
    return oldDrawNode.apply(this, arguments);
};

app.registerExtension({
    name: "OutputTextDisplay",
    registerCustomNodes() {
        LiteGraph.registerNodeType(
            "OutputTextDisplay",
            Object.assign(TextDisplay, {
                title: "OutputTextDisplay",
                title_mode: LiteGraph.NO_TITLE,
                category: "Flux-Continuum/Utilities",
                comfyClass: "OutputTextDisplay",
                "@fontSize": { type: "number" },
                "@fontFamily": { type: "string" },
                "@fontColor": { type: "string", default: "#ffffff" },
                "@bgColor": { type: "string", default: "#00000000" },
                "@textAlign": { type: "combo", values: ["left", "center", "right"] },
                "@padding": { type: "number" }
            })
        );
        TextDisplay.prototype.flags = { no_title: true };
    }
});