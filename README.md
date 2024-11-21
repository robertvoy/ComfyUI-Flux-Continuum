![image](https://github.com/user-attachments/assets/6ef432d1-aca7-4995-8905-e013a56afb0e)# ComfyUI Flux Continuum - Modular Interface

![image](https://github.com/user-attachments/assets/c7d38628-4e0c-46f4-8458-06865d280cd3)

> A modular workflow that brings order to the chaos of image generation pipelines.

## Overview

ComfyUI Flux Continuum revolutionizes workflow management through a thoughtful dual-interface design:

- **Front-end**: A consistent control interface shared across all modules
- **Back-end**: Powerful, modular architecture for customization and experimentation

### Key Benefits

- 🎛️ **Unified Controls**: Same controls work across different modules
  - Adjust denoise, steps, and other parameters from one place
  - Controls intelligently affect only relevant modules
  - No more juggling separate controls for each module

- 🔄 **Smart Workflow Management**
  - Switch between modules while maintaining your settings
  - Only activates nodes required for your current task
  - Seamlessly integrate LoRAs and ControlNets across all modules

- 🛠️ **Flexible Architecture**
  - Tinker with modules in the back-end
  - Focus on creation in the front-end
  - Easily extend with new modules

Perfect for creators who want a consistent, streamlined experience across all image generation tasks, while maintaining the power to customize when needed.

---

## 🚀 Quick Start

1. [Download](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%201.3_release.json) and import the workflow into ComfyUI
2. Install required custom nodes using the ComfyUI Manager
3. Configure your models in the config panel (press `2` to access)
4. Download any missing models
5. Return to the main interface (press `1`)
6. Select `txt2img` from the output selector (top left corner)
7. Run the workflow to generate your first image

---
<div align="center">

https://github.com/user-attachments/assets/0fd7fe33-2ede-48ad-a627-27f6501fe636

</div>

## ✨ Core Features

- **Efficient Multi-purpose Workflow**
  - One interface controls multiple modules
  - Toggle between different output types seamlessly
  - Only activates nodes needed for current output

- **Unified Controls**
  - Single set of controls affects all relevant modules
  - Controls automatically adapt to module context
  - Example: denoise slider works for img2img but not txt2img

- **Universal LoRA & ControlNet Support**
  - Works across all output modules
  - Same LoRA controls affect any output type
  - Consistent ControlNet integration across modules

- **Modular Architecture**
  - Clear separation between front-end and back-end
  - Easily extendable with new modules
  - Customize back-end without affecting front-end controls

---

## 🎯 Workflow Modules

### Main Modules 
> All modules use the same unified control interface

| Module | Description |
|--------|-------------|
| **txt2img** | Standard text-to-image generation. Generate images from prompts and tags |
| **txt2img noise injection** | Enhanced detail generation ([Learn more](https://youtu.be/tned5bYOC08?si=qfP2Sv2VOTzDK-uL&t=1335)) |
| **img2img** | Load your image in the top-right corner and adjust the Denoise slider |
| **inpainting** | Mask-based image editing with automatic ControlNet integration (set denoise to 1.0 to enable) |
| **outpainting** | Expand images beyond their boundaries with controllable padding. Adjust padding areas with the pad node. Preview by running the workflow with `imgload prep` output selected. Uses the inpainting ControlNet. |
| **detailer** | Focused refinement using mask selection. Use the `Img Mask` tab to create/load mask |
| **ultimate upscaler** | Advanced upscaling. Use Upscale Model picker, Denoise slider, and Resolution Multiple slider |
| **upscaler** | Simple model-based upscaling. Choose model and adjust the Resolution Multiple slider for size. |

### Utility Modules

| Module | Description |
|--------|-------------|
| **imgload prep** | Preview processed images after crop/sharpen/resize/padding |
| **preprocessor** | Preview ControlNet preprocessor outputs (requires ControlNet slider strength > 0) |

---
## 🔧 Custom Nodes

> *These custom nodes were made specifically for this workflow and are required for it to work*

### Interface Enhancement Nodes

- **Tabs**:
  - Space-saving node organization
  - Compatible with most nodes
  - Special handling for unsupported nodes (e.g., Rgthree) using dual-tab workaround

- **Sliders**: 
  - Suite of 6 pre-configured sliders
  - Optimized ranges and defaults for common operations
  - Seamless integration with Flux workflow

- **Text Versions**:
  - 5-tab text management system for prompt organization
  - Save different versions of your prompt/text
  - Great for experimenting or using the detailer/inpainting

- **ImageDisplay Extension**: 
  - Displays Base64 images directly on canvas
  - Configurable via properties panel
  - Use sparingly to maintain optimal file size

### Parameter Management Nodes

- **Sampler Parameter Packer**: Consolidates sampler settings with tabbed interface
- **Sampler Parameter Unpacker**: Extracts packed parameters for workflow integration

- **Value Pass**: An extension of `ComfyUI-KJNodes` pass-through functionality for Latent, Pipe, and SEGS data

---

Shoutout to these custom node packs for making this workflow possible:
- https://github.com/rgthree/rgthree-comfy
- https://github.com/cubiq/ComfyUI_essentials
- https://github.com/ltdrdata/ComfyUI-Impact-Pack
- https://github.com/kijai/ComfyUI-KJNodes

---
## 🔜 Coming Soon

- Black Forest Labs tools: new ControlNets and IP Adapter 
- Video tutorial on how to use the workflow
- Video tutorial on how to add new modules
- Multi GPU support
