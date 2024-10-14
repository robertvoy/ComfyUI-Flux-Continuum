import os
import torch
import hashlib
from PIL import Image, ImageOps, ImageSequence
import numpy as np
import random

from nodes import PreviewImage

class CustomImageGridToBatch:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "image": ("IMAGE",),
                "columns": ("INT", {"default": 3, "min": 1, "max": 10, "step": 1}),
                "rows": ("INT", {"default": 3, "min": 1, "max": 10, "step": 1}),
            }
        }

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "decompose"
    CATEGORY = "Flux-Continuum/Image"
    DESCRIPTION = "Converts a grid of images to a batch, allowing for non-square grids with customizable rows and columns."

    def decompose(self, image, columns, rows):
        B, H, W, C = image.shape

        # Calculate height and width for each grid cell
        cell_height = H // rows
        cell_width = W // columns

        # Reshape the image grid into individual images
        grid_images = image.view(B, rows, cell_height, columns, cell_width, C)
        grid_images = grid_images.permute(0, 1, 3, 2, 4, 5).contiguous()

        # Combine back into a batch of images
        batch_images = grid_images.view(-1, cell_height, cell_width, C)

        return (batch_images,)


# Define NODE_CLASS_MAPPINGS to let ComfyUI know about your custom node
NODE_CLASS_MAPPINGS = {
    "CustomImageGridToBatch": CustomImageGridToBatch
}
