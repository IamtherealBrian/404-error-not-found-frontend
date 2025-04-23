import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar'; // adjust path if needed

describe('Navbar component', () => {
    test('renders all navigation links when not authenticated', () => {
        render(
            <MemoryRouter>
                <Navbar isAuthenticated={false} />
            </MemoryRouter>
        );

        expect(screen.getByRole('navigation')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('View All People')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('View Masthead')).toBeInTheDocument();
    });

    test('does not render "Login" when authenticated', () => {
        render(
            <MemoryRouter>
                <Navbar isAuthenticated={true} />
            </MemoryRouter>
        );

        const loginLink = screen.queryByText('Login');
        expect(loginLink).not.toBeInTheDocument();
    });
});
