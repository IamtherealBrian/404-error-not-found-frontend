import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Texts from './Texts';

// Mock axios to prevent actual API calls during tests
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({}))
}));

describe('Texts component', () => {
    test('renders correctly and shows form when Add Text button is clicked', async () => {
        // Render the component
        render(<Texts />);
        
        // Check initial rendering
        expect(screen.getByRole('heading', { name: /view all texts/i })).toBeInTheDocument();
        
        // Find the Add Text button by its exact text
        const addButton = screen.getByRole('button', { name: /add text/i });
        expect(addButton).toBeInTheDocument();
        
        // No form should be visible initially
        expect(screen.queryByLabelText(/key/i)).not.toBeInTheDocument();
        
        // Click the Add Text button
        await userEvent.click(addButton);
        
        // Now the form should be visible
        // Wait for the form elements to appear
        const keyInput = await screen.findByLabelText(/key/i);
        expect(keyInput).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/text/i)).toBeInTheDocument();
        
        // Verify buttons in the form
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(cancelButton).toBeInTheDocument();
        expect(submitButton).toBeInTheDocument();
    });
}); 