/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@kbn/react-query';
import { useService } from '@kbn/core-di-browser';
import { RuleExecutionHistoryApi } from '../services/rule_execution_history_api';
import { ruleExecutionKeys } from './query_key_factory';
import { useFetchRuleExecutions } from './use_fetch_rule_executions';

jest.mock('@kbn/core-di-browser');

const mockUseService = useService as jest.MockedFunction<typeof useService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFetchRuleExecutions', () => {
  const mockGetRuleExecutions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseService.mockImplementation((service: unknown) => {
      if (service === RuleExecutionHistoryApi) {
        return { getRuleExecutions: mockGetRuleExecutions } as any;
      }
      return undefined as any;
    });
  });

  it('calls getRuleExecutions with the provided params', async () => {
    mockGetRuleExecutions.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      perPage: 50,
    });

    renderHook(() => useFetchRuleExecutions({ page: 2, perPage: 50, outcome: ['failure'] }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGetRuleExecutions).toHaveBeenCalledWith({
        page: 2,
        perPage: 50,
        outcome: ['failure'],
      });
    });
  });

  it('returns data from the API on success', async () => {
    const fakeResponse = {
      items: [{ id: 'exec-1', startedAt: '2026-05-05T10:00:00Z' }],
      total: 1,
      page: 1,
      perPage: 10,
    };
    mockGetRuleExecutions.mockResolvedValue(fakeResponse);

    const { result } = renderHook(() => useFetchRuleExecutions({ page: 1, perPage: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(fakeResponse);
  });

  it('exposes isError and the error when the API rejects', async () => {
    const error = new Error('boom');
    mockGetRuleExecutions.mockRejectedValue(error);

    const { result } = renderHook(() => useFetchRuleExecutions({ page: 1, perPage: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });

  it('uses a query key derived from page, perPage and outcome', async () => {
    mockGetRuleExecutions.mockResolvedValue({
      items: [],
      total: 0,
      page: 3,
      perPage: 50,
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    renderHook(() => useFetchRuleExecutions({ page: 3, perPage: 50 }), { wrapper });

    await waitFor(() => expect(mockGetRuleExecutions).toHaveBeenCalled());
    expect(queryClient.getQueryData(ruleExecutionKeys.list({ page: 3, perPage: 50 }))).toEqual({
      items: [],
      total: 0,
      page: 3,
      perPage: 50,
    });
  });

  it('refetches when page or perPage change', async () => {
    mockGetRuleExecutions.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
    });

    const { rerender } = renderHook(
      ({ page, perPage }) => useFetchRuleExecutions({ page, perPage }),
      { wrapper: createWrapper(), initialProps: { page: 1, perPage: 10 } }
    );
    await waitFor(() => expect(mockGetRuleExecutions).toHaveBeenCalledTimes(1));

    rerender({ page: 2, perPage: 10 });
    await waitFor(() => expect(mockGetRuleExecutions).toHaveBeenCalledTimes(2));
    expect(mockGetRuleExecutions).toHaveBeenLastCalledWith({ page: 2, perPage: 10 });
  });
});
