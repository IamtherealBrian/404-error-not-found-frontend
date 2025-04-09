import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Masthead from './Masthead';
import axios from 'axios'; 

const mockMastheadData = {
  "ed@example.com": {
    name: "Editor Person",
    affiliation: "Editor University",
    roles: "ED"
  },
  "me@example.com": {
    name: "Managing Editor",
    affiliation: "Management School",
    roles: "ME"
  },
  "ce@example.com": {
    name: "Consulting Editor",
    affiliation: "Consulting Institute",
    roles: "CE" 
  },
  "multi@example.com": {
    name: "Multi-Role Person",
    affiliation: "Multiple University",
    roles: "ED,AU"
  }
};

jest.mock('axios');

describe('Masthead Component', () => {
  test('renders editors in correct categories with affiliations', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMastheadData });
    
    render(<Masthead />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Editors')).toBeInTheDocument();
    expect(screen.getByText('Managing Editors')).toBeInTheDocument();
    expect(screen.getByText('Consulting Editors')).toBeInTheDocument();
    
    // Check that editors are displayed in correct categories
    expect(screen.getByText('Editor Person')).toBeInTheDocument();
    expect(screen.getByText('Managing Editor')).toBeInTheDocument();
    expect(screen.getByText('Consulting Editor')).toBeInTheDocument();
    
    // Check that a person with multiple roles appears in the correct category
    expect(screen.getByText('Multi-Role Person')).toBeInTheDocument();
    
    // Check affiliations are displayed correctly
    expect(screen.getByText('Editor University')).toBeInTheDocument();
    expect(screen.getByText('Management School')).toBeInTheDocument();
    expect(screen.getByText('Consulting Institute')).toBeInTheDocument();
  });
}); 