import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import { act } from 'react';

import Texts from './Texts';

// Mock axios to prevent actual API calls during tests
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({}))
}));

describe('Texts component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('renders correctly and shows form when Add Text button is clicked', async () => {
        // Render the component and wait for initial data fetch to complete
        render(<Texts />);
        
        // Wait for any pending state updates from initial data fetch
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        // Check initial rendering
        expect(screen.getByRole('heading', { name: /view all texts/i })).toBeInTheDocument();
        
        // Find the Add Text button by its exact text
        const addButton = screen.getByRole('button', { name: /add text/i });
        expect(addButton).toBeInTheDocument();
        
        // No form should be visible initially
        expect(screen.queryByLabelText(/key/i)).not.toBeInTheDocument();
        
        // Click the Add Text button
        await act(async () => {
            await userEvent.click(addButton);
        });
        
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
    
    test('form disappears when Cancel button is clicked', async () => {
        // Render the component
        render(<Texts />);
        
        // Wait for any pending state updates
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        // Click the Add Text button to show the form
        await act(async () => {
            await userEvent.click(screen.getByRole('button', { name: /add text/i }));
        });
        
        // Wait for the form elements to appear
        const keyInput = await screen.findByLabelText(/key/i);
        expect(keyInput).toBeInTheDocument();
        
        // Click the Cancel button
        await act(async () => {
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            await userEvent.click(cancelButton);
        });
        
        // Verify form is no longer visible
        await waitFor(() => {
            expect(screen.queryByLabelText(/key/i)).not.toBeInTheDocument();
        });
    });
    
    test('calls axios.get to fetch texts when component mounts', async () => {
        // Render the component
        render(<Texts />);
        
        // Verify axios.get was called
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
        
        // Verify it was called with the correct endpoint
        const mockAxios = axios.get;
        expect(mockAxios.mock.calls[0][0]).toContain('/text');
    });
}); 