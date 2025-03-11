import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import People from './People';

describe('People component', () => {
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
        expect(textboxes).toHaveLength(4);
    });

});
