'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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

export default function HomePage() {
  const [trackingCode, setTrackingCode] = useState('DT-SAMPLE01');
  const [trackingResult, setTrackingResult] = useState<TrackingResponse | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoteForm, setQuoteForm] = useState({
    destination: 'Bamako, Mali',
    weightKg: '3.5',
    serviceLevel: 'Standard',
  });

  const handleTrackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTrackingError('');

    const response = await fetch(`${API_BASE}/api/parcels/track/${encodeURIComponent(trackingCode)}`);

    if (!response.ok) {
      setTrackingError('Tracking code not found. Try DT-SAMPLE01.');
      setTrackingResult(null);
      return;
    }

    const data = (await response.json()) as TrackingResponse;
    setTrackingResult(data);
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
      setQuoteError('Quote request could not be processed.');
      setQuote(null);
      return;
    }

    const data = (await response.json()) as QuoteResponse;
    setQuote(data);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" color="primary">MinanTrack</Typography>
          <Typography variant="h3" component="h1" fontWeight={700}>
            Track parcels with clarity.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            A simple shipment visibility platform for cross-border parcel flow and logistics operations.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleTrackSubmit}>
                <Typography variant="h6">Track a parcel</Typography>
                <TextField
                  label="Tracking code"
                  value={trackingCode}
                  onChange={(event) => setTrackingCode(event.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large">
                  Check shipment
                </Button>
                {trackingError ? (
                  <Typography color="error.main">{trackingError}</Typography>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} component="form" onSubmit={handleQuoteSubmit}>
                <Typography variant="h6">Shipping estimate</Typography>
                <TextField
                  label="Destination"
                  value={quoteForm.destination}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, destination: event.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={quoteForm.weightKg}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, weightKg: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label="Service level"
                  value={quoteForm.serviceLevel}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, serviceLevel: event.target.value }))}
                  fullWidth
                >
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Priority">Priority</MenuItem>
                  <MenuItem value="Express">Express</MenuItem>
                </TextField>
                <Button type="submit" variant="outlined" size="large">
                  Get quote
                </Button>
                {quoteError ? <Typography color="error.main">{quoteError}</Typography> : null}
                {quote ? (
                  <Box sx={{ bgcolor: 'rgba(25,118,210,0.06)', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: quote.currency }).format(quote.estimatedCost)}
                    </Typography>
                    <Typography color="text.secondary">
                      {quote.estimatedDeliveryDays} day delivery • {quote.serviceLevel}
                    </Typography>
                  </Box>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {trackingResult ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" color="primary">Tracking details</Typography>
                  <Typography variant="h5">{trackingResult.trackingCode}</Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="h6">{trackingResult.status}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Current location</Typography>
                    <Typography variant="h6">{trackingResult.currentLocation}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Last updated</Typography>
                    <Typography variant="h6">
                      {new Date(trackingResult.lastUpdated).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  {trackingResult.timeline.map((item, index) => (
                    <Box key={`${item.status}-${index}`} sx={{ borderLeft: '3px solid #1976d2', pl: 2 }}>
                      <Typography fontWeight={600}>{item.status}</Typography>
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
              <Typography variant="h6">Visibility</Typography>
              <Typography color="text.secondary">Clear parcel milestones and delivery progress.</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">Operational control</Typography>
              <Typography color="text.secondary">Track routes, exceptions, and delivery coordination.</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
