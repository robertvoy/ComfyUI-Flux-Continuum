# ComfyUI Flux Continuum - Modular Interface

![banner_2](https://github.com/user-attachments/assets/5681868a-002d-46a4-9fc2-7455af728821)

> A modular workflow that brings order to the chaos of image generation pipelines.

📺 [Watch the Tutorial](https://www.youtube.com/watch?v=cjWuPcRZ1j0)

## Updates
- **1.7.0:** Enhanced workflow and usability update
  - **Image Transfer Shortcut**: Use `Ctrl+Shift+C` to copy images from Img Preview to Img Load (customizable in Settings > Keybinding > Image Transfer)
  - **Configurable Model Router**: Dynamic model selection with customizable JSON mapping for flexible workflows
  - **Hint System**: Interactive hint nodes provide contextual help throughout the workflow
  - **Crop & Stitch**: Enhanced inpainting/outpainting with automatic crop and stitch functionality
  - **Smart Guidance**: Automatic guidance value of 30 for inpainting, outpainting, canny, and depth operations
  - **TeaCache Integration**: Optional speed boost for all outputs (trades some quality for performance)
  - **Improved Preprocessor Preview Logic**: CN Input is used for previewing when ControlNet strength > 0, otherwise uses Img Load
  - **Workflow Reorganization**: Modules reordered for more logical flow
  - **Redux Naming**: IP Adapter renamed to Redux for consistency with BFL terminology

<details>
<summary><b>📋 Older Changelog</b> (Click to expand)</summary>

- **1.6.4:** ControlNet Union Pro v2 Update 📺 [Watch Video Update](https://www.youtube.com/watch?v=oh1P_4d9_HI)
  - ControlNet Union Pro v2: Integrated the new Depth, Canny, OpenPose ControlNets
  - New canny preprocessor control
  - Removed the input preview tab
  - Better upscaling controls
  - New Redux (IPAdapter) implementation

- **Flux Continuum Light 1.0.0:**
  - Light version of the workflow with all the basic functions that requires only the FLUX.1-dev model. [Download](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%20Light%201.0.0_release.json) 

- **1.4.2:** Black Forest Labs tools update
  - Black Forest Labs tools: Integrated the new Redux, Depth, Canny, Fill models
  - Preview Panel: Preview all your image inputs and masks at a glance
  - Mask Feather Control: Feather the mask using one control
  - Text Versions: Add more tabs via properties
  - New Nodes: *FluxContinuumModelRouter*, *OutputGet*, *OutputGetString*, *OutputTextDisplay*, *DrawTextConfig* and *ConfigurableDrawText*

</details>

## Overview

ComfyUI Flux Continuum revolutionises workflow management through a thoughtful dual-interface design:

- **Front-end**: A consistent control interface shared across all modules
- **Back-end**: Powerful, modular architecture for customisation and experimentation

## ✨ Core Features

> Perfect for creators who want a consistent, streamlined experience across all image generation tasks, while maintaining the power to customize when needed.

- **Unified Control Interface**
  - Single set of controls affects all relevant modules
  - Smart guidance adjustment based on operation type
  - Consistent experience across all generation tasks

- **Smart Workflow Management**
  - Only activates nodes and models required for current task
  - Toggle between different output types seamlessly
  - Efficiently handles resource allocation
  - Optional TeaCache for speed optimization

- **Universal Model Integration**
  - LoRAs, ControlNets and Redux work across all output modules
  - Seamless Black Forest Labs model support
  - Configurable model routing for custom workflows

- **Enhanced Usability**
  - Interactive hint system for contextual help
  - Quick image transfer with keyboard shortcut
  - Intelligent preprocessing based on control values
  - Crop & stitch for seamless inpainting/outpainting

---

## 🚀 Quick Start  
📺 **New to Flux Continuum?** [Watch the tutorial first](https://www.youtube.com/watch?v=cjWuPcRZ1j0)  
1. Clone repo to the custom nodes folder
```shell
git clone https://github.com/robertvoy/ComfyUI-Flux-Continuum
```
2. [Download](https://github.com/robertvoy/ComfyUI-Flux-Continuum/blob/main/workflow/Flux%2B%201.7.0_release.json) and import the workflow into ComfyUI
3. Install missing custom nodes using the ComfyUI Manager
4. Configure your models in the config panel (press `2` to access)
5. Download any missing models (see Model Downloads section below)
6. Return to the main interface (press `1`)
7. Select `txt2img` from the output selector (top left corner)
8. Run the workflow to generate your first image

---

## 🎯 Usage Guide

### Output Selection
The workflow is controlled by the **Output selector** in the top-left corner. Select your desired output and all relevant controls will automatically apply.

### Key Controls

**🎨 Main Generation**
- **Prompt**: Your text description for generation
- **Denoise**: Controls strength for img2img operations (0 = no change, 1 = completely new)
- **Steps**: Number of sampling steps (higher = more detail, slower)
- **Guidance**: How closely to follow the prompt (automatically set to 30 for inpainting/outpainting/canny/depth)
- **TeaCache**: Toggle for speed boost (some quality trade-off)

**🖼️ Input Images**
- **Img Load**: Primary image for all img2img operations (inpainting, outpainting, detailer, upscaling)
- **CN Input**: Source for ControlNet preprocessing
- **Redux 1-3**: Up to 3 reference images for style transfer (use very low strength values)
- **Tip**: Use `Ctrl+Shift+C` to quickly copy from Img Preview to Img Load

**🎛️ ControlNet & Redux**
- ControlNets activate when strength > 0
- When CN strength > 0, preprocessor uses CN Input; otherwise uses Img Load
- Preview preprocessor results by selecting corresponding output (e.g., "preprocessor canny")
- Redux sliders control each Redux input individually (1 = Redux 1, etc.)

**Recommended ControlNet Values:**
- **Canny**: Strength=0.7, End=0.8
- **Depth**: Strength=0.8, End=0.8
- **Pose**: Strength=0.9, End=0.65

**🔧 Image Processing**
- Resize, crop, sharpen, color correct, or pad images
- Preview results with "imgload prep" output
- Bypass nodes after processing to avoid reprocessing (`Ctrl+B`)

**⬆️ Upscaling**
- **Resolution Multiply**: Multiplies image resolution after any preprocessing
- **Upscale Model**: Choose your upscaling model (recommended: 4xNomos8kDAT)
- 📺 [Watch Upscaling Tutorial](https://www.youtube.com/watch?v=TmF3JK_1AAs)

---

## 🎯 Workflow Modules

### Main Modules 
> All modules use the same unified control interface

| Module | Description |
|--------|-------------|
| **txt2img** | Standard text-to-image generation from prompts |
| **txt2img noise injection** | Enhanced detail generation ([Learn more](https://youtu.be/tned5bYOC08?si=qfP2Sv2VOTzDK-uL&t=1335)) |
| **img2img** | Transform existing images with text prompts |
| **inpainting** | Edit specific areas with automatic crop & stitch using BFL Fill model |
| **outpainting** | Expand images beyond boundaries with smart padding and BFL Fill model |
| **canny** | Edge-guided generation using BFL Canny model |
| **depth** | Depth-guided generation using BFL Depth model |
| **detailer** | Focused refinement using mask selection |
| **ultimate upscaler** | Advanced tiled upscaling with full control |
| **upscaler** | Simple model-based upscaling |

### Utility Modules

| Module | Description |
|--------|-------------|
| **imgload prep** | Preview processed images after crop/sharpen/resize/padding |
| **preprocessor canny** | Preview canny edge detection results |
| **preprocessor depth** | Preview depth map generation |
| **preprocessor openpose** | Preview pose detection results |

---

## 🔧 Custom Nodes

> *These custom nodes were made specifically for this workflow and are required for it to work*

### Interface Enhancement Nodes

- **Hint Node**: 
  - Interactive help system throughout the workflow
  - Hover for contextual information
  - Right-click to edit hint content
  - Supports markdown formatting

- **Tabs**:
  - Space-saving node organization
  - Add tabs via properties panel
  - Compatible with most nodes
  - Special handling for unsupported nodes

- **Sliders**: 
  - Suite of pre-configured sliders
  - Optimized ranges and defaults for common operations
  - Includes: Denoise, Step, Guidance, Batch, GPU, ControlNet, Redux, and more

- **OutputGet System**:
  - Filters set nodes with prefix `Output -`
  - **OutputTextDisplay**: Visual display of selected output
  - **OutputGetString**: String output for conditional routing

- **Text Versions**:
  - Multi-tab text management (default 5 tabs)
  - Add more tabs via properties panel
  - Save different prompt versions
  - Perfect for A/B testing

- **ImageDisplay**: 
  - Base64 image display on canvas
  - Configurable via properties
  - Useful for reference images

### Workflow Control Nodes

- **Image Transfer Shortcut**: 
  - `Ctrl+Alt+C` copies from Img Preview to Img Load
  - Customizable in ComfyUI keybindings

- **Configurable Model Router**: 
  - Dynamic model selection with JSON mapping
  - Flexible routing based on conditions
  - Supports lazy loading for efficiency

- **Sampler Parameter Packer/Unpacker**: 
  - Consolidate sampler settings
  - Tabbed interface for version control

- **Image Batch Boolean**: 
  - Conditional batch processing
  - Smart second image loading

- **Configurable Draw Text**: 
  - Advanced text rendering on images
  - Configurable fonts, colors, shadows, alignment

- **Pass Nodes**: 
  - Extended pass-through for Latent, Pipe, SEGS, and Int data types
  - Maintains data flow integrity

---

## 📥 Model Downloads

### Required Models

**unet folder:**
- [flux1-dev.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors)
- [flux1-depth-dev.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-Depth-dev/resolve/main/flux1-depth-dev.safetensors)
- [flux1-canny-dev.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-Canny-dev/resolve/main/flux1-canny-dev.safetensors)
- [flux1-fill-dev.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-Fill-dev/resolve/main/flux1-fill-dev.safetensors)

> **Note**: If you don't use Canny or Depth models, you can bypass their load nodes and skip downloading them.

**vae folder:**
- [ae.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/ae.safetensors)

**clip folder:**
- [t5xxl_fp8_e4m3fn.safetensors](https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors)
- [clip_l.safetensors](https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors)

**style_models folder:**
- [flux1-redux-dev.safetensors](https://huggingface.co/black-forest-labs/FLUX.1-Redux-dev/resolve/main/flux1-redux-dev.safetensors)

**clip_vision folder:**
- [sigclip_vision_patch14_384.safetensors](https://huggingface.co/Comfy-Org/sigclip_vision_384/resolve/main/sigclip_vision_patch14_384.safetensors)

**controlnet/FLUX folder:**
- [FLUX.1-dev-ControlNet-Union-Pro-2.0.safetensors](https://huggingface.co/Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro-2.0/resolve/main/diffusion_pytorch_model.safetensors) *(rename file)*

---

## 🔜 Coming Soon

- **Multi-GPU Support**: Distributed processing across multiple GPUs

---

## 🙏 Acknowledgments

Special thanks to the creators of these essential custom node packs:
- [rgthree ComfyUI Extensions](https://github.com/rgthree/rgthree-comfy)
- [ComfyUI Essentials](https://github.com/cubiq/ComfyUI_essentials)
- [ComfyUI Impact Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack)
- [ComfyUI KJNodes](https://github.com/kijai/ComfyUI-KJNodes)