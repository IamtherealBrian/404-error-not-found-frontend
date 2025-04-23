import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('axios');

describe('Home Component', () => {
    const mockSetIsAuthenticated = jest.fn();

    beforeEach(() => {
        localStorage.setItem('username', 'testUser');
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders Home component and fetches texts', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                entry1: { title: 'Title 1', text: 'Content 1' },
                entry2: { title: 'Title 2', text: 'Content 2' },
            },
        });

        render(
            <Router>
                <Home isAuthenticated={true} setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );

        expect(screen.getByText(/Login as/i)).toBeInTheDocument();
        expect(screen.getByText(/loading.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Title 1')).toBeInTheDocument();
            expect(screen.getByText('Title 2')).toBeInTheDocument();
        });
    });

    test('opens and closes AddTextForm modal', async () => {
        axios.get.mockResolvedValueOnce({ data: {} });

        render(
            <Router>
                <Home isAuthenticated={true} setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );

        fireEvent.click(screen.getByText('add text'));

        expect(screen.getByLabelText(/Key/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        await waitFor(() => {
            expect(screen.queryByLabelText(/Key/i)).not.toBeInTheDocument();
        });
    });
});
