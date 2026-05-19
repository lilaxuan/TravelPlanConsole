import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { TripWizardPage } from '@/features/trip/pages/TripWizardPage';

export default function App(): React.ReactElement {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TripWizardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
