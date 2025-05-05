import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';

jest.mock('axios');

const mockManuscriptsData = {
  a: {
    title: 'Test Title',
    author: 'Alice',
    author_email: 'alice@example.com',
    abstract: 'Abstract text',
    text: 'Full text',
    editor_email: 'ed@example.com',
    state: 'Submitted'
  },
  b: {
    title: 'Another One',
    author: 'Bob',
    author_email: 'bob@example.com',
    abstract: 'Another abstract',
    text: 'More text',
    editor_email: 'ed2@example.com',
    state: 'Referee Review'
  }
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches manuscripts on mount and displays them', async () => {
    axios.get.mockResolvedValueOnce({ data: mockManuscriptsData });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Manuscripts')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Another One')).toBeInTheDocument();
    });

    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
  });

  test('clicking Edit opens the edit form and Cancel closes it', async () => {
    axios.get.mockResolvedValueOnce({ data: mockManuscriptsData });
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => screen.getByText('Test Title'));

    const [firstEditBtn] = screen.getAllByText('Edit');
    fireEvent.click(firstEditBtn);

    // Edit form should appear
    expect(screen.getByLabelText('Title:')).toHaveValue('Test Title');
    expect(screen.getByLabelText('Title:')).toBeDisabled();
    expect(screen.getByLabelText('Author:')).toHaveValue('Alice');
    expect(screen.getByLabelText('Author:')).not.toBeDisabled();

    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'));
    expect(window.confirm).toHaveBeenCalledWith('Discard your changes?');

    await waitFor(() => {
      expect(screen.queryByLabelText('Title:')).toBeNull();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  test('clicking Delete calls API and removes manuscript', async () => {
    axios.get.mockResolvedValueOnce({ data: mockManuscriptsData });
    axios.delete.mockResolvedValueOnce({ status: 200 });
    window.confirm = jest.fn(() => true);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // wait for initial load
    await waitFor(() => screen.getByText('Test Title'));

    // click Delete on "Test Title"
    fireEvent.click(screen.getAllByText('Delete')[0]);

    // confirm prompt was shown
    expect(window.confirm).toHaveBeenCalledWith('Delete "Test Title"?');

    // axios.delete called with correct data
    expect(axios.delete).toHaveBeenCalledWith(
      `${BACKEND_URL}/manuscript/delete`,
      { data: { title: 'Test Title' } }
    );

    // after delete, item no longer in list
    await waitFor(() => {
      expect(screen.queryByText('Test Title')).toBeNull();
    });
  });

  test('displays error message when fetch fails', async () => {
    const err = new Error('Network Error');
    axios.get.mockRejectedValueOnce(err);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Error fetching manuscripts: Network Error/)
      ).toBeInTheDocument();
    });
});


});
