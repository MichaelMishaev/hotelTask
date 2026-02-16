import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '../AuthContext';
import { useContext } from 'react';
import type { AuthUser } from '../../types';

function TestComponent() {
  const { user, isAuthenticated, login, logout } = useContext(AuthContext);

  const mockUser: AuthUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Guest',
    token: 'test-token',
  };

  return (
    <div>
      <p data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</p>
      <p data-testid="user-name">{user?.name || 'none'}</p>
      <button onClick={() => login(mockUser)}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts not authenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });

  it('stores user and token after login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
  });

  it('clears user after logout', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');

    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('none');
  });
});
