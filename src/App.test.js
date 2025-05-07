import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
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

test('submits form and calls axios post', async () => {
  const mockSetAuth = jest.fn();
  axios.post.mockResolvedValue({ data: { token: 'fakeToken' } });

  render(<LoginPage setIsAuthenticated={mockSetAuth} />);

  // Fill in form fields
  fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

  // Submit form
  fireEvent.click(screen.getByRole('button', { name: /Login/i }));

  // Wait for axios post to be called
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/login'), // adjust endpoint if needed
      { email: 'test@example.com', password: 'password123' }
    );
  });
});