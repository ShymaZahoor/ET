import {
  Animal,
  Detection,
  Threat,
  Incident,
  ResponderTeam,
  Camera,
  Prediction,
  HabitatData,
  AIModelStatus,
  NotificationItem,
} from '../types';
import {
  mockAnimals,
  mockCameras,
  mockDetections,
  mockThreats,
  mockIncidents,
  mockResponderTeams,
  mockPrediction,
  mockHabitat,
  mockAIStatus,
  mockNotifications,
  mockAnalytics,
} from '../data/mockData';

// In-memory mutable copies to simulate realistic REST/WebSocket updates in the browser
let mutableIncidents: Incident[] = [...mockIncidents];
let mutableTeams: ResponderTeam[] = [...mockResponderTeams];
let mutableNotifications: NotificationItem[] = [...mockNotifications];
let mutableAnimals: Animal[] = [...mockAnimals];

export const ecoTwinApi = {
  // Animals & Tracking
  async getAnimals(): Promise<Animal[]> {
    return Promise.resolve([...mutableAnimals]);
  },

  async getAnimalById(id: string): Promise<Animal | undefined> {
    return Promise.resolve(mutableAnimals.find((a) => a.id === id || a.trackId === id));
  },

  // Cameras & Live Detection
  async getCameras(): Promise<Camera[]> {
    return Promise.resolve([...mockCameras]);
  },

  async getDetections(): Promise<Detection[]> {
    return Promise.resolve([...mockDetections]);
  },

  // Active Threats
  async getThreats(): Promise<Threat[]> {
    return Promise.resolve([...mockThreats]);
  },

  async getThreatByTrackId(trackId: string): Promise<Threat | undefined> {
    return Promise.resolve(mockThreats.find((t) => t.trackId === trackId));
  },

  // Incidents
  async getIncidents(): Promise<Incident[]> {
    return Promise.resolve([...mutableIncidents]);
  },

  async getIncidentById(id: string): Promise<Incident | undefined> {
    return Promise.resolve(mutableIncidents.find((inc) => inc.id === id));
  },

  async assignTeamToIncident(incidentId: string, teamId: string): Promise<Incident> {
    const incidentIndex = mutableIncidents.findIndex((i) => i.id === incidentId);
    const team = mutableTeams.find((t) => t.id === teamId);
    if (incidentIndex !== -1 && team) {
      mutableIncidents[incidentIndex] = {
        ...mutableIncidents[incidentIndex],
        assignedTeamId: team.id,
        assignedTeamName: team.name,
        status: 'Assigned',
        timeline: [
          ...mutableIncidents[incidentIndex].timeline,
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `${team.name} assigned to coordinate response`,
            badge: 'Assigned',
            type: 'assigned',
          },
        ],
      };
      // Also update team status
      const teamIdx = mutableTeams.findIndex((t) => t.id === teamId);
      if (teamIdx !== -1) {
        mutableTeams[teamIdx] = {
          ...mutableTeams[teamIdx],
          status: 'On Mission',
          currentAssignment: `${incidentId} (${mutableIncidents[incidentIndex].location})`,
        };
      }
      return Promise.resolve(mutableIncidents[incidentIndex]);
    }
    throw new Error('Incident or Team not found');
  },

  async updateIncidentStatus(incidentId: string, newStatus: Incident['status']): Promise<Incident> {
    const incidentIndex = mutableIncidents.findIndex((i) => i.id === incidentId);
    if (incidentIndex !== -1) {
      mutableIncidents[incidentIndex] = {
        ...mutableIncidents[incidentIndex],
        status: newStatus,
        timeline: [
          ...mutableIncidents[incidentIndex].timeline,
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Incident status updated to ${newStatus}`,
            badge: newStatus,
            type: newStatus === 'Resolved' ? 'resolved' : 'monitoring',
          },
        ],
      };
      return Promise.resolve(mutableIncidents[incidentIndex]);
    }
    throw new Error('Incident not found');
  },

  // Responder Teams
  async getResponderTeams(): Promise<ResponderTeam[]> {
    return Promise.resolve([...mutableTeams]);
  },

  async dispatchTeam(teamId: string, targetLocation: string): Promise<ResponderTeam> {
    const idx = mutableTeams.findIndex((t) => t.id === teamId);
    if (idx !== -1) {
      mutableTeams[idx] = {
        ...mutableTeams[idx],
        status: 'En Route',
        currentAssignment: `Dispatched to ${targetLocation}`,
      };
      return Promise.resolve(mutableTeams[idx]);
    }
    throw new Error('Team not found');
  },

  // Predictive Intelligence
  async getPredictions(): Promise<Prediction> {
    return Promise.resolve({ ...mockPrediction });
  },

  async runNewPrediction(trackId: string): Promise<Prediction> {
    // Simulate re-running LSTM trajectory inference
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockPrediction,
          trackId,
          predictionConfidence: 81,
          entryProbability: 84,
          etaToZone: '28 min',
          riskScore: 81.2,
        });
      }, 700);
    });
  },

  // Habitat & Environment
  async getHabitatData(): Promise<HabitatData> {
    return Promise.resolve({ ...mockHabitat });
  },

  // AI & Data Models
  async getModelStatus(): Promise<AIModelStatus> {
    return Promise.resolve({ ...mockAIStatus });
  },

  // Analytics & Reports
  async getAnalyticsData(timeRange: string = 'Last 24 Hours') {
    return Promise.resolve({ ...mockAnalytics, timeRange });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return Promise.resolve([...mutableNotifications]);
  },

  async markNotificationRead(id: string): Promise<void> {
    mutableNotifications = mutableNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return Promise.resolve();
  },

  async markAllNotificationsRead(): Promise<void> {
    mutableNotifications = mutableNotifications.map((n) => ({ ...n, read: true }));
    return Promise.resolve();
  },
};

export const vanDristiApi = ecoTwinApi;
