"""
crop_and_enhance_floorplans.py
Crops high-resolution CAD floorplans and full blueprint sheets from the S2A Modular PDF sheets.
"""

from PIL import Image
import os

OUTPUT_DIR = "/Users/ericmiller/NEW JUNE 26/haas-adu-configurator/public/images"
ARTIFACT_DIR = "/Users/ericmiller/.gemini/antigravity-ide/brain/7edf9bcc-1ac5-41c6-befd-671b39214d4c"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. HARMONY (doc1)
# Dimensions: 2592 x 1728
# Floorplan region: roughly x: 30% to 60%, y: 32% to 62%
img_harmony = Image.open("/tmp/blueprints_png/doc1.png")
w, h = img_harmony.size
fp_harmony = img_harmony.crop((int(0.32 * w), int(0.33 * h), int(0.60 * w), int(0.63 * h)))
fp_harmony.save(os.path.join(OUTPUT_DIR, "floorplan_harmony.png"))
fp_harmony.save(os.path.join(ARTIFACT_DIR, "floorplan_harmony.png"))
img_harmony.save(os.path.join(OUTPUT_DIR, "blueprint_harmony.png"))

# 2. SIERRA (doc2)
# Floorplan region: x: 30% to 60%, y: 20% to 48%
img_sierra = Image.open("/tmp/blueprints_png/doc2.png")
fp_sierra = img_sierra.crop((int(0.30 * w), int(0.20 * h), int(0.60 * w), int(0.48 * h)))
fp_sierra.save(os.path.join(OUTPUT_DIR, "floorplan_sierra.png"))
fp_sierra.save(os.path.join(ARTIFACT_DIR, "floorplan_sierra.png"))
img_sierra.save(os.path.join(OUTPUT_DIR, "blueprint_sierra.png"))

# 3. HAVEN (doc3)
# Floorplan region: x: 31% to 60%, y: 29% to 54%
img_haven = Image.open("/tmp/blueprints_png/doc3.png")
fp_haven = img_haven.crop((int(0.31 * w), int(0.29 * h), int(0.60 * w), int(0.54 * h)))
fp_haven.save(os.path.join(OUTPUT_DIR, "floorplan_haven.png"))
fp_haven.save(os.path.join(ARTIFACT_DIR, "floorplan_haven.png"))
img_haven.save(os.path.join(OUTPUT_DIR, "blueprint_haven.png"))

# 4. MEADOW (doc4)
# Floorplan region: x: 29% to 58%, y: 21% to 53%
img_meadow = Image.open("/tmp/blueprints_png/doc4.png")
fp_meadow = img_meadow.crop((int(0.29 * w), int(0.21 * h), int(0.58 * w), int(0.53 * h)))
fp_meadow.save(os.path.join(OUTPUT_DIR, "floorplan_meadow.png"))
fp_meadow.save(os.path.join(ARTIFACT_DIR, "floorplan_meadow.png"))
img_meadow.save(os.path.join(OUTPUT_DIR, "blueprint_meadow.png"))

# 5. CASCADE (doc5)
# Floorplan region: x: 14% to 40%, y: 20% to 50%
img_cascade = Image.open("/tmp/blueprints_png/doc5.png")
fp_cascade = img_cascade.crop((int(0.14 * w), int(0.20 * h), int(0.40 * w), int(0.50 * h)))
fp_cascade.save(os.path.join(OUTPUT_DIR, "floorplan_cascade.png"))
fp_cascade.save(os.path.join(ARTIFACT_DIR, "floorplan_cascade.png"))
img_cascade.save(os.path.join(OUTPUT_DIR, "blueprint_cascade.png"))

print("All floorplans and blueprint sheets cropped and saved successfully!")
