import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
  name: "FluxContinuum.ImageTransfer",
  
  commands: [
    {
      id: "imageTransfer",
      label: "Image Transfer",
      function: async () => {
        const sourceNodeTitle = "Img Preview";
        const destNodeTitle = "Img Load";
        
        try {
          const sourceNode = app.graph.findNodesByTitle(sourceNodeTitle)?.[0];
          const destNode = app.graph.findNodesByTitle(destNodeTitle)?.[0];
          
          if (!sourceNode || !destNode) {
            console.error(`Custom Command: Could not find nodes "${sourceNodeTitle}" and/or "${destNodeTitle}".`);
            return;
          }
          
          if (!sourceNode.images || sourceNode.images.length === 0) {
            console.warn(`Custom Command: Source node "${sourceNodeTitle}" has no image to copy.`);
            return;
          }
          
          // Get the current image index
          let currentIndex = sourceNode.imageIndex ?? 0;
          
          // Ensure index is within bounds
          currentIndex = Math.max(0, Math.min(currentIndex, sourceNode.images.length - 1));
          
          // Use the selected image
          const imageInfo = sourceNode.images[currentIndex];
          
          const response = await api.fetchApi(`/view?filename=${encodeURIComponent(imageInfo.filename)}&type=${imageInfo.type}&subfolder=${encodeURIComponent(imageInfo.subfolder)}`);
          const imageBlob = await response.blob();
          
          const formData = new FormData();
          formData.append("image", imageBlob, imageInfo.filename);
          formData.append("overwrite", "true");
          
          const uploadResponse = await api.fetchApi('/upload/image', {
            method: 'POST',
            body: formData
          });
          
          const uploadResult = await uploadResponse.json();
          
          if (!uploadResult || !uploadResult.name) {
            throw new Error("Upload failed or did not return a valid filename from the server.");
          }
          
          const newFilename = uploadResult.name;
          const imageWidget = destNode.widgets.find((w) => w.name === "image");
          
          if (imageWidget) {
            imageWidget.value = newFilename;
            if (imageWidget.callback) {
              imageWidget.callback(imageWidget.value);
            }
            destNode.setDirtyCanvas(true, true);
          } else {
            console.error(`Custom Command: Could not find the 'image' widget on "${destNodeTitle}".`);
          }
        } catch (error) {
          console.error("Custom Command: An error occurred:", error);
        }
      },
    },
  ],
  keybindings: [
    {
      combo: { key: "c", ctrl: true, shift: true },
      commandId: "imageTransfer",
    },
  ],
});
