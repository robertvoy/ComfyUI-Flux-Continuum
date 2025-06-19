import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

app.registerExtension({
  // A new name for our refactored extension
  name: "FluxContinuum.ImageTransfer",

  // 1. We define our action as a command with a unique ID
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

          const imageInfo = sourceNode.images[sourceNode.images.length - 1];
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
            console.log(`Custom Command: SUCCESS! "${destNodeTitle}" is now loading "${newFilename}".`);
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