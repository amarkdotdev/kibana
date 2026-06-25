/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@kbn/i18n-react';
import { ExpandableCell } from './expandable_cell';

const renderCell = (props: React.ComponentProps<typeof ExpandableCell>) =>
  render(
    <I18nProvider>
      <ExpandableCell {...props} />
    </I18nProvider>
  );

describe('ExpandableCell', () => {
  it('renders the text content', () => {
    renderCell({ text: 'Hello world' });

    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders as a plain span when onClick is not provided', () => {
    renderCell({ text: 'Plain text' });

    expect(screen.queryByRole('button', { name: 'Plain text' })).not.toBeInTheDocument();
    expect(screen.getByText('Plain text').tagName).toBe('SPAN');
  });

  it('renders as a clickable button when onClick is provided', () => {
    const onClick = jest.fn();
    renderCell({ text: 'Click me', onClick });

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when the button is clicked', async () => {
    const onClick = jest.fn();
    renderCell({ text: 'Click me', onClick });

    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows the expand button with the correct data-test-subj', () => {
    renderCell({ text: 'Test', 'data-test-subj': 'myCell' });

    expect(screen.getByTestId('myCell-expand')).toBeInTheDocument();
  });

  it('opens the popover with the full text when the expand button is clicked', async () => {
    renderCell({ text: 'Full message content' });

    await userEvent.click(screen.getByLabelText('Expand'));

    const popoverTexts = screen.getAllByText('Full message content');
    expect(popoverTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('shows the "Copy value" button inside the popover', async () => {
    renderCell({ text: 'Copy me' });

    await userEvent.click(screen.getByLabelText('Expand'));

    expect(screen.getByRole('button', { name: /copy value/i })).toBeInTheDocument();
  });

  it('closes the popover when clicking the expand button again', async () => {
    renderCell({ text: 'Toggle test' });
    const expandBtn = screen.getByLabelText('Expand');

    await userEvent.click(expandBtn);
    expect(screen.getByRole('button', { name: /copy value/i })).toBeInTheDocument();

    await userEvent.click(expandBtn);
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /copy value/i })).not.toBeInTheDocument();
    });
  });

  it('passes data-test-subj to the clickable button', () => {
    renderCell({ text: 'Link', onClick: jest.fn(), 'data-test-subj': 'ruleLink' });

    expect(screen.getByTestId('ruleLink')).toBeInTheDocument();
  });
});
