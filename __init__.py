from .misc import MISC_CLASS_MAPPINGS

# Merge both mappings into a single dictionary for the custom nodes
NODE_CLASS_MAPPINGS = {**MISC_CLASS_MAPPINGS}
WEB_DIRECTORY = "./web"

# Optional: You can also define NODE_DISPLAY_NAME_MAPPINGS if you want custom display names in the UI
NODE_DISPLAY_NAME_MAPPINGS = {
    "StepSlider": "Step Slider",
    "DenoiseSlider": "Denoise Slider",
    "GuidanceSlider": "Guidance Slider",
    "GPUSlider": "GPU Slider",
    "BatchSlider": "Batch Slider",
    "IPAdapterSlider": "IPAdapter Slider",
    "MaxShiftSlider": "Max Shift Slider",
    "ControlNetSlider": "ControlNet Slider",
    "CannySlider": "CannySlider",
    "SelectFromBatch": "Select From Batch",
    "LatentPass": "LatentPass",
    "SEGSPass": "SEGSPass",
    "PipePass": "PipePass",
    "IntPass": "IntPass",
    "TextVersions": "Text Versions",
    "ResolutionPicker": "Resolution Picker",
    "ResolutionMultiplySlider": "ResolutionMultiplySlider",
    "SamplerParameterPacker": "Sampler Parameter Packer",
    "SamplerParameterUnpacker": "Sampler Parameter Unpacker",
    "ImpactControlBridgeFix": "ImpactControlBridgeFix",
    "BooleanToEnabled": "Boolean To Enabled",
    "OutputGetString": "OutputGetString",
    "SplitVec2": "SplitVec2",
    "SplitVec3": "SplitVec3",
    "SimpleTextTruncate": "Simple Text Truncate",
    "FluxContinuumModelRouter": "Flux Continuum Model Router",
    "ConfigurableModelRouter": "Configurable Model Router",
    "ImageBatchBoolean": "Image Batch Boolean",
    "DrawTextConfig": "DrawTextConfig",
    "ConfigurableDrawText": "ConfigurableDrawText"
}

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']