"""
Per-species baseline parameters. This is the knob-panel for the
simulation and a stand-in for what will eventually come from real
tracking/sensor data per species. Keeping it as one small config table
means adding a new simulated species (elephant, boar, deer) is a one-line
change, not new code paths.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class SpeciesProfile:
    name: str
    avg_speed_mps: float  # typical cruising speed
    danger_factor: float  # 0-1, how dangerous an encounter is (used by threat scorer)
    image_placeholder: str


SPECIES_PROFILES: dict[str, SpeciesProfile] = {
    "Leopard": SpeciesProfile("Leopard", avg_speed_mps=2.2, danger_factor=0.9, image_placeholder="leopard.jpg"),
    "Elephant": SpeciesProfile("Elephant", avg_speed_mps=1.4, danger_factor=0.85, image_placeholder="elephant.jpg"),
    "Wild Boar": SpeciesProfile("Wild Boar", avg_speed_mps=1.8, danger_factor=0.5, image_placeholder="boar.jpg"),
    "Deer": SpeciesProfile("Deer", avg_speed_mps=3.0, danger_factor=0.1, image_placeholder="deer.jpg"),
}


def get_species_profile(species: str) -> SpeciesProfile:
    return SPECIES_PROFILES.get(species, SpeciesProfile(species, avg_speed_mps=1.5, danger_factor=0.5, image_placeholder="animal.jpg"))
