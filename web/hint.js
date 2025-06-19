import { app } from "../../../scripts/app.js";

app.registerExtension({
    name: "FluxContinuum.HintNode",

    registerCustomNodes() {

        const LiteGraph = window.LiteGraph;

        // --- Stylesheet for the popup ---
        const create_hint_stylesheet = () => {
            const tagId = 'flux-hint-stylesheet-final';
            if (document.head.querySelector(`#${tagId}`)) return;
            
            const styleTag = document.createElement('style');
            styleTag.id = tagId;
            styleTag.innerHTML = `
            .flux-hint-popup-final {
                background: var(--comfy-menu-bg);
                position: absolute;
                color: var(--fg-color);
                font: 12px monospace;
                line-height: 1.5em;
                padding: 25px;
                border-radius: 10px;
                border: 1px solid var(--border-color);
                z-index: 101;
                overflow: hidden;
                min-width: 200px;
                max-width: 500px;
                min-height: 50px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .flux-hint-popup-final .content-wrapper {
                overflow: auto;
                max-height: 400px;
                white-space: pre-wrap;
            }
            .flux-hint-popup-final .content-wrapper p,
            .flux-hint-popup-final .content-wrapper h1,
            .flux-hint-popup-final .content-wrapper h2,
            .flux-hint-popup-final .content-wrapper h3,
            .flux-hint-popup-final .content-wrapper h4,
            .flux-hint-popup-final .content-wrapper h5,
            .flux-hint-popup-final .content-wrapper h6 {
                margin-top: 0.1em !important;
                margin-bottom: 0.1em !important;
            }
            .flux-hint-edit-dialog textarea {
                width: 500px;
                height: 200px; 
                font-family: monospace;
            }
            .flux-hint-edit-dialog .buttons {
                text-align: right;
                margin-top: 10px;
            }
            `;
            document.head.appendChild(styleTag);
        };

        // --- Define the custom Hint Node class ---
        class FCHintNode extends LiteGraph.LGraphNode {
            constructor() {
                super("Hint");
                
                this.isVirtualNode = true;
                this.shape = LiteGraph.ROUND_SHAPE;
                this.resizable = false; 
                this.size = [20, 20];

                this.properties = {
                    hint_content: "Right-click me and choose 'Edit Hint' to add multi-line text!\n\n**Markdown** is supported.",
                    saved_size: null 
                };

                this.popupElement = null;
                this.contentWrapper = null;
                this.docCtrl = null;
                this.closeTimer = null;
                
                create_hint_stylesheet();
            }
            
            // --- Core LiteGraph Methods ---
            
            getExtraMenuOptions(canvas, options) {
                options.unshift({
                    content: "Edit Hint...",
                    callback: () => {
                        const initialValue = this.properties.hint_content;
                        
                        const dialogContent = `
                            <div class="flux-hint-edit-dialog">
                                <textarea autofocus>${initialValue}</textarea>
                                <div class="buttons">
                                    <button id="hint-cancel-btn">Cancel</button>
                                    <button id="hint-save-btn" style="margin-left: 5px;">Save</button>
                                </div>
                            </div>`;

                        const dialog = canvas.createDialog(dialogContent, {
                            title: "Edit Hint Content",
                            close_on_click_outside: true,
                        });

                        const textarea = dialog.querySelector("textarea");
                        const saveBtn = dialog.querySelector("#hint-save-btn");
                        const cancelBtn = dialog.querySelector("#hint-cancel-btn");

                        saveBtn.addEventListener('click', () => {
                            this.properties.hint_content = textarea.value;
                            if (this.popupElement) {
                                this.updatePopupContent();
                            }
                            dialog.close();
                        });

                        cancelBtn.addEventListener('click', () => {
                            dialog.close();
                        });
                    }
                });
            }

            computeSize(out) {
                if (this.properties.saved_size) return this.properties.saved_size;
                return [20, 20];
            }
            
            onAdded(graph) {
                if (this.properties.saved_size) this.size = this.properties.saved_size;
            }
            
            onResize(size) { }

            onMouseEnter(e) {
                if (this.closeTimer) clearTimeout(this.closeTimer);
                this.createPopup();
            }

            onMouseLeave(e) {
                this.closeTimer = setTimeout(() => this.removePopup(), 300);
            }

            onDrawBackground(ctx) {}

            onDrawForeground(ctx) {
                if (this.flags.collapsed) return;
                
                ctx.save();
                ctx.font = 'bold ' + (this.size[1] * 0.6) + 'px monospace';
                ctx.fillStyle = this.popupElement ? 'orange' : 'rgba(255, 255, 255, 0.7)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', this.size[0] / 2, this.size[1] / 2 + 2);
                ctx.restore();
                
                if (this.popupElement) {
                    this.updatePopupPosition(ctx);
                }
            }
            
            onRemoved() {
                this.removePopup();
            }

            onSerialize(o) {
                o.size = this.size;
                o.hint_content = this.properties.hint_content;
            }

            onConfigure(o) {
                if (o.size) {
                    this.properties.saved_size = o.size;
                    this.size = o.size;
                }
                if (o.hint_content) this.properties.hint_content = o.hint_content;
            }

            // --- Popup Management ---
            updatePopupPosition(ctx) {
                if (!this.popupElement || !ctx) return;
            
                const canvas = app.canvas.canvas;
                const rect = canvas.getBoundingClientRect();
                const scaleX = rect.width / canvas.width;
                const scaleY = rect.height / canvas.height;

                const transform = new DOMMatrix()
                    .scaleSelf(scaleX, scaleY)
                    .multiplySelf(ctx.getTransform())
                    .translateSelf(this.size[0], 0)
                    .translateSelf(10 / scaleX, 0);
                
                const scale = new DOMMatrix().scaleSelf(transform.a, transform.d);

                Object.assign(this.popupElement.style, {
                    transformOrigin: '0 0',
                    transform: scale,
                    left: `${rect.x + transform.e}px`,
                    top: `${rect.y + transform.f}px`,
                });
            }

            createPopup() {
                if (this.popupElement) return;
                
                this.popupElement = document.createElement('div');
                this.contentWrapper = document.createElement('div');
                this.popupElement.appendChild(this.contentWrapper);

                this.popupElement.className = 'flux-hint-popup-final';
                this.contentWrapper.className = 'content-wrapper';

                this.popupElement.addEventListener('mouseenter', () => {
                    if (this.closeTimer) clearTimeout(this.closeTimer);
                });
                this.popupElement.addEventListener('mouseleave', () => {
                    this.closeTimer = setTimeout(() => this.removePopup(), 300);
                });
                
                this.updatePopupContent();
                this.addPopupControls();
                
                document.body.appendChild(this.popupElement);
            }

            removePopup() {
                if (this.closeTimer) clearTimeout(this.closeTimer);
                if (this.popupElement) this.popupElement.remove();
                if (this.docCtrl) this.docCtrl.abort();
                this.popupElement = null;
                this.docCtrl = null;
            }
            
            updatePopupContent() {
                if (!this.contentWrapper) return;
                const content = this.properties.hint_content || "";

                if (window.marked && window.DOMPurify) {
                    const html = marked.parse(content, { breaks: true });
                    this.contentWrapper.innerHTML = DOMPurify.sanitize(html);
                } else {
                    this.contentWrapper.textContent = content;
                }
            }

            addPopupControls() {
                const resizeHandle = document.createElement('div');
                Object.assign(resizeHandle.style, {
                    width: '0', height: '0', position: 'absolute', bottom: '0', right: '0', cursor: 'se-resize',
                    borderTop: '10px solid transparent', borderLeft: '10px solid transparent',
                    borderBottom: '10px solid var(--border-color)', borderRight: '10px solid var(--border-color)'
                });
                this.popupElement.appendChild(resizeHandle);
                
                // ** The close button creation logic has been removed. **
                
                this.docCtrl = new AbortController();
                const signal = this.docCtrl.signal;
                
                let isResizing = false, startX, startY, startWidth, startHeight;
                
                resizeHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    isResizing = true;
                    startX = e.clientX; startY = e.clientY;
                    startWidth = this.popupElement.offsetWidth;
                    startHeight = this.popupElement.offsetHeight;
                }, { signal });
                
                document.addEventListener('mousemove', (e) => {
                    if (!isResizing) return;
                    const newWidth = startWidth + (e.clientX - startX);
                    const newHeight = startHeight + (e.clientY - startY);
                    this.popupElement.style.width = `${newWidth}px`;
                    this.popupElement.style.height = `${newHeight}px`;
                }, { signal });

                document.addEventListener('mouseup', () => { isResizing = false; }, { signal });
            }
        }

        // --- Register the Node with LiteGraph ---
        const nodeClassName = "Hint Node";
        const nodeCategory = "Flux-Continuum/Utilities";
        
        LiteGraph.registerNodeType(nodeClassName, Object.assign(FCHintNode, {
            title: "Hint",
            title_mode: LiteGraph.NO_TITLE,
            category: nodeCategory
        }));
        
        FCHintNode.prototype.flags = { no_title: true };
    }
});