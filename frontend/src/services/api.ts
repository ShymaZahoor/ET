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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        message =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/*
 * Vandristi API
 *
 * Frontend:
 *   http://localhost:3000
 *
 * Backend:
 *   http://localhost:8000
 *
 * API:
 *   http://localhost:8000/api/v1
 */
export const vanDristiApi = {
  // ============================================================
  // Animals & Tracking
  // ============================================================

  async getAnimals(): Promise<Animal[]> {
    return request<Animal[]>('/animals');
  },

  async getAnimalById(id: string): Promise<Animal | undefined> {
    try {
      return await request<Animal>(`/animals/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }

      throw error;
    }
  },

  // ============================================================
  // Cameras & Live Detection
  // ============================================================

  async getCameras(): Promise<Camera[]> {
    return request<Camera[]>('/cameras');
  },

  async getDetections(): Promise<Detection[]> {
    return request<Detection[]>('/detections');
  },

  // ============================================================
  // Active Threats
  // ============================================================

  async getThreats(): Promise<Threat[]> {
    return request<Threat[]>('/threats');
  },

  async getThreatByTrackId(
    trackId: string
  ): Promise<Threat | undefined> {
    try {
      return await request<Threat>(
        `/threats/track/${encodeURIComponent(trackId)}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }

      throw error;
    }
  },

  // ============================================================
  // Incidents
  // ============================================================

  async getIncidents(): Promise<Incident[]> {
    return request<Incident[]>('/incidents');
  },

  async getIncidentById(
    id: string
  ): Promise<Incident | undefined> {
    try {
      return await request<Incident>(
        `/incidents/${encodeURIComponent(id)}`
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }

      throw error;
    }
  },

  async assignTeamToIncident(
    incidentId: string,
    teamId: string
  ): Promise<Incident> {
    return request<Incident>(
      `/incidents/${encodeURIComponent(incidentId)}/assign-team`,
      {
        method: 'POST',
        body: JSON.stringify({
          team_id: teamId,
        }),
      }
    );
  },

  async updateIncidentStatus(
    incidentId: string,
    newStatus: Incident['status']
  ): Promise<Incident> {
    return request<Incident>(
      `/incidents/${encodeURIComponent(incidentId)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );
  },

  // ============================================================
  // Responder Teams
  // ============================================================

  async getResponderTeams(): Promise<ResponderTeam[]> {
    return request<ResponderTeam[]>('/responder-teams');
  },

  async dispatchTeam(
    teamId: string,
    targetLocation: string
  ): Promise<ResponderTeam> {
    return request<ResponderTeam>(
      `/responder-teams/${encodeURIComponent(teamId)}/dispatch`,
      {
        method: 'POST',
        body: JSON.stringify({
          target_location: targetLocation,
        }),
      }
    );
  },

  // ============================================================
  // Predictive Intelligence
  // ============================================================

  async getPredictions(): Promise<Prediction> {
    return request<Prediction>('/predictions');
  },

  async runNewPrediction(
    trackId: string
  ): Promise<Prediction> {
    return request<Prediction>('/predictions/run', {
      method: 'POST',
      body: JSON.stringify({
        track_id: trackId,
      }),
    });
  },

  // ============================================================
  // Habitat & Environment
  // ============================================================

  async getHabitatData(): Promise<HabitatData> {
    return request<HabitatData>('/habitat');
  },

  // ============================================================
  // AI & Data Models
  // ============================================================

  async getModelStatus(): Promise<AIModelStatus> {
    return request<AIModelStatus>('/ai-status');
  },

  // ============================================================
  // Analytics & Reports
  // ============================================================

  async getAnalyticsData(
    timeRange: string = 'Last 24 Hours'
  ) {
    const encodedRange = encodeURIComponent(timeRange);

    return request(
      `/analytics?time_range=${encodedRange}`
    );
  },

  // ============================================================
  // Notifications
  // ============================================================

  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/notifications');
  },

  async markNotificationRead(id: string): Promise<void> {
    await request<void>(
      `/notifications/${encodeURIComponent(id)}/read`,
      {
        method: 'PATCH',
      }
    );
  },

  async markAllNotificationsRead(): Promise<void> {
    await request<void>('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

// Backward compatibility.
//
// Some existing frontend components may still import:
//   ecoTwinApi
//
// We don't need to rewrite those components immediately.
export const ecoTwinApi = vanDristiApi;