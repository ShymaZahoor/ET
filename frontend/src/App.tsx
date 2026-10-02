import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { WildlifeMonitoringPage } from './pages/WildlifeMonitoringPage';
import { ActiveThreatsPage } from './pages/ActiveThreatsPage';
import { MapPage } from './pages/MapPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { ResponderTeamsPage } from './pages/ResponderTeamsPage';
import { HabitatPage } from './pages/HabitatPage';
import { PredictiveIntelligencePage } from './pages/PredictiveIntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { AIDataPage } from './pages/AIDataPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Authentication Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Operational Web Application Shell */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="live-detection" element={<LiveDetectionPage />} />
          <Route path="wildlife" element={<WildlifeMonitoringPage />} />
          <Route path="threats" element={<ActiveThreatsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:id" element={<IncidentDetailsPage />} />
          <Route path="teams" element={<ResponderTeamsPage />} />
          <Route path="habitat" element={<HabitatPage />} />
          <Route path="predictive" element={<PredictiveIntelligencePage />} />
          <Route path="analytics" element={<ReportsPage />} />
          <Route path="ai-data" element={<AIDataPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
