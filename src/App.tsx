import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { TripFormPage } from '@/features/trip/pages/TripFormPage';
import { TripResultsPage } from '@/features/trip/pages/TripResultsPage';

export default function App(): React.ReactElement {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TripFormPage />} />
        <Route path="/trips/:tripId" element={<TripResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
