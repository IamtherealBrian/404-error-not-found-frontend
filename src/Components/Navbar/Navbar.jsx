import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PAGES = [
    { label: 'Home', destination: '/' },
    { label: 'View All People', destination: '/people' },
    { label: 'Dashboard', destination: '/submissions' },
    { label: 'View Masthead', destination: '/masthead' },
];

function NavLink({ page }) {
    const { label, destination } = page;
    return (
        <li>
            <Link to={destination}>{label}</Link>
        </li>
    );
}

NavLink.propTypes = {
    page: PropTypes.shape({
        label: PropTypes.string.isRequired,
        destination: PropTypes.string.isRequired,
    }).isRequired,
};

function Navbar({ isAuthenticated }) {
    return (
        <nav>
            <ul className="nav-list">
                {PAGES.filter(page => !(isAuthenticated && page.label === "Login"))
                    .map((page) => (
                        <NavLink key={page.destination} page={page} />
                    ))}
            </ul>
        </nav>
    );
}

Navbar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
};

export default Navbar;
