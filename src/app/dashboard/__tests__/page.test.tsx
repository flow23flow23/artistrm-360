import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/context/auth-context';
import { Layout } from '@/components/layout/Layout';

// Mock de componentes de layout
jest.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Mock de hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { displayName: 'Test User' },
    loading: false
  })
}));

import DashboardPage from '@/app/dashboard/page';

describe('Dashboard Page', () => {
  it('renderiza correctamente', () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    expect(screen.getByText(/Proyectos Activos/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximos Eventos/i)).toBeInTheDocument();
  });
});
