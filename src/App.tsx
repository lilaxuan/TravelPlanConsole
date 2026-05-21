import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { TripWizardPage } from '@/features/trip/pages/TripWizardPage';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { ConfirmSignUpPage } from '@/features/auth/pages/ConfirmSignUpPage';
import { AccountPage } from '@/features/auth/pages/AccountPage';
import { RequireAuth } from '@/auth/RequireAuth';

export default function App(): React.ReactElement {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TripWizardPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/confirm" element={<ConfirmSignUpPage />} />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
