import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Submission from './Submission';
import axios from 'axios';

jest.mock('axios');

describe('<Submission />', () => {
  const mockSubmission = {
    SubmissionPage: {
      key: 'SubmissionPage',
      title: 'Guidelines',
      text: 'Please submit your work here.'
    }
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockSubmission });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays the submission text on load', async () => {
    render(
      <MemoryRouter>
        <Submission isAuthenticated={true} />
      </MemoryRouter>
    );

    // wait for the heading to appear
    const heading = await screen.findByRole('heading', { name: /Guidelines/i });
    expect(heading).toBeInTheDocument();

    // now the paragraph
    expect(
      await screen.findByText(/Please submit your work here\./i)
    ).toBeInTheDocument();

    // and the buttons
    expect(screen.getByRole('button', { name: /DELETE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /UPDATE/i })).toBeInTheDocument();
  });
});
