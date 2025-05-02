import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Import the original PAGES array from Navbar to avoid mocking Array
const originalPagesArray = [
    { label: 'Home', destination: '/' },
    { label: 'People', destination: '/people' },
    { label: 'Dashboard', destination: '/dashboard' },
    { label: 'Submission', destination: '/submission' },
    { label: 'Masthead', destination: '/masthead' },
];

describe('Navbar component', () => {
    test('renders all navigation links', () => {
        render(
            <MemoryRouter>
                <Navbar isAuthenticated={true} />
            </MemoryRouter>
        );

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('People')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Submission')).toBeInTheDocument();
        expect(screen.getByText('Masthead')).toBeInTheDocument();
    });

    test('links have correct destinations', () => {
        render(
            <MemoryRouter>
                <Navbar isAuthenticated={true} />
            </MemoryRouter>
        );

        expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
        expect(screen.getByText('People').closest('a')).toHaveAttribute('href', '/people');
        expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
        expect(screen.getByText('Submission').closest('a')).toHaveAttribute('href', '/submission');
        expect(screen.getByText('Masthead').closest('a')).toHaveAttribute('href', '/masthead');
    });

    test('login filtering behavior works as expected', () => {
        // First, spy on the original PAGES constant without modifying it
        const originalModule = jest.requireActual('./Navbar');
        
        // Instead of trying to mock Array, we test the behavior indirectly
        render(
            <MemoryRouter>
                <Navbar isAuthenticated={true} />
            </MemoryRouter>
        );

        // Login shouldn't be in the document if filtered properly
        const loginLink = screen.queryByText('Login');
        expect(loginLink).not.toBeInTheDocument();
        
        // All expected links should be present
        originalPagesArray.forEach(page => {
            expect(screen.getByText(page.label)).toBeInTheDocument();
        });
    });
});
