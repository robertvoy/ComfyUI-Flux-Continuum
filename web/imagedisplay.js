import { app } from "../../../scripts/app.js";

// Default white square image (200x200 pixels, white)
const DEFAULT_IMAGE = "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";

class ImageDisplay extends LGraphNode {
   constructor() {
       super();
       this.isVirtualNode = true;
       this.shape = LiteGraph.BOX_SHAPE;
       
       this.size = [200, 200];
       this.bgcolor = "#00000000";
       this.color = "#00000000";
       this.resizable = true;
       
       // Add properties to store original dimensions and image data
       this.properties = {
           originalWidth: 200,
           originalHeight: 200,
           maintainAspectRatio: true,
           imageBase64: DEFAULT_IMAGE, // Initialize with default image
       };
       
       this.addProperty("imageBase64", DEFAULT_IMAGE, "string");  // Add widget for image input
       
       this.widgets_up = true;
       this.img = new Image();
       this.loaded = false;
       
       this.setupImage();
   }

   setupImage() {
       this.img.onload = () => {
           console.log("Image loaded successfully!");
           console.log("Image dimensions:", this.img.width, "x", this.img.height);
           this.loaded = true;
           
           // Store original dimensions
           this.properties.originalWidth = this.img.width;
           this.properties.originalHeight = this.img.height;
           
           // Set initial size if not restored from previous session
           if (!this.properties.lastWidth) {
               this.size[0] = this.img.width;
               this.size[1] = this.img.height;
           } else {
               // Restore previous size
               this.size[0] = this.properties.lastWidth;
               this.size[1] = this.properties.lastHeight;
           }
           
           this.setDirtyCanvas(true);
       };

       this.img.onerror = (err) => {
           console.error("Error loading image:", err);
           // If loading fails, revert to default image
           if (this.properties.imageBase64 !== DEFAULT_IMAGE) {
               console.log("Reverting to default image");
               this.properties.imageBase64 = DEFAULT_IMAGE;
               this.img.src = "data:image/png;base64," + DEFAULT_IMAGE;
           }
       };

       // Load initial image
       this.img.src = "data:image/png;base64," + this.properties.imageBase64;
   }

   // Method to update image when base64 property changes
   onPropertyChanged(name, value) {
       if (name === "imageBase64") {
           this.loaded = false;
           // If value is empty, use default image
           const imageData = value || DEFAULT_IMAGE;
           this.img.src = "data:image/png;base64," + imageData;
       }
   }

   // Handle resizing with aspect ratio
   onResize(size) {
       if (this.properties.maintainAspectRatio && this.loaded) {
           const aspectRatio = this.properties.originalWidth / this.properties.originalHeight;
           const currentRatio = size[0] / size[1];
           
           if (currentRatio > aspectRatio) {
               size[0] = size[1] * aspectRatio;
           } else {
               size[1] = size[0] / aspectRatio;
           }
       }
       
       this.properties.lastWidth = size[0];
       this.properties.lastHeight = size[1];
       
       return size;
   }

   // Serialize the node state
   onSerialize(o) {
       if (this.loaded) {
           o.lastWidth = this.size[0];
           o.lastHeight = this.size[1];
           o.imageBase64 = this.properties.imageBase64;  // Save image data
       }
   }

   // Deserialize the node state
   onConfigure(o) {
       if (o.lastWidth !== undefined) {
           this.properties.lastWidth = o.lastWidth;
           this.properties.lastHeight = o.lastHeight;
       }
       if (o.imageBase64 !== undefined) {
           this.properties.imageBase64 = o.imageBase64;
           this.onPropertyChanged("imageBase64", o.imageBase64);
       }
   }
}

// Override the default node drawing
const oldDrawNode = LGraphCanvas.prototype.drawNode;
LGraphCanvas.prototype.drawNode = function(node, ctx) {
   if (node.constructor === ImageDisplay) {
       const tmp_shape = node.shape;
       const tmp_color = node.color;
       const tmp_bgcolor = node.bgcolor;
       
       node.shape = null;
       node.color = "#00000000";
       node.bgcolor = "#00000000";
       
       const r = oldDrawNode.apply(this, arguments);
       
       if (node.img && node.loaded) {
           ctx.save();
           ctx.drawImage(node.img, 0, 0, node.size[0], node.size[1]);
           ctx.restore();
       }
       
       node.shape = tmp_shape;
       node.color = tmp_color;
       node.bgcolor = tmp_bgcolor;
       
       return r;
   }
   return oldDrawNode.apply(this, arguments);
};

app.registerExtension({
   name: "ImageDisplay",
   async beforeRegisterNodeDef(nodeType, nodeData, app) {
       if (nodeData.name === "ImageDisplay") {
           nodeType.prototype.execute = () => {}; 
       }
   },
   registerCustomNodes() {
       LiteGraph.registerNodeType(
           "ImageDisplay",
           Object.assign(ImageDisplay, {
               title: "ImageDisplay",
               title_mode: LiteGraph.NO_TITLE,
               category: "Flux-Continuum/Utilities",
               comfyClass: "ImageDisplay"
           })
       );

       ImageDisplay.prototype.flags = { no_title: true };
   }
});