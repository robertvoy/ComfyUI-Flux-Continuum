import nodes
from server import PromptServer
import torch
import comfy.samplers
import os
import time
from PIL import Image, ImageDraw, ImageFont, ImageColor, ImageFilter
import torchvision.transforms.v2 as T
import numpy as np
import folder_paths
import numpy as np
import json
from typing import Any, Mapping, Tuple

class DenoiseSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 0.5, "min": 0.0, "max": 1.0, "step": 0.001 }),
            },
        }

    RETURN_TYPES = ("FLOAT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for controlling denoising strength with range 0.0-1.0"

    def execute(self, value):
        return (value, )

class StepSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 25.0, "min": 0.0, "max": 50.0, "step": 1.0 }),
            },
        }

    RETURN_TYPES = ("INT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for adjusting sampling steps with range 0-50"

    def execute(self, value):
        # Return the integer value directly
        return (int(value), )

class BatchSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 1.0, "min": 1.0, "max": 10.0, "step": 1.0 }),
            },
        }

    RETURN_TYPES = ("INT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for controlling batch size with range 1-10"

    def execute(self, value):
        # Return the integer value directly
        return (int(value), )

class GPUSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 1.0, "min": 1.0, "max": 4.0, "step": 1.0 }),
            },
        }

    RETURN_TYPES = ("INT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for selecting number of GPUs with range 1-4"

    def execute(self, value):
        # Return the integer value directly
        return (int(value), )

class SelectFromBatch:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 0.0, "min": 0.0, "max": 24.0, "step": 1.0 }),
            },
        }

    RETURN_TYPES = ("INT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for selecting specific images from a batch with range 0-24"

    def execute(self, value):
        # Return the integer value directly
        return (int(value), )

class GuidanceSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 2.5, "min": -1.0, "max": 30.0, "step": 0.1 }),
            },
        }

    RETURN_TYPES = ("FLOAT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for controlling classifier-free guidance scale with range -1.0 to 30.0"

    def execute(self, value):
        # Return the float value directly
        return (value, )

class MaxShiftSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 1.15, "min": 0.0, "max": 4.0, "step": 0.05 }),
            },
        }

    RETURN_TYPES = ("FLOAT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides a slider for controlling maximum pixel shift with range 0.0-4.0"

    def execute(self, value):
        # Return the float value directly
        return (value, )

class ControlNetSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "Strength": ("FLOAT", { "display": "slider", "default": 1, "min": 0.0, "max": 1.0, "step": 0.05 }),
                "Start": ("FLOAT", { "display": "slider", "default": 0, "min": 0.0, "max": 1.0, "step": 0.05 }),
                "End": ("FLOAT", { "display": "slider", "default": 1, "min": 0.0, "max": 1.0, "step": 0.05 }),
            },
        }

    RETURN_TYPES = ("VEC3", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides three sliders for ControlNet parameters: Strength, Start, and End percentages"

    def execute(self, Strength, Start, End):
        # Return the three values as a VEC3
        return ((Strength, Start, End), )

class IPAdapterSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "IP1": ("FLOAT", { "display": "slider", "default": 0, "min": 0.0, "max": 1.0, "step": 0.05 }),
                "IP2": ("FLOAT", { "display": "slider", "default": 0, "min": 0.0, "max": 1.0, "step": 0.05 }),
                "IP3": ("FLOAT", { "display": "slider", "default": 0, "min": 0.0, "max": 1.0, "step": 0.05 }),
            },
        }
    
    RETURN_TYPES = ("VEC3",)
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"
    DESCRIPTION = "Provides three sliders for controlling multiple IP-Adapter strengths"

    def execute(self, IP1, IP2, IP3):
        # Return the three values as a VEC3
        return ((IP1, IP2, IP3),)

class SEGSPass:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "SEGS": ("SEGS",),
            },
        }

    RETURN_TYPES = ("SEGS", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Utilities"

    def execute(self, SEGS):
        # Return the integer value directly
        return (SEGS, )

class PipePass:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "PIPE_LINE": ("PIPE_LINE",),
            },
        }

    RETURN_TYPES = ("PIPE_LINE", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Utilities"

    def execute(self, PIPE_LINE):
        return (PIPE_LINE, )

class LatentPass:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "latent": ("LATENT",),
            },
        }
    RETURN_TYPES = ("LATENT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Utilities"
    
    def execute(self, latent):
        # Simply pass through the latent data
        return (latent, )
        
class ResolutionPicker:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "resolution": (["704x1408 (0.5)","704x1344 (0.52)","768x1344 (0.57)","768x1280 (0.6)","832x1216 (0.68)","832x1152 (0.72)","896x1152 (0.78)","896x1088 (0.82)","960x1088 (0.88)","960x1024 (0.94)","1024x1024 (1.0)","1024x960 (1.07)","1088x960 (1.13)","1088x896 (1.21)","1152x896 (1.29)","1152x832 (1.38)","1216x832 (1.46)","1280x768 (1.67)","1344x768 (1.75)","1344x704 (1.91)","1408x704 (2.0)","1472x704 (2.09)","1536x640 (2.4)","1600x640 (2.5)","1664x576 (2.89)","1728x576 (3.0)",], {"default": "1024x1024 (1.0)"}),
            }}
    RETURN_TYPES = (["704x1408 (0.5)","704x1344 (0.52)","768x1344 (0.57)","768x1280 (0.6)","832x1216 (0.68)","832x1152 (0.72)","896x1152 (0.78)","896x1088 (0.82)","960x1088 (0.88)","960x1024 (0.94)","1024x1024 (1.0)","1024x960 (1.07)","1088x960 (1.13)","1088x896 (1.21)","1152x896 (1.29)","1152x832 (1.38)","1216x832 (1.46)","1280x768 (1.67)","1344x768 (1.75)","1344x704 (1.91)","1408x704 (2.0)","1472x704 (2.09)","1536x640 (2.4)","1600x640 (2.5)","1664x576 (2.89)","1728x576 (3.0)",],)
    RETURN_NAMES = ("resolution",)
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Utilities"
    DESCRIPTION = "Provides a dropdown menu for selecting from preset image resolutions with aspect ratios"

    def execute(self, resolution):
        return (resolution,)

class SamplerParameterPacker:
    CATEGORY = 'Flux-Continuum/Utilities'
    RETURN_TYPES = ("SAMPLER_PARAMS",)
    RETURN_NAMES = ("sampler_params",)
    FUNCTION = "pack_parameters"
    DESCRIPTION = "Packs sampler and scheduler selections into a single parameter object for efficient passing"
    
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
            "sampler": (comfy.samplers.KSampler.SAMPLERS,),
            "scheduler": (comfy.samplers.KSampler.SCHEDULERS,),
        }}
    
    def pack_parameters(self, sampler, scheduler):
        return ((sampler, str(sampler), scheduler, str(scheduler)),)

class SamplerParameterUnpacker:
    CATEGORY = 'Flux-Continuum/Utilities'
    RETURN_TYPES = (comfy.samplers.KSampler.SAMPLERS, "STRING", comfy.samplers.KSampler.SCHEDULERS, "STRING",)
    RETURN_NAMES = ("sampler", "sampler_name", "scheduler", "scheduler_name",)
    FUNCTION = "unpack_parameters"
    DESCRIPTION = "Unpacks previously packed sampler parameters back into individual components"
    
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
            "sampler_params": ("SAMPLER_PARAMS",),
        }}
    
    def unpack_parameters(self, sampler_params):
        sampler, sampler_name, scheduler, scheduler_name = sampler_params
        return (sampler, sampler_name, scheduler, scheduler_name,)

class TextVersions:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
                    "text": ("STRING", {"default": "", "multiline": True, "dynamicPrompts": True}),
                },
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_text"
    CATEGORY = "Flux-Continuum/Utilities"
    DESCRIPTION = "Provides a multi-tab interface for managing different versions of text input"

    def __init__(self):
        self.order = 0

    def process_text(self, text):
        return (text,)

def workflow_to_map(workflow):
    nodes_map = {}
    links = {}

    # Create a lookup table for links and nodes
    for links_data in workflow['links']:
        links[links_data[0]] = links_data[1:]

    for node_data in workflow['nodes']:
        nodes_map[str(node_data['id'])] = node_data

    return nodes_map, links

def is_execution_model_version_supported():
    try:
        import comfy_execution
        return True
    except:
        return False

class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

any_typ = AnyType("*")

class ImpactControlBridgeFix:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {
                      "value": (any_typ,),
                      "mode": ("BOOLEAN", {"default": True, "label_on": "Active", "label_off": "Stop/Mute/Bypass"}),
                      "behavior": (["Stop", "Mute", "Bypass"], ),
                    },
                "hidden": {"unique_id": "UNIQUE_ID", "prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"}
                }

    FUNCTION = "doit"
    CATEGORY = "Flux-Continuum/Utilities"
    RETURN_TYPES = (any_typ,)
    RETURN_NAMES = ("value",)
    OUTPUT_NODE = True

    DESCRIPTION = ("When behavior is Stop and mode is active, the input value is passed directly to the output.\n"
                   "When behavior is Mute/Bypass and mode is active, the node connected to the output is changed to active state.\n"
                   "When behavior is Stop and mode is Stop/Mute/Bypass, the workflow execution of the current node is halted.\n"
                   "When behavior is Mute/Bypass and mode is Stop/Mute/Bypass, the node connected to the output is changed to Mute/Bypass state.")

    @classmethod
    def IS_CHANGED(self, value, mode, behavior="Stop", unique_id=None, prompt=None, extra_pnginfo=None):
        if behavior == "Stop":
            return value, mode, behavior
        
        try:
            if prompt and 'extra_data' in prompt and 'extra_pnginfo' in prompt['extra_data']:
                workflow = prompt['extra_data']['extra_pnginfo'].get('workflow')
                if workflow:
                    nodes_map, links = workflow_to_map(workflow)
                    next_nodes = []
                    for link in nodes_map[unique_id]['outputs'][0]['links']:
                        node_id = str(links[link][2])
                        if node_id in nodes_map:
                            next_nodes.append(node_id)
                    return next_nodes
        except:
            pass
            
        return 0

    def doit(self, value, mode, behavior="Stop", unique_id=None, prompt=None, extra_pnginfo=None):
        # Check for execution model support
        if is_execution_model_version_supported():
            from comfy_execution.graph import ExecutionBlocker
        else:
            print("[Impact Pack] ImpactControlBridge: ComfyUI is outdated. The 'Stop' behavior cannot function properly.")

        # Handle Stop behavior
        if behavior == "Stop":
            if mode:
                return (value, )
            else:
                return (ExecutionBlocker(None), )

        # Handle other behaviors
        try:
            # Validate extra_pnginfo
            if not extra_pnginfo or not isinstance(extra_pnginfo, dict) or 'workflow' not in extra_pnginfo:
                return (value, )

            workflow_nodes, links = workflow_to_map(extra_pnginfo['workflow'])
            
            # Initialize node lists
            active_nodes = []
            mute_nodes = []
            bypass_nodes = []

            node_outputs = workflow_nodes.get(unique_id, {}).get('outputs', [])
            if not node_outputs:
                return (value, )

            output_links = node_outputs[0].get('links', [])
            
            for link in output_links:
                try:
                    node_id = str(links[link][2])
                    next_nodes = []
                    if node_id in workflow_nodes:
                        next_nodes.append(node_id)

                    for next_node_id in next_nodes:
                        node_mode = workflow_nodes[next_node_id].get('mode', 0)
                        
                        if node_mode == 0:
                            active_nodes.append(next_node_id)
                        elif node_mode == 2:
                            mute_nodes.append(next_node_id)
                        elif node_mode == 4:
                            bypass_nodes.append(next_node_id)
                except:
                    continue

            # Handle mode-specific behavior
            if mode:
                # active
                should_be_active_nodes = mute_nodes + bypass_nodes
                if should_be_active_nodes:
                    PromptServer.instance.send_sync("impact-bridge-continue", 
                                                  {"node_id": unique_id, 
                                                   'actives': list(should_be_active_nodes)})
                    nodes.interrupt_processing()

            elif behavior == "Mute" or behavior == True:
                # mute
                should_be_mute_nodes = active_nodes + bypass_nodes
                if should_be_mute_nodes:
                    PromptServer.instance.send_sync("impact-bridge-continue", 
                                                  {"node_id": unique_id, 
                                                   'mutes': list(should_be_mute_nodes)})
                    nodes.interrupt_processing()

            else:
                # bypass
                should_be_bypass_nodes = active_nodes + mute_nodes
                if should_be_bypass_nodes:
                    PromptServer.instance.send_sync("impact-bridge-continue", 
                                                  {"node_id": unique_id, 
                                                   'bypasses': list(should_be_bypass_nodes)})
                    nodes.interrupt_processing()

        except Exception as e:
            print(f"[Impact Pack] Error in ImpactControlBridge: {str(e)}")
            
        return (value, )

class BooleanToEnabled:
    """Convert boolean value to enabled string format"""
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "BOOLEAN": ("BOOLEAN",),
            },
        }

    RETURN_TYPES = (["true", "false", "remote"],)  # Match the exact format from RemoteQueueWorker
    RETURN_NAMES = ("enabled",)
    FUNCTION = "convert"
    CATEGORY = "Flux-Continuum/Utilities"
    TITLE = "Boolean to Enabled"
    DESCRIPTION = "Converts boolean values to 'true'/'false'/'remote' strings for ComfyUI_NetDist"

    def convert(self, BOOLEAN):
        # Convert boolean to appropriate string value
        return ("true" if BOOLEAN else "false",)

class OutputGetString:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {  
              
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "prompt": "PROMPT",
                 "title": ("STRING", {"default": ""})
            }
        }
    
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("STRING",)
    FUNCTION = "process"
    CATEGORY = "Flux-Continuum/Utilities"
    OUTPUT_NODE = True
    
    def process(self, title, unique_id, prompt):
        title = title[len("Output - "):]
        return (title,)

# Type definition for Vec3
Vec3 = Tuple[float, float, float]

# Zero vector constant
VEC3_ZERO = (0.0, 0.0, 0.0)

class SplitVec3:
    @classmethod
    def INPUT_TYPES(cls) -> Mapping[str, Any]:
        return {"required": {"a": ("VEC3", {"default": VEC3_ZERO})}}

    RETURN_TYPES = ("FLOAT", "FLOAT", "FLOAT")
    FUNCTION = "op"
    CATEGORY = "Flux-Continuum/Utilities"
    DESCRIPTION = "Splits a vector3 input into its three individual float components"

    def op(self, a: Vec3) -> tuple[float, float, float]:
        return (a[0], a[1], a[2])

class SimpleTextTruncate:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "text": ("STRING", {"forceInput": True}),
                "word_count": ("INT", {"default": 10, "min": 0, "max": 99999999, "step": 1}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("TEXT",)
    FUNCTION = "truncate_words"
    CATEGORY = "Text Operations"
    DESCRIPTION = "Truncates input text to a specified number of words"

    def truncate_words(self, text, word_count):
        if text is None:
            return ("",)  # Return as a tuple
            
        words = str(text).split()
        result = ' '.join(words[:word_count])
        
        # Return as a tuple since RETURN_TYPES is defined as a tuple
        return (result,)

class FluxContinuumModelRouter:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "condition": ("STRING", {"default": ""})
            },
            "optional": {
                "flux_fill": ("MODEL", {"lazy": True}),  # Lazy load for inpainting/outpainting
                "flux_depth": ("MODEL", {"lazy": True}), # Lazy load for depth
                "flux_canny": ("MODEL", {"lazy": True}), # Lazy load for canny
                "flux_dev": ("MODEL", {"lazy": True}),   # Lazy load for default case
            }
        }
    
    RETURN_TYPES = ("MODEL",)
    FUNCTION = "route_model"
    CATEGORY = "Flux-Continuum/Utilities"
    DESCRIPTION = "For Flux Continuum workflow only. Routes model selection based on conditional input for different tasks (fill, depth, canny, dev)"

    def check_lazy_status(self, condition, flux_fill=None, flux_depth=None, flux_canny=None, flux_dev=None):
        condition = condition.lower().strip()
        needed = []
        
        # Only request the model we actually need based on the condition
        if condition in ["inpainting", "outpainting"]:
            if flux_fill is None:
                needed.append("flux_fill")
        elif condition == "depth":
            if flux_depth is None:
                needed.append("flux_depth")
        elif condition == "canny":
            if flux_canny is None:
                needed.append("flux_canny")
        else:
            if flux_dev is None:
                needed.append("flux_dev")
                
        return needed

    def route_model(self, condition, flux_fill=None, flux_depth=None, flux_canny=None, flux_dev=None):
        condition = condition.lower().strip()
        
        if condition in ["inpainting", "outpainting"]:
            print(f"ModelRouter: Condition '{condition}' matched - Selected flux_fill model")
            return (flux_fill,)
        elif condition == "depth":
            print(f"ModelRouter: Condition '{condition}' matched - Selected flux_depth model")
            return (flux_depth,)
        elif condition == "canny":
            print(f"ModelRouter: Condition '{condition}' matched - Selected flux_canny model")
            return (flux_canny,)
        else:
            print(f"ModelRouter: Condition '{condition}' didn't match any specific case - Selected flux_dev model")
            return (flux_dev,)

class ImageBatchBoolean:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "image1": ("IMAGE",),
                "image2": ("IMAGE", {"lazy": True}),  # Make image2 lazy
                "batch_enabled": ("BOOLEAN", {"default": True}),
            }
        }
    
    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "batch"
    CATEGORY = "Flux-Continuum/Utilities"
    
    def check_lazy_status(self, image1, image2, batch_enabled):
        needed = []
        # Only need image2 if batching is enabled
        if image2 is None and batch_enabled:
            needed.append("image2")
        return needed
    
    def batch(self, image1, image2, batch_enabled):
        # If batching is disabled, just return the first image
        if not batch_enabled:
            return (image1,)
            
        # If batching is enabled, perform the normal batch operation
        if image1.shape[1:] != image2.shape[1:]:
            image2 = comfy.utils.common_upscale(
                image2.movedim(-1,1), 
                image1.shape[2], 
                image1.shape[1], 
                "bilinear", 
                "center"
            ).movedim(1,-1)
        
        s = torch.cat((image1, image2), dim=0)
        return (s,)

# based on ComfyUI Essentials: github.com/cubiq/ComfyUI_essentials

MAX_RESOLUTION = 2048
FONTS_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), "fonts")

def hex_to_rgba(hex_color):
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        return (r, g, b, 255)
    elif len(hex_color) == 8:
        r, g, b, a = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4, 6))
        return (r, g, b, a)
    else:
        raise ValueError("Invalid hex color format")

class DrawTextConfig:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "font": (sorted([f for f in os.listdir(FONTS_DIR) if f.endswith('.ttf') or f.endswith('.otf')]), ),
            "size": ("INT", { "default": 56, "min": 1, "max": 9999, "step": 1 }),
            "color": ("STRING", { "multiline": False, "default": "#FFFFFF" }),
            "background_color": ("STRING", { "multiline": False, "default": "#00000000" }),
            "padding": ("INT", { "default": 20, "min": 0, "max": 500, "step": 1 }),
            "shadow_distance": ("INT", { "default": 0, "min": 0, "max": 100, "step": 1 }),
            "shadow_blur": ("INT", { "default": 0, "min": 0, "max": 100, "step": 1 }),
            "shadow_color": ("STRING", { "multiline": False, "default": "#000000" }),
            "horizontal_align": (["left", "center", "right"],),
            "vertical_align": (["top", "center", "bottom"],),
            "offset_x": ("INT", { "default": 0, "min": -MAX_RESOLUTION, "max": MAX_RESOLUTION, "step": 1 }),
            "offset_y": ("INT", { "default": 0, "min": -MAX_RESOLUTION, "max": MAX_RESOLUTION, "step": 1 }),
            "direction": (["ltr", "rtl"],),
        }}
    
    RETURN_TYPES = ("TEXT_STYLE",)
    FUNCTION = "configure"
    CATEGORY = "text"
    DESCRIPTION = "Configures text rendering parameters including font, size, color, alignment, and effects"

    def configure(self, font, size, color, background_color, padding, shadow_distance, shadow_blur, 
                 shadow_color, horizontal_align, vertical_align, offset_x, offset_y, direction):
        return ({
            "font": font,
            "size": size,
            "color": color,
            "background_color": background_color,
            "padding": padding,
            "shadow_distance": shadow_distance,
            "shadow_blur": shadow_blur,
            "shadow_color": shadow_color,
            "horizontal_align": horizontal_align,
            "vertical_align": vertical_align,
            "offset_x": offset_x,
            "offset_y": offset_y,
            "direction": direction
        },)

class ConfigurableDrawText:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "TEXT": ("STRING", {"multiline": True}),
            "TEXT_STYLE": ("TEXT_STYLE",),
            "IMAGE": ("IMAGE",),
        }}
    
    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "draw"
    CATEGORY = "text"
    DESCRIPTION = "Renders text onto images using previously configured text style parameters"

    def draw(self, TEXT, TEXT_STYLE, IMAGE):
        font = ImageFont.truetype(os.path.join(FONTS_DIR, TEXT_STYLE["font"]), TEXT_STYLE["size"])

        lines = TEXT.split("\n")
        if TEXT_STYLE["direction"] == "rtl":
            lines = [line[::-1] for line in lines]

        ascent, descent = font.getmetrics()
        line_spacing = ascent + descent
        text_width = max(font.getbbox(line)[2] - font.getbbox(line)[0] for line in lines)
        text_height = line_spacing * (len(lines) - 1) + ascent + descent

        IMAGE = T.ToPILImage()(IMAGE.permute([0,3,1,2])[0]).convert('RGBA')
        width = IMAGE.width
        height = IMAGE.height
        image = Image.new('RGBA', (width, height), (0,0,0,0))

        box_width = text_width + (TEXT_STYLE["padding"] * 2)
        box_height = text_height + (TEXT_STYLE["padding"] * 2)

        if TEXT_STYLE["horizontal_align"] == "left":
            box_x = TEXT_STYLE["offset_x"]
        elif TEXT_STYLE["horizontal_align"] == "center":
            box_x = (width - box_width) // 2 + TEXT_STYLE["offset_x"]
        else:  # right
            box_x = width - box_width + TEXT_STYLE["offset_x"]

        if TEXT_STYLE["vertical_align"] == "top":
            box_y = TEXT_STYLE["offset_y"]
        elif TEXT_STYLE["vertical_align"] == "center":
            box_y = (height - box_height) // 2 + TEXT_STYLE["offset_y"]
        else:  # bottom
            box_y = height - box_height + TEXT_STYLE["offset_y"]

        x = box_x + TEXT_STYLE["padding"]
        y = box_y + TEXT_STYLE["padding"]
        
        draw = ImageDraw.Draw(image)
        draw.rectangle([box_x, box_y, box_x + box_width, box_y + box_height], 
                      fill=hex_to_rgba(TEXT_STYLE["background_color"]))

        image_shadow = None
        if TEXT_STYLE["shadow_distance"] > 0:
            image_shadow = image.copy()

        for i, line in enumerate(lines):
            current_y = y + (i * line_spacing)
            
            draw = ImageDraw.Draw(image)
            draw.text((x, current_y), line, font=font, fill=hex_to_rgba(TEXT_STYLE["color"]))

            if image_shadow is not None:
                draw = ImageDraw.Draw(image_shadow)
                draw.text((x + TEXT_STYLE["shadow_distance"], current_y + TEXT_STYLE["shadow_distance"]), 
                         line, font=font, fill=hex_to_rgba(TEXT_STYLE["shadow_color"]))

        if image_shadow is not None:
            image_shadow = image_shadow.filter(ImageFilter.GaussianBlur(TEXT_STYLE["shadow_blur"]))
            image = Image.alpha_composite(image_shadow, image)

        image = Image.alpha_composite(IMAGE, image)
        image = T.ToTensor()(image).unsqueeze(0).permute([0,2,3,1])

        return (image[:, :, :, :3],)

MISC_CLASS_MAPPINGS = {
    "DenoiseSlider": DenoiseSlider,
    "StepSlider": StepSlider,
    "GuidanceSlider": GuidanceSlider,
    "BatchSlider": BatchSlider,
    "MaxShiftSlider": MaxShiftSlider,
    "ControlNetSlider": ControlNetSlider,
    "IPAdapterSlider": IPAdapterSlider,
    "SelectFromBatch": SelectFromBatch,
    "GPUSlider": GPUSlider,
    "SEGSPass": SEGSPass,
    "PipePass": PipePass,
    "LatentPass": LatentPass,
    "ResolutionPicker": ResolutionPicker,
    "SamplerParameterPacker": SamplerParameterPacker,
    "SamplerParameterUnpacker": SamplerParameterUnpacker,
    "TextVersions": TextVersions,
    "ImpactControlBridgeFix": ImpactControlBridgeFix,
    "BooleanToEnabled": BooleanToEnabled,
    "OutputGetString": OutputGetString,
    "SplitVec3": SplitVec3,
    "SimpleTextTruncate": SimpleTextTruncate,
    "FluxContinuumModelRouter": FluxContinuumModelRouter,
    "ImageBatchBoolean": ImageBatchBoolean,
    "DrawTextConfig": DrawTextConfig,
    "ConfigurableDrawText": ConfigurableDrawText
}
