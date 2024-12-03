# ComfyUI Flux Continuum - Modular Interface

![banner_2](https://github.com/user-attachments/assets/5681868a-002d-46a4-9fc2-7455af728821)

> A modular workflow that brings order to the chaos of image generation pipelines.

📺 [Watch the Tutorial](https://www.youtube.com/watch?v=cjWuPcRZ1j0)

## Updates
- **Flux Continuum Light 1.0.0:**
  - Light version of the workflow with all the basic functions that requires only the FLUX.1-dev model. [Download](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%20Light%201.0.0_release.json) 
- **1.4.5:** Bug fixes
- **1.4.2:** Black Forest Labs tools update
  - Black Forest Labs tools: Integrated the new Redux, Depth, Canny, Fill and IP Adapter models
  - Preview Panel: Preview all your image inputs and masks at a glance. Great for working with multiple IP Adapters
  - Mask Feather Control: Feather the mask using one control on inpainting, outpainting and detailer
  - Text Versions: Add more tabs via properties
  - New Nodes: *FluxContinuumModelRouter*, *OutputGet*, *OutputGetString*, *OutputTextDisplay*, *DrawTextConfig* and *ConfigurableDrawText*

- **1.3.0**: Initial release

## Overview

ComfyUI Flux Continuum revolutionizes workflow management through a thoughtful dual-interface design:

- **Front-end**: A consistent control interface shared across all modules
- **Back-end**: Powerful, modular architecture for customization and experimentation

## ✨ Core Features

> Perfect for creators who want a consistent, streamlined experience across all image generation tasks, while maintaining the power to customize when needed.

- **Unified Control Interface**
  - Single set of controls affects all relevant modules
  - No more juggling separate controls for each module

- **Smart Workflow Management**
  - Only activates nodes and models required for current task
  - Toggle between different output types seamlessly
  - Efficiently handles resource allocation

- **Universal Model Integration**
  - LoRAs and IP Adapters work across all output modules
  - Seamless Black Forest Labs model support

- **Modular Architecture**
  - Clear separation between front-end and back-end
  - Focus on creation in the front-end
  - Easily extend with new modules

---

## 🚀 Quick Start  
📺 **New to Flux Continuum?** [Watch the tutorial first](https://www.youtube.com/watch?v=cjWuPcRZ1j0)  
1. Clone repo to the custom nodes folder
```shell
git clone https://github.com/robertvoy/ComfyUI-Flux-Continuum
```
2. [Download](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%201.4.5_release.json) and import the workflow into ComfyUI
> Flux Continuum Light is [available here.](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%20Light%201.0.0_release.json) (only FLUX.1-dev model is required)
2. Install missing custom nodes using the ComfyUI Manager
3. Configure your models in the config panel (press `2` to access)
4. Download any missing [models](https://comfyanonymous.github.io/ComfyUI_examples/flux/)
5. Return to the main interface (press `1`)
6. Select `txt2img` from the output selector (top left corner)
7. Run the workflow to generate your first image

---

## 🎯 Workflow Modules

### Main Modules 
> All modules use the same unified control interface

| Module | Description |
|--------|-------------|
| **txt2img** | Standard text-to-image generation. Generate images from prompts and tags |
| **txt2img noise injection** | Enhanced detail generation ([Learn more](https://youtu.be/tned5bYOC08?si=qfP2Sv2VOTzDK-uL&t=1335)) |
| **img2img** | Load your image in the top-right corner and adjust the Denoise slider |
| **inpainting** | Mask-based image editing with Black Forest Labs Fill model integration |
| **outpainting** | Expand images beyond their boundaries with controllable padding. Adjust padding areas with the pad node. Preview by running the workflow with `imgload prep` output selected. Used the Black Forest Labs Fill model. |
| **canny** | Use the new Black Forest Labs canny model to control your generation with an input image and a canny preprocessor |
| **depth** | Same as above but with the depth model |
| **detailer** | Focused refinement using mask selection. Use the `Img Mask` tab to create/load mask |
| **ultimate upscaler** | Advanced upscaling. Use Upscale Model picker, Denoise slider, and Resolution Multiple slider |
| **upscaler** | Simple model-based upscaling. Choose model and adjust the Resolution Multiple slider for size |
| **face swap** | Replace a face in your Img Load node with a face from the IP3/Face load image node. Press `3` on the keyboard to access settings. |

### Utility Modules

| Module | Description |
|--------|-------------|
| **imgload prep** | Preview processed images after crop/sharpen/resize/padding |
| **canny preprocessor** | Preview the preprocessor outputs for canny. Ue the Canny tab to adjust your settings. Run the workflow to see the changes. |
| **depth preprocessor** | Same as above but for depth. Control the depth generation with the CC tab. |

---
## 🔧 Custom Nodes

> *These custom nodes were made specifically for this workflow and are required for it to work*

### Interface Enhancement Nodes

- **Tabs**:
  - Space-saving node organization
  - Add tabs via properties panel
  - Compatible with most nodes
  - Special handling for unsupported nodes (e.g., Rgthree) using dual-tab workaround

- **Sliders**: 
  - Suite of pre-configured sliders
  - Optimized ranges and defaults for common operations
  - Seamless integration with Flux workflow

- **OutputGet**
  - Filters set nodes with the prefix `Output -`
  - Comes with OutputTextDisplay: displays the name of the selected output in the OutputGet node
  - And OutputGetString: outputs the selected output name in the OutputGet node as a string

- **Text Versions**:
  - 5-tab text management system for prompt organization
  - Add more tabs using the properties panel for this node
  - Save different versions of your prompt/text
  - Great for experimenting or using the detailer/inpainting

- **ImageDisplay Extension**: 
  - Displays Base64 images directly on canvas
  - Configurable via properties panel
  - Use sparingly to maintain optimal file size

### Parameter Management Nodes

- **Sampler Parameter Packer**: Consolidates sampler settings with tabbed interface
- **Sampler Parameter Unpacker**: Extracts packed parameters for workflow integration
- **Batch Boolean**: Smart batch processing control. Adds the second input image to the batch only if conditon is met
- **Flux Continuum Model Router**: Intelligent model selection and routing. Designed specifically for this workflow
- **Configurable Draw Text**: Takes an input from a Draw Text Config node with text style settings and renders text on top of an image

- **Value Pass**: An extension of `ComfyUI-KJNodes` pass-through functionality for Latent, Pipe, and SEGS data

---

## 🔜 Coming Soon

- **Multi-GPU Support**: Processing with multiple GPUs

---

## 🙏 Acknowledgments

Special thanks to the creators of these essential custom node packs:
- [rgthree ComfyUI Extensions](https://github.com/rgthree/rgthree-comfy)
- [ComfyUI Essentials](https://github.com/cubiq/ComfyUI_essentials)
- [ComfyUI Impact Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack)
- [ComfyUI KJNodes](https://github.com/kijai/ComfyUI-KJNodes)
