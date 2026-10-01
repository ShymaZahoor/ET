export type RiskSeverity = 'Critical' | 'High' | 'Warning' | 'Watch' | 'Normal';
export type IncidentStatus = 'Active' | 'Monitoring' | 'Assigned' | 'Resolved';
export type TeamStatus = 'Available' | 'On Mission' | 'En Route' | 'Offline';
export type CameraStatus = 'Live' | 'Standby' | 'Offline';

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
}

export interface Detection {
  id: string;
  cameraId: string;
  cameraName: string;
  species: string;
  confidence: number; // e.g. 96.2
  timestamp: string;
  boundingBox: BoundingBox;
  trackId: string;
  image: string;
  movementDirection?: string;
}

export interface Animal {
  id: string;
  trackId: string;
  species: string;
  image: string;
  location: string;
  speed: string;
  direction: string;
  lastSeen: string;
  riskLevel: 'Critical' | 'High' | 'Monitoring' | 'Normal';
  status: 'Active' | 'Monitoring' | 'Resolved';
  coordinates: [number, number];
}

export interface Threat {
  id: string;
  trackId: string;
  species: string;
  image: string;
  location: string;
  riskScore: number; // 0 - 100
  entryProbability: number; // 0 - 100%
  eta: string; // e.g. "32 min"
  status: 'Critical' | 'High' | 'Warning' | 'Watch';
  distanceToZone: string;
  zoneName: string;
  direction: string;
  speed: string;
  coordinates: [number, number];
}

export interface IncidentTimelineEvent {
  time: string;
  text: string;
  badge?: string;
  type?: 'detected' | 'classified' | 'assigned' | 'enroute' | 'monitoring' | 'resolved';
}

export interface IncidentEvidence {
  id: string;
  type: 'camera_frame' | 'track_recording' | 'sensor_log';
  title: string;
  timestamp: string;
  cameraId: string;
  confidence: number;
  image: string;
}

export interface Incident {
  id: string;
  type: string;
  species: string;
  location: string;
  severity: 'Critical' | 'High' | 'Warning' | 'Watch';
  created: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  status: IncidentStatus;
  trackId: string;
  riskScore: number;
  entryProbability: number;
  eta: string;
  distanceToSettlement: string;
  timeline: IncidentTimelineEvent[];
  evidence: IncidentEvidence[];
  coordinates: [number, number];
}

export interface ResponderTeam {
  id: string;
  name: string;
  region: string;
  status: TeamStatus;
  distance: string;
  eta: string;
  currentAssignment?: string;
  membersCount: number;
  leader: string;
  coordinates: [number, number];
  contactChannel: string;
}

export interface Camera {
  id: string;
  name: string;
  zone: string;
  status: CameraStatus;
  animalsDetected: number;
  lastConfidence: number;
  direction: string;
  coordinates: [number, number];
  thumbnail: string;
  activeSpecies?: string;
}

export interface Prediction {
  trackId: string;
  species: string;
  image: string;
  currentLocation: string;
  predictedDestination: string;
  etaToZone: string;
  entryProbability: number; // 0 - 100%
  predictionConfidence: number; // 0 - 100%
  riskScore: number; // 0 - 100
  movementPath: Array<{ step: number; name: string; lat: number; lng: number; time: string; risk: number }>;
}

export interface HabitatData {
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  ndvi: number;
  condition: string;
  waterSources: number;
  corridorIntegrity: string;
}

export interface AIModelStatus {
  detection: {
    name: string;
    architecture: string;
    status: 'Online' | 'Calibrating' | 'Offline';
    map50: number;
    precision: number;
    recall: number;
    lastUpdated: string;
  };
  tracking: {
    name: string;
    architecture: string;
    status: 'Online' | 'Calibrating' | 'Offline';
    activeTracks: number;
    trackingFps: number;
    lastUpdated: string;
  };
  riskPrediction: {
    name: string;
    architecture: string;
    status: 'Online' | 'Calibrating' | 'Offline';
    accuracy: number;
    lastUpdated: string;
  };
  dataset: {
    totalImages: number;
    speciesCount: number;
    trainingImages: number;
    validationImages: number;
    testImages: number;
  };
  classes: Array<{
    id: string;
    name: string;
    samples: number;
    f1Score: number;
    precision: number;
    recall: number;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  read: boolean;
  link?: string;
}
