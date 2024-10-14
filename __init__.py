from .misc import MISC_CLASS_MAPPINGS

# Merge both mappings into a single dictionary for the custom nodes
NODE_CLASS_MAPPINGS = {**MISC_CLASS_MAPPINGS}

# Optional: You can also define NODE_DISPLAY_NAME_MAPPINGS if you want custom display names in the UI
NODE_DISPLAY_NAME_MAPPINGS = {
    "StepSlider": "Step Slider",
    "DenoiseSlider": "Denoise Slider",
    "GuidanceSlider": "Guidance Slider",
    "BatchSlider": "Batch Slider",
    "MaxShiftSlider": "Max Shift Slider",
    "ControlNetSlider": "ControlNet Slider"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
