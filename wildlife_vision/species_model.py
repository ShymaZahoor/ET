"""
wildlife_vision/species_model.py
Part D — Wildlife Species Detection using CLIP zero-shot image classification.

SIMULATED DEMO MODULE:
- Uses CLIP (ViT-B/32) from the 'transformers' library for zero-shot classification.
- Classifies uploaded images or PIL-generated synthetic animal proxy images.
- Simulated camera-trap sightings are randomly generated — NOT a live camera feed.
"""

import numpy as np
import random
from datetime import datetime, timedelta, timezone

CANDIDATE_SPECIES = [
    "leopard", "tiger", "brown bear", "deer", "wild bird",
    "rodent", "reptile", "primate", "elephant", "wild boar"
]

SAMPLE_COLORS = {
    "leopard": [220, 180, 100],
    "bird": [100, 180, 220],
    "bear": [110, 80, 50],
    "deer": [180, 140, 90],
    "rodent": [160, 140, 130],
}


def get_sample_image_array(species_hint: str = "bird") -> np.ndarray:
    """
    Returns a 224x224 synthetic RGB image approximating the dominant color tone
    of the requested species. Used when no real image is uploaded.
    NOT a real photograph — purely synthetic for demo purposes.
    """
    color_key = species_hint.lower()
    matched = next((k for k in SAMPLE_COLORS if k in color_key), None)
    base_color = SAMPLE_COLORS.get(matched, [140, 180, 100])

    img = np.zeros((224, 224, 3), dtype=np.uint8)
    for c, val in enumerate(base_color):
        noise = np.random.randint(-25, 25, (224, 224))
        img[:, :, c] = np.clip(val + noise, 0, 255).astype(np.uint8)

    # Add a simple ellipse shape as "animal silhouette"
    cx, cy, rx, ry = 112, 112, 60, 45
    for y in range(224):
        for x in range(224):
            if ((x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2) < 1:
                img[y, x] = [max(0, c - 40) for c in base_color]
    return img


def classify_image(pil_image) -> dict:
    """
    Runs CLIP zero-shot classification on a PIL image.
    Falls back to a random confidence simulation if CLIP is not available.

    DEMO: Works best on photographic wildlife images. Accuracy on
    synthetic/generated images will be low by design.
    """
    try:
        from transformers import CLIPProcessor, CLIPModel
        import torch
        from PIL import Image

        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

        texts = [f"a photo of a {s} in a wildlife habitat" for s in CANDIDATE_SPECIES]
        inputs = processor(text=texts, images=pil_image, return_tensors="pt", padding=True)
        with torch.no_grad():
            outputs = model(**inputs)
        logits = outputs.logits_per_image[0]
        probs = logits.softmax(dim=-1).tolist()

        results = sorted(
            [{"species": s, "probability": round(p * 100, 2)} for s, p in zip(CANDIDATE_SPECIES, probs)],
            key=lambda x: x["probability"], reverse=True
        )
        top = results[0]
        return {
            "simulated": False,
            "model": "openai/clip-vit-base-patch32",
            "top_prediction": top["species"],
            "top_confidence": top["probability"],
            "all_probabilities": results[:6],
            "status": "CLIP inference successful"
        }
    except Exception as clip_err:
        # Graceful fallback: simulate plausible probabilities
        probs_raw = [random.uniform(0.5, 10) for _ in CANDIDATE_SPECIES]
        total = sum(probs_raw)
        probs_norm = [round(p / total * 100, 2) for p in probs_raw]
        results = sorted(
            [{"species": s, "probability": p} for s, p in zip(CANDIDATE_SPECIES, probs_norm)],
            key=lambda x: x["probability"], reverse=True
        )
        top = results[0]
        return {
            "simulated": True,
            "model": "simulated-fallback (CLIP unavailable)",
            "clip_error": str(clip_err),
            "top_prediction": top["species"],
            "top_confidence": top["probability"],
            "all_probabilities": results[:6],
            "status": "Using simulated confidence (CLIP model not loaded)"
        }


def get_simulated_sightings(n: int = 10) -> list:
    """
    Generates n simulated camera-trap detection events for the GIS map and Wildlife Vision page.
    SIMULATED DATA — not real camera detections.
    """
    node_locations = [
        {"node": "CAM-TRAP-01", "lat": 26.0200, "lng": 76.5000, "zone": "Core Forest Zone A"},
        {"node": "CAM-TRAP-02", "lat": 26.0300, "lng": 76.5200, "zone": "Waterhole East Buffer"},
        {"node": "CAM-TRAP-03", "lat": 26.0050, "lng": 76.4850, "zone": "Northern Canopy Zone"},
        {"node": "CAM-TRAP-04", "lat": 26.0150, "lng": 76.5100, "zone": "Southern Ridge"},
    ]

    sightings = []
    now = datetime.now(timezone.utc)
    species_pool = CANDIDATE_SPECIES[:6]  # keep to common wildlife

    for i in range(n):
        loc = random.choice(node_locations)
        species = random.choice(species_pool)
        confidence = round(random.uniform(55, 97), 1)
        ts = (now - timedelta(minutes=random.randint(0, 2880))).isoformat()
        sightings.append({
            "sighting_id": f"SG-{1000 + i}",
            "camera_node": loc["node"],
            "zone": loc["zone"],
            "lat": loc["lat"] + random.uniform(-0.002, 0.002),
            "lng": loc["lng"] + random.uniform(-0.002, 0.002),
            "species": species,
            "confidence": confidence,
            "timestamp": ts,
            "simulated": True
        })

    return sorted(sightings, key=lambda x: x["timestamp"], reverse=True)
