"""
change_detection/forest_change.py
Part C — Forest / Habitat Change Detection using OpenCV.

SIMULATED DEMO: Uses PIL-generated synthetic aerial forest images.
NOT connected to a live satellite feed.
"""

import numpy as np


def get_sample_images():
    """
    Generate two synthetic aerial-view grayscale images representing
    a 'before' (dense forest) and 'after' (partial clearance) scene.
    Returns (before_array, after_array) as uint8 RGB numpy arrays.
    """
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        # Fallback: pure numpy arrays
        before = np.random.randint(30, 90, (256, 256, 3), dtype=np.uint8)
        after = before.copy()
        after[80:180, 80:180] = [200, 170, 120]  # simulate clearance patch
        return before, after

    size = 256
    before = Image.new("RGB", (size, size), (35, 100, 45))
    draw_b = ImageDraw.Draw(before)
    # Add tree-like patches
    for x in range(0, size, 20):
        for y in range(0, size, 20):
            r = np.random.randint(14, 22)
            g = np.random.randint(90, 130)
            b_val = np.random.randint(30, 55)
            draw_b.ellipse([x, y, x + 18, y + 18], fill=(r, g, b_val))
    before_arr = np.array(before, dtype=np.uint8)

    after = Image.fromarray(before_arr.copy())
    draw_a = ImageDraw.Draw(after)
    # Simulate a clearance patch in the upper-right quadrant
    draw_a.rectangle([128, 20, 250, 140], fill=(190, 155, 100))
    # Add a smaller burn patch
    draw_a.ellipse([50, 50, 100, 95], fill=(120, 80, 40))
    after_arr = np.array(after, dtype=np.uint8)

    return before_arr, after_arr


def run_change_detection(before_arr: np.ndarray, after_arr: np.ndarray) -> dict:
    """
    Computes pixel-level change between two images using OpenCV absolute differencing.
    Returns change statistics and base64-encoded difference image.
    
    SIMULATED MODULE — for portfolio demonstration purposes.
    """
    import base64
    import io

    try:
        import cv2
        HAS_CV2 = True
    except ImportError:
        HAS_CV2 = False

    try:
        from PIL import Image
        HAS_PIL = True
    except ImportError:
        HAS_PIL = False

    # Ensure same size
    h, w = before_arr.shape[:2]
    if after_arr.shape[:2] != (h, w):
        if HAS_CV2:
            after_arr = cv2.resize(after_arr, (w, h))
        else:
            # basic center crop / resize
            after_arr = after_arr[:h, :w]

    if HAS_CV2:
        # Grayscale absolute difference
        gray_before = cv2.cvtColor(before_arr, cv2.COLOR_RGB2GRAY)
        gray_after = cv2.cvtColor(after_arr, cv2.COLOR_RGB2GRAY)
        diff = cv2.absdiff(gray_before, gray_after)
        _, thresh = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)

        changed_pixels = int(np.sum(thresh > 0))
        total_pixels = h * w
        change_pct = round(changed_pixels / total_pixels * 100, 2)

        # Colorize diff for visualization
        diff_colored = cv2.applyColorMap(diff, cv2.COLORMAP_JET)
        diff_rgb = cv2.cvtColor(diff_colored, cv2.COLOR_BGR2RGB)
    else:
        # Fallback without OpenCV: simple numpy diff
        gray_before = np.mean(before_arr, axis=2).astype(np.uint8)
        gray_after = np.mean(after_arr, axis=2).astype(np.uint8)
        diff = np.abs(gray_before.astype(int) - gray_after.astype(int)).astype(np.uint8)
        thresh = (diff > 30).astype(np.uint8) * 255
        changed_pixels = int(np.sum(thresh > 0))
        total_pixels = h * w
        change_pct = round(changed_pixels / total_pixels * 100, 2)
        # Simple heat colormap
        diff_rgb = np.stack([diff, np.zeros_like(diff), np.zeros_like(diff)], axis=2).astype(np.uint8)

    # Encode to base64 PNG for frontend display
    diff_b64 = ""
    if HAS_PIL:
        pil_diff = Image.fromarray(diff_rgb)
        buf = io.BytesIO()
        pil_diff.save(buf, format="PNG")
        diff_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    before_b64 = ""
    after_b64 = ""
    if HAS_PIL:
        for arr, store in [(before_arr, "before"), (after_arr, "after")]:
            pil_img = Image.fromarray(arr.astype(np.uint8))
            buf = io.BytesIO()
            pil_img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            if store == "before":
                before_b64 = b64
            else:
                after_b64 = b64

    severity = "High" if change_pct > 20 else ("Medium" if change_pct > 8 else "Low")

    return {
        "simulated": True,
        "note": "OpenCV pixel-difference demo — not a live satellite feed.",
        "engine": "OpenCV absdiff + threshold" if HAS_CV2 else "NumPy fallback diff",
        "changed_pixels": changed_pixels,
        "total_pixels": total_pixels,
        "change_percentage": change_pct,
        "change_severity": severity,
        "interpretation": (
            f"{change_pct}% pixel change detected. "
            f"Severity: {severity}. "
            "Possible deforestation or seasonal vegetation shift."
            if change_pct > 5 else
            f"Only {change_pct}% change — minimal habitat disturbance detected."
        ),
        "diff_image_b64": diff_b64,
        "before_image_b64": before_b64,
        "after_image_b64": after_b64
    }
