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
});
