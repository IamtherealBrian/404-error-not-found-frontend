import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PAGES = [
    { label: 'Home', destination: '/' },
    { label: 'View All People', destination: '/people' },
    { label: 'View All Texts', destination: '/texts' },
    { label: 'View All Submissions', destination: '/submissions' },
    { label: 'Login', destination: '/login' },
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
  page: propTypes.shape({
    label: propTypes.string.isRequired,
    destination: propTypes.string.isRequired,
  }).isRequired,
};

function Navbar() {
  return (
      <nav>
        <ul className="nav-list"> {/* <-- This line corrected from wrapper to nav-list */}
          {PAGES.map((page) => (
              <NavLink key={page.destination} page={page} />
          ))}
        </ul>
      </nav>
  );
}

export default Navbar;
