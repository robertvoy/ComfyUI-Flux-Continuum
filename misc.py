import nodes
from server import PromptServer
import torch
import comfy.samplers
import os
import time
from PIL import Image
import numpy as np

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

    def execute(self, value):
        # Return the integer value directly
        return (int(value), )

class GuidanceSlider:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("FLOAT", { "display": "slider", "default": 2.5, "min": -1.0, "max": 9.0, "step": 0.1 }),
            },
        }

    RETURN_TYPES = ("FLOAT", )
    FUNCTION = "execute"
    CATEGORY = "Flux-Continuum/Sliders"

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

    def execute(self, Strength, Start, End):
        # Return the three values as a VEC3
        return ((Strength, Start, End), )

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

    def execute(self, resolution):
        return (resolution,)

class SamplerParameterPacker:
    CATEGORY = 'Flux-Continuum/Utilities'
    RETURN_TYPES = ("SAMPLER_PARAMS",)
    RETURN_NAMES = ("sampler_params",)
    FUNCTION = "pack_parameters"
    
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

    def convert(self, BOOLEAN):
        # Convert boolean to appropriate string value
        return ("true" if BOOLEAN else "false",)


MISC_CLASS_MAPPINGS = {
    "DenoiseSlider": DenoiseSlider,
    "StepSlider": StepSlider,
    "GuidanceSlider": GuidanceSlider,
    "BatchSlider": BatchSlider,
    "MaxShiftSlider": MaxShiftSlider,
    "ControlNetSlider": ControlNetSlider,
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
    "BooleanToEnabled": BooleanToEnabled
}
