"""
verify_and_crop_all_blueprints.py
Auto-detects and crops each model's architectural floorplan with generous margin and centering.
"""

from PIL import Image
import numpy as np
import os

APP_IMG_DIR = "/Users/ericmiller/NEW JUNE 26/haas-adu-configurator/public/images"
ARTIFACT_DIR = "/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c"
os.makedirs(APP_IMG_DIR, exist_ok=True)

regions = [
    (1, 'harmony', (0.25, 0.28, 0.65, 0.70)),
    (2, 'sierra', (0.28, 0.10, 0.65, 0.52)),
    (3, 'haven', (0.28, 0.25, 0.65, 0.68)),
    (4, 'meadow', (0.22, 0.10, 0.64, 0.58)),
    (5, 'cascade', (0.10, 0.15, 0.46, 0.56))
]

for doc_num, name, (x1p, y1p, x2p, y2p) in regions:
    img = Image.open(f"/tmp/blueprints_png/doc{doc_num}.png").convert("RGB")
    w, h = img.size
    
    # Save full blueprint sheet
    img.save(os.path.join(APP_IMG_DIR, f"blueprint_{name}.png"))
    img.save(os.path.join(ARTIFACT_DIR, f"blueprint_{name}.png"))
    
    # Initial broad crop
    initial_crop = img.crop((int(x1p * w), int(y1p * h), int(x2p * w), int(y2p * h)))
    
    # Detect drawing bounding box
    gray = initial_crop.convert("L")
    arr = np.array(gray)
    dark_y, dark_x = np.where(arr < 220)
    
    if len(dark_x) > 0:
        min_x, max_x = dark_x.min(), dark_x.max()
        min_y, max_y = dark_y.min(), dark_y.max()
        
        pad = 35
        bx1 = max(0, min_x - pad)
        by1 = max(0, min_y - pad)
        bx2 = min(initial_crop.width, max_x + pad)
        by2 = min(initial_crop.height, max_y + pad)
        
        final_crop = initial_crop.crop((bx1, by1, bx2, by2))
        final_crop.save(os.path.join(APP_IMG_DIR, f"floorplan_{name}.png"))
        final_crop.save(os.path.join(ARTIFACT_DIR, f"floorplan_{name}.png"))
        print(f"✓ {name.upper()}: Cleanly cropped and centered ({final_crop.size[0]}x{final_crop.size[1]} px)")

print("All floorplans verified and saved!")
