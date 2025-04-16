import { render, screen } from '@testing-library/react';
import LoginPage from './Components/Login/LoginPage';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn()
}));

test('renders login form with email and password inputs', () => {
  render(<LoginPage setIsAuthenticated={jest.fn()} />);
  
  // Check for login form elements
  expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
});
