import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';

import People from './People';

// Mock axios
jest.mock('axios');

describe('People component', () => {
    // Setup default axios behavior
    beforeEach(() => {
        // Mock axios.get for roles endpoint
        axios.get.mockImplementation((url) => {
            if (url.includes('/roles')) {
                return Promise.resolve({
                    data: {
                        data: {
                            roles: {
                                ED: 'Editor',
                                AU: 'Author'
                            }
                        }
                    }
                });
            }
            return Promise.resolve({ data: {} });
        });
    });

    test('1) the header and the button exist', () => {
        render(<People />);
        expect(
            screen.getByRole('heading', { name: /view all people/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/add a person/i)).toBeInTheDocument();
    });

    test('2) no textbox before clicking any button', () => {
        render(<People />);
        const textboxes = screen.queryAllByRole('textbox');
        expect(textboxes).toHaveLength(0);
    });

    test('3) textbox appear after clicking the button', async () => {
        render(<People />);
        await userEvent.click(screen.getByText(/add a person/i));
        const textboxes = await screen.findAllByRole('textbox');
        expect(textboxes).toHaveLength(3);
    });

    test('4) select for roles appears after clicking the button', async () => {
        render(<People />);
        await userEvent.click(screen.getByText(/add a person/i));
        
        // Check that the select element exists
        const selectElement = await screen.findByRole('combobox');
        expect(selectElement).toBeInTheDocument();
        
        // Check that the default option exists
        expect(screen.getByText('Select a role')).toBeInTheDocument();
    });
});
