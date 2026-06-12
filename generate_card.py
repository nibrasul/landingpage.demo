import trimesh
import numpy as np

# Create a thin box representing a card (85.6mm x 54mm x 0.8mm)
# Scale it up slightly so it looks good in Three.js (e.g. 3.37 x 2.12 x 0.03)
card = trimesh.creation.box(extents=[3.37, 2.12, 0.03])

# Give it a nice material color
card.visual.face_colors = [50, 50, 200, 255] # Blueish

# Export to GLB
card.export('/Users/mohammednibrasulhaqq/Documents/Web/Tapfolio.me/public/card.glb')
print("GLB card created at public/card.glb")
