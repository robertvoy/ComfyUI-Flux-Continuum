import torch

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
                "value": ("FLOAT", { "display": "slider", "default": 1.0, "min": 0.0, "max": 10.0, "step": 1.0 }),
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

# Define MISC_CLASS_MAPPINGS to let ComfyUI know about the custom nodes
MISC_CLASS_MAPPINGS = {
    "DenoiseSlider": DenoiseSlider,
    "StepSlider": StepSlider,
    "GuidanceSlider": GuidanceSlider,
    "BatchSlider": BatchSlider,
    "MaxShiftSlider": MaxShiftSlider,
    "ControlNetSlider": ControlNetSlider
}
