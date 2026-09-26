'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5107';

type TimelineItem = {
  status: string;
  description: string;
  occurredAt: string;
};

type TrackingResponse = {
  trackingCode: string;
  status: string;
  currentLocation: string;
  lastUpdated: string;
  timeline: TimelineItem[];
};

type QuoteResponse = {
  estimatedCost: number;
  estimatedDeliveryDays: number;
  destination: string;
  currency: string;
  serviceLevel: string;
};

type ParcelSummary = {
  trackingCode: string;
  status: string;
  currentLocation: string;
  destination: string;
  routeName: string;
  assignedAgent: string | null;
  updatedAt: string;
  isDelayed: boolean;
};

type RouteSummary = {
  name: string;
  activeParcels: number;
  delayedParcels: number;
  agents: string[];
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  trackingCode: string;
  createdAt: string;
  priority: string;
};

type DashboardSummary = {
  totalParcels: number;
  activeParcels: number;
  delayedParcels: number;
  recentParcels: ParcelSummary[];
};

type Locale = 'fr' | 'en';

const translations = {
  fr: {
    title: 'Suivez vos colis avec clarté.',
    subtitle: 'Une plateforme simple de visibilité logistique pour le suivi des colis et l’exploitation des livraisons.',
    overview: 'Vue d’ensemble',
    totalParcels: 'Total colis',
    active: 'Actifs',
    inProgress: 'En cours',
    delayed: 'Retardés',
    exceptions: 'Exceptions',
    trackingTitle: 'Suivi de colis',
    trackingPlaceholder: 'Code de suivi',
    trackingButton: 'Vérifier le colis',
    trackingNotFound: 'Code de suivi introuvable. Essayez DT-SAMPLE01.',
    createTitle: 'Créer un colis',
    sender: 'Expéditeur',
    recipient: 'Destinataire',
    destination: 'Destination',
    weightKg: 'Poids (kg)',
    createButton: 'Enregistrer le colis',
    statusTitle: 'Mise à jour du statut',
    statusLabel: 'Statut',
    locationLabel: 'Localisation actuelle',
    routeLabel: 'Route',
    agentLabel: 'Agent assigné',
    exceptionLabel: 'Exception',
    noteLabel: 'Note de statut',
    saveStatus: 'Enregistrer la mise à jour',
    quoteTitle: 'Estimation d’envoi',
    quoteError: 'La demande de devis n’a pas pu être traitée.',
    serviceLevel: 'Niveau de service',
    quoteButton: 'Obtenir un devis',
    routeOverview: 'Vue des routes',
    assignTitle: 'Assigner une route',
    routeName: 'Nom de la route',
    assignButton: 'Enregistrer l’assignation',
    parcelList: 'Liste opérationnelle des colis',
    filterStatus: 'Statut',
    filterRoute: 'Route',
    filterAgent: 'Agent',
    filterSearch: 'Recherche',
    noParcel: 'Aucun colis ne correspond aux filtres actuels.',
    notifications: 'Flux de notifications',
    noNotifications: 'Aucune notification pour le moment.',
    trackingDetails: 'Détails du suivi',
    currentLocation: 'Localisation actuelle',
    lastUpdated: 'Dernière mise à jour',
    visibility: 'Visibilité',
    visibilityText: 'Étapes claires du colis et progression de livraison.',
    operationalControl: 'Contrôle opérationnel',
    operationalText: 'Suivi des routes, exceptions et coordination des livraisons.',
    language: 'Langue',
    french: 'Français',
    english: 'English',
    statusRegistered: 'Enregistré',
    statusPickedUp: 'Collecté',
    statusInTransit: 'En transit',
    statusCustomsReview: 'Vérification douanière',
    statusDelayed: 'Retardé',
    statusDelivered: 'Livré',
    statusAssigned: 'Assigné',
    priorityNormal: 'Normal',
    priorityHigh: 'Élevée',
    priorityRoute: 'Route',
    priorityDelivery: 'Livraison',
    noAgent: 'Non assigné',
    noDelay: 'Aucun retard',
    yesDelay: 'Retardé',
    standard: 'Standard',
    priority: 'Prioritaire',
    express: 'Express',
  },
  en: {
    title: 'Track your parcels with clarity.',
    subtitle: 'A simple logistics visibility platform for parcel tracking and delivery operations.',
    overview: 'Overview',
    totalParcels: 'Total parcels',
    active: 'Active',
    inProgress: 'In progress',
    delayed: 'Delayed',
    exceptions: 'Exceptions',
    trackingTitle: 'Parcel tracking',
    trackingPlaceholder: 'Tracking code',
    trackingButton: 'Check parcel',
    trackingNotFound: 'Tracking code not found. Try DT-SAMPLE01.',
    createTitle: 'Create a parcel',
    sender: 'Sender',
    recipient: 'Recipient',
    destination: 'Destination',
    weightKg: 'Weight (kg)',
    createButton: 'Register parcel',
    statusTitle: 'Update status',
    statusLabel: 'Status',
    locationLabel: 'Current location',
    routeLabel: 'Route',
    agentLabel: 'Assigned agent',
    exceptionLabel: 'Exception',
    noteLabel: 'Status note',
    saveStatus: 'Save update',
    quoteTitle: 'Shipping estimate',
    quoteError: 'Quote request could not be processed.',
    serviceLevel: 'Service level',
    quoteButton: 'Get quote',
    routeOverview: 'Route overview',
    assignTitle: 'Assign a route',
    routeName: 'Route name',
    assignButton: 'Save assignment',
    parcelList: 'Operational parcel list',
    filterStatus: 'Status',
    filterRoute: 'Route',
    filterAgent: 'Agent',
    filterSearch: 'Search',
    noParcel: 'No parcel matches the current filter.',
    notifications: 'Notification feed',
    noNotifications: 'No notifications yet.',
    trackingDetails: 'Tracking details',
    currentLocation: 'Current location',
    lastUpdated: 'Last updated',
    visibility: 'Visibility',
    visibilityText: 'Clear parcel milestones and delivery progress.',
    operationalControl: 'Operational control',
    operationalText: 'Track routes, exceptions, and delivery coordination.',
    language: 'Language',
    french: 'Français',
    english: 'English',
    statusRegistered: 'Registered',
    statusPickedUp: 'Picked up',
    statusInTransit: 'In transit',
    statusCustomsReview: 'Customs review',
    statusDelayed: 'Delayed',
    statusDelivered: 'Delivered',
    statusAssigned: 'Assigned',
    priorityNormal: 'Normal',
    priorityHigh: 'High',
    priorityRoute: 'Route',
    priorityDelivery: 'Delivery',
    noAgent: 'Unassigned',
    noDelay: 'No delay',
    yesDelay: 'Delayed',
    standard: 'Standard',
    priority: 'Priority',
    express: 'Express',
  },
} as const;

const statusLabels: Record<string, Record<Locale, string>> = {
  Registered: { fr: 'Enregistré', en: 'Registered' },
  'Picked up': { fr: 'Collecté', en: 'Picked up' },
  'In transit': { fr: 'En transit', en: 'In transit' },
  'Customs review': { fr: 'Vérification douanière', en: 'Customs review' },
  Delayed: { fr: 'Retardé', en: 'Delayed' },
  Delivered: { fr: 'Livré', en: 'Delivered' },
  Assigned: { fr: 'Assigné', en: 'Assigned' },
};

const routeLabels: Record<string, Record<Locale, string>> = {
  'North hub': { fr: 'Hub Nord', en: 'North hub' },
  'South hub': { fr: 'Hub Sud', en: 'South hub' },
  'West route': { fr: 'Itinéraire Ouest', en: 'West route' },
  'East route': { fr: 'Itinéraire Est', en: 'East route' },
  'Central route': { fr: 'Itinéraire Central', en: 'Central route' },
};

const priorityLabels: Record<string, Record<Locale, string>> = {
  normal: { fr: 'Normal', en: 'Normal' },
  high: { fr: 'Élevée', en: 'High' },
  route: { fr: 'Route', en: 'Route' },
  delivery: { fr: 'Livraison', en: 'Delivery' },
};

const translateStatus = (status?: string, locale: Locale = 'fr') => {
  if (!status) {
    return locale === 'fr' ? '—' : '—';
  }

  return statusLabels[status]?.[locale] ?? status;
};

const translatePriority = (priority?: string, locale: Locale = 'fr') => {
  if (!priority) {
    return locale === 'fr' ? 'Normal' : 'Normal';
  }

  return priorityLabels[priority.toLowerCase()]?.[locale] ?? priority;
};

const translateRoute = (route?: string, locale: Locale = 'fr') => {
  if (!route) {
    return locale === 'fr' ? 'Non assigné' : 'Unassigned';
  }

  return routeLabels[route]?.[locale] ?? route;
};

export default function HomePage() {
  const [trackingCode, setTrackingCode] = useState('DT-SAMPLE01');
  const [language, setLanguage] = useState<Locale>('fr');
  const copy = translations[language];
  const [trackingResult, setTrackingResult] = useState<TrackingResponse | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [parcelList, setParcelList] = useState<ParcelSummary[]>([]);
  const [filters, setFilters] = useState({ status: '', route: '', agent: '', search: '' });
  const [parcelForm, setParcelForm] = useState({
    senderName: 'Awa Diakité',
    recipientName: 'Moussa Traoré',
    destination: 'Dakar, Senegal',
    weightKg: '2.4',
  });
  const [statusForm, setStatusForm] = useState({
    status: 'In transit',
    currentLocation: 'Dakar sorting hub',
    routeName: 'West route',
    assignedAgent: 'Ibrahim Kone',
    note: 'Parcel moved to transit checkpoint.',
    isDelayed: 'false',
  });
  const [quoteForm, setQuoteForm] = useState({
    destination: 'Bamako, Mali',
    weightKg: '3.5',
    serviceLevel: 'Standard',
  });
  const [assignmentForm, setAssignmentForm] = useState({
    routeName: 'North hub',
    assignedAgent: 'Amina Diallo',
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await fetch(`${API_BASE}/api/admin/dashboard`);
      if (response.ok) {
        const data = (await response.json()) as DashboardSummary;
        setDashboard(data);
      }

      const routeResponse = await fetch(`${API_BASE}/api/routes`);
      if (routeResponse.ok) {
        const routeData = (await routeResponse.json()) as { routes: RouteSummary[] };
        setRoutes(routeData.routes ?? []);
      }

      const notificationResponse = await fetch(`${API_BASE}/api/notifications`);
      if (notificationResponse.ok) {
        const notificationData = (await notificationResponse.json()) as { items: NotificationItem[] };
        setNotifications(notificationData.items ?? []);
      }

      const parcelResponse = await fetch(`${API_BASE}/api/parcels`);
      if (parcelResponse.ok) {
        const parcelData = (await parcelResponse.json()) as { items: ParcelSummary[] };
        setParcelList(parcelData.items ?? []);
      }
    };

    void loadDashboard();
  }, []);

  useEffect(() => {
    const loadFilteredParcels = async () => {
      const query = new URLSearchParams();
      if (filters.status) query.set('status', filters.status);
      if (filters.route) query.set('route', filters.route);
      if (filters.agent) query.set('agent', filters.agent);
      if (filters.search) query.set('search', filters.search);

      const response = await fetch(`${API_BASE}/api/parcels?${query.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as { items: ParcelSummary[] };
        setParcelList(data.items ?? []);
      }
    };

    void loadFilteredParcels();
  }, [filters]);

  const handleTrackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTrackingError('');

    const response = await fetch(`${API_BASE}/api/parcels/track/${encodeURIComponent(trackingCode)}`);

    if (!response.ok) {
      setTrackingError(copy.trackingNotFound);
      setTrackingResult(null);
      return;
    }

    const data = (await response.json()) as TrackingResponse;
    setTrackingResult(data);
  };

  const handleCreateParcel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/parcels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: parcelForm.senderName,
        recipientName: parcelForm.recipientName,
        destination: parcelForm.destination,
        weightKg: Number(parcelForm.weightKg),
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { trackingCode: string };
    setTrackingCode(data.trackingCode);
    const refreshed = await fetch(`${API_BASE}/api/admin/dashboard`);
    if (refreshed.ok) {
      const dashboardData = (await refreshed.json()) as DashboardSummary;
      setDashboard(dashboardData);
    }
  };

  const handleStatusUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/parcels/${encodeURIComponent(trackingCode)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: statusForm.status,
        currentLocation: statusForm.currentLocation,
        routeName: statusForm.routeName,
        assignedAgent: statusForm.assignedAgent,
        note: statusForm.note,
        isDelayed: statusForm.isDelayed === 'true',
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as TrackingResponse;
    setTrackingResult(data);

    const refreshed = await fetch(`${API_BASE}/api/admin/dashboard`);
    if (refreshed.ok) {
      const dashboardData = (await refreshed.json()) as DashboardSummary;
      setDashboard(dashboardData);
    }
  };

  const handleQuoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuoteError('');

    const response = await fetch(`${API_BASE}/api/pricing/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: quoteForm.destination,
        weightKg: Number(quoteForm.weightKg),
        serviceLevel: quoteForm.serviceLevel,
      }),
    });

    if (!response.ok) {
      setQuoteError(copy.quoteError);
      setQuote(null);
      return;
    }

    const data = (await response.json()) as QuoteResponse;
    setQuote(data);
  };

  const handleAssignRoute = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`${API_BASE}/api/parcels/${encodeURIComponent(trackingCode)}/assign-route`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routeName: assignmentForm.routeName,
        assignedAgent: assignmentForm.assignedAgent,
      }),
    });

    if (!response.ok) {
      return;
    }

    const routeResponse = await fetch(`${API_BASE}/api/routes`);
    if (routeResponse.ok) {
      const routeData = (await routeResponse.json()) as { routes: RouteSummary[] };
      setRoutes(routeData.routes ?? []);
    }

    const notificationResponse = await fetch(`${API_BASE}/api/notifications`);
    if (notificationResponse.ok) {
      const notificationData = (await notificationResponse.json()) as { items: NotificationItem[] };
      setNotifications(notificationData.items ?? []);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Box>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Box>
              <Typography variant="overline" color="primary">MinanTrack</Typography>
              <Typography variant="h3" component="h1" fontWeight={700}>
                {copy.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {copy.subtitle}
              </Typography>
            </Box>
            <TextField
              select
              size="small"
              label={copy.language}
              value={language}
              onChange={(event) => setLanguage(event.target.value as Locale)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="fr">{copy.french}</MenuItem>
              <MenuItem value="en">{copy.english}</MenuItem>
            </TextField>
          </Stack>
        </Box>

        {dashboard ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="overline" color="primary">{copy.overview}</Typography>
                <Typography variant="h5">{dashboard.totalParcels}</Typography>
                <Typography color="text.secondary">{copy.totalParcels}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="overline" color="primary">{copy.active}</Typography>
                <Typography variant="h5">{dashboard.activeParcels}</Typography>
                <Typography color="text.secondary">{copy.inProgress}</Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="overline" color="primary">{copy.delayed}</Typography>
                <Typography variant="h5">{dashboard.delayedParcels}</Typography>
                <Typography color="text.secondary">{copy.exceptions}</Typography>
              </CardContent>
            </Card>
          </Stack>
        ) : null}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleTrackSubmit}>
                <Typography variant="h6">{copy.trackingTitle}</Typography>
                <TextField
                  label={copy.trackingPlaceholder}
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large">
                  {copy.trackingButton}
                </Button>
                {trackingError ? (
                  <Typography color="error.main">{trackingError}</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleCreateParcel}>
                <Typography variant="h6">{copy.createTitle}</Typography>
                <TextField
                  label={copy.sender}
                  value={parcelForm.senderName}
                  onChange={(event) => setParcelForm((current) => ({ ...current, senderName: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.recipient}
                  value={parcelForm.recipientName}
                  onChange={(event) => setParcelForm((current) => ({ ...current, recipientName: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.destination}
                  value={parcelForm.destination}
                  onChange={(event) => setParcelForm((current) => ({ ...current, destination: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.weightKg}
                  type="number"
                  value={parcelForm.weightKg}
                  onChange={(event) => setParcelForm((current) => ({ ...current, weightKg: event.target.value }))}
                  fullWidth
                />
                <Button type="submit" variant="outlined" size="large">
                  {copy.createButton}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleStatusUpdate}>
                <Typography variant="h6">{copy.statusTitle}</Typography>
                <TextField
                  select
                  label={copy.statusLabel}
                  value={statusForm.status}
                  onChange={(event) => setStatusForm((current) => ({ ...current, status: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="Registered">{copy.statusRegistered}</MenuItem>
                  <MenuItem value="Picked up">{copy.statusPickedUp}</MenuItem>
                  <MenuItem value="In transit">{copy.statusInTransit}</MenuItem>
                  <MenuItem value="Delayed">{copy.statusDelayed}</MenuItem>
                  <MenuItem value="Delivered">{copy.statusDelivered}</MenuItem>
                </TextField>
                <TextField
                  label={copy.locationLabel}
                  value={statusForm.currentLocation}
                  onChange={(event) => setStatusForm((current) => ({ ...current, currentLocation: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.routeLabel}
                  value={statusForm.routeName}
                  onChange={(event) => setStatusForm((current) => ({ ...current, routeName: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.agentLabel}
                  value={statusForm.assignedAgent}
                  onChange={(event) => setStatusForm((current) => ({ ...current, assignedAgent: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label={copy.exceptionLabel}
                  value={statusForm.isDelayed}
                  onChange={(event) => setStatusForm((current) => ({ ...current, isDelayed: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="false">{copy.noDelay}</MenuItem>
                  <MenuItem value="true">{copy.yesDelay}</MenuItem>
                </TextField>
                <TextField
                  label={copy.noteLabel}
                  value={statusForm.note}
                  onChange={(event) => setStatusForm((current) => ({ ...current, note: event.target.value }))}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Button type="submit" variant="contained" size="large">
                  {copy.saveStatus}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleQuoteSubmit}>
                <Typography variant="h6">{copy.quoteTitle}</Typography>
                <TextField
                  label={copy.destination}
                  value={quoteForm.destination}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, destination: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label={copy.weightKg}
                  type="number"
                  value={quoteForm.weightKg}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, weightKg: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label={copy.serviceLevel}
                  value={quoteForm.serviceLevel}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, serviceLevel: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="Standard">{copy.standard}</MenuItem>
                  <MenuItem value="Priority">{copy.priority}</MenuItem>
                  <MenuItem value="Express">{copy.express}</MenuItem>
                </TextField>
                <Button type="submit" variant="outlined" size="large">
                  {copy.quoteButton}
                </Button>
                {quoteError ? <Typography color="error.main">{quoteError}</Typography> : null}
                {quote ? (
                  <Box sx={{ bgcolor: 'rgba(25,118,210,0.06)', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: quote.currency }).format(quote.estimatedCost)}
                    </Typography>
                    <Typography color="text.secondary">
                      Livraison en {quote.estimatedDeliveryDays} jours • {quote.serviceLevel}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {routes.length > 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{copy.routeOverview}</Typography>
              <Stack spacing={2}>
                {routes.map((route) => (
                  <Box key={route.name} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>{translateRoute(route.name, language)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {route.activeParcels} colis actifs • {route.delayedParcels} retardés
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Agents : {route.agents.join(', ') || copy.noAgent}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent>
            <Stack spacing={2} component="form" onSubmit={handleAssignRoute}>
              <Typography variant="h6">{copy.assignTitle}</Typography>
              <TextField
                label={copy.routeName}
                value={assignmentForm.routeName}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, routeName: event.target.value }))}
                fullWidth
              />
              <TextField
                label={copy.agentLabel}
                value={assignmentForm.assignedAgent}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, assignedAgent: event.target.value }))}
                fullWidth
              />
              <Button type="submit" variant="contained">
                {copy.assignButton}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{copy.parcelList}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                size="small"
                label={copy.filterStatus}
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              />
              <TextField
                size="small"
                label={copy.filterRoute}
                value={filters.route}
                onChange={(event) => setFilters((current) => ({ ...current, route: event.target.value }))}
              />
              <TextField
                size="small"
                label={copy.filterAgent}
                value={filters.agent}
                onChange={(event) => setFilters((current) => ({ ...current, agent: event.target.value }))}
              />
              <TextField
                size="small"
                label={copy.filterSearch}
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </Stack>

            <Stack spacing={1}>
              {parcelList.length === 0 ? (
                <Alert severity="info">{copy.noParcel}</Alert>
              ) : (
                parcelList.map((parcel) => (
                  <Box key={parcel.trackingCode} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={700}>{parcel.trackingCode}</Typography>
                        <Typography variant="body2" color="text.secondary">{parcel.destination}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">{translateStatus(parcel.status, language)}</Typography>
                        <Typography variant="caption" color="text.secondary">{translateRoute(parcel.routeName, language)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2">{parcel.assignedAgent ?? copy.noAgent}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {parcel.isDelayed ? copy.yesDelay : 'En bon état'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{copy.notifications}</Typography>
            <Stack spacing={1}>
              {notifications.length === 0 ? (
                <Alert severity="info">{copy.noNotifications}</Alert>
              ) : (
                notifications.map((item) => (
                  <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.trackingCode} • {translatePriority(item.priority, language)} • {new Date(item.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        {trackingResult ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" color="primary">{copy.trackingDetails}</Typography>
                  <Typography variant="h5">{trackingResult.trackingCode}</Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">{copy.statusLabel}</Typography>
                    <Typography variant="h6">{translateStatus(trackingResult.status, language)}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">{copy.currentLocation}</Typography>
                    <Typography variant="h6">{trackingResult.currentLocation}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">{copy.lastUpdated}</Typography>
                    <Typography variant="h6">
                      {new Date(trackingResult.lastUpdated).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  {trackingResult.timeline.map((item, index) => (
                    <Box key={`${item.status}-${index}`} sx={{ borderLeft: '3px solid #1976d2', pl: 2 }}>
                      <Typography fontWeight={600}>{translateStatus(item.status, language)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.occurredAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">{copy.visibility}</Typography>
              <Typography color="text.secondary">{copy.visibilityText}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">{copy.operationalControl}</Typography>
              <Typography color="text.secondary">{copy.operationalText}</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
