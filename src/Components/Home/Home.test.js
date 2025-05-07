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

    test('renders Home component and fetches only HomePage text', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                HomePage: { title: 'Home Page', text: 'This is a journal about building API servers.' },
                SubmissionPage: { title: 'Submission Page', text: 'Make sure to include a title, abstract, and authors.' },
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
            // Only the HomePage entry should be displayed
            expect(screen.getByText('Home Page')).toBeInTheDocument();
            expect(screen.getByText('This is a journal about building API servers.')).toBeInTheDocument();
            
            // The SubmissionPage entry should not be displayed
            expect(screen.queryByText('Submission Page')).not.toBeInTheDocument();
            expect(screen.queryByText('Make sure to include a title, abstract, and authors.')).not.toBeInTheDocument();
        });
    });

    test('displays "No homepage content found" when HomePage is not found', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                OtherPage: { title: 'Other Page', text: 'Other content' }
            },
        });

        render(
            <Router>
                <Home isAuthenticated={true} setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('No homepage content found')).toBeInTheDocument();
        });
    });

    test('handles update functionality for HomePage', async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                HomePage: { title: 'Home Page', text: 'This is a journal about building API servers.' }
            },
        });

        render(
            <Router>
                <Home isAuthenticated={true} setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );

        await waitFor(() => {
            expect(screen.getByText('Home Page')).toBeInTheDocument();
        });

        // Click the UPDATE button
        fireEvent.click(screen.getByText('UPDATE'));

        // Check that the update form is displayed with the correct values
        expect(screen.getByDisplayValue('Home Page')).toBeInTheDocument();
        expect(screen.getByDisplayValue('This is a journal about building API servers.')).toBeInTheDocument();

        // Test canceling the update
        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByDisplayValue('Home Page')).not.toBeInTheDocument();
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

    test('logs out user when logout button is clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: {} });

        render(
            <Router>
                <Home isAuthenticated={true} setIsAuthenticated={mockSetIsAuthenticated} />
            </Router>
        );

        fireEvent.click(screen.getByText('Logout'));
        
        expect(mockSetIsAuthenticated).toHaveBeenCalledWith(false);
        expect(localStorage.getItem('username')).toBeNull();
    });
});


test('renders HomePage content without act warnings', async () => {
    axios.get.mockResolvedValueOnce({
        data: {
            HomePage: {
                title: 'Home Page',
                text: 'This is a journal about building API servers.'
            }
        }
    });

    render(
        <Router>
            <Home isAuthenticated={true} setIsAuthenticated={() => {}} />
        </Router>
    );

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
    expect(
        await screen.findByText('This is a journal about building API servers.')
    ).toBeInTheDocument();
});


