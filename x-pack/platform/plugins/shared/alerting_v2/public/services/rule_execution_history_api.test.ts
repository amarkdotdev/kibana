/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { HttpStart } from '@kbn/core/public';
import { ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH } from '../constants';
import { RuleExecutionHistoryApi } from './rule_execution_history_api';

describe('RuleExecutionHistoryApi', () => {
  const buildApi = () => {
    const http = {
      get: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, perPage: 20 }),
    };
    const api = new RuleExecutionHistoryApi(http as unknown as HttpStart);
    return { api, http };
  };

  it('GETs the rule execution history endpoint', async () => {
    const { api, http } = buildApi();

    await api.getRuleExecutions();

    expect(http.get).toHaveBeenCalledWith(
      ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH,
      expect.any(Object)
    );
  });

  it('forwards all query params explicitly', async () => {
    const { api, http } = buildApi();

    await api.getRuleExecutions({
      ruleIds: ['r1', 'r2'],
      outcome: ['failure'],
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-02T00:00:00Z',
      sort: 'duration',
      sortOrder: 'asc',
      page: 3,
      perPage: 50,
    });

    expect(http.get).toHaveBeenCalledWith(ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH, {
      query: {
        ruleIds: ['r1', 'r2'],
        outcome: ['failure'],
        from: '2026-01-01T00:00:00Z',
        to: '2026-01-02T00:00:00Z',
        sort: 'duration',
        sortOrder: 'asc',
        page: 3,
        perPage: 50,
      },
    });
  });

  it('passes undefined query params when not provided', async () => {
    const { api, http } = buildApi();

    await api.getRuleExecutions();

    expect(http.get).toHaveBeenCalledWith(ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH, {
      query: {
        ruleIds: undefined,
        outcome: undefined,
        from: undefined,
        to: undefined,
        sort: undefined,
        sortOrder: undefined,
        page: undefined,
        perPage: undefined,
      },
    });
  });

  it('returns the response from http.get', async () => {
    const { api, http } = buildApi();
    const fakeResponse = {
      items: [{ id: 'exec-1', startedAt: '2026-05-05T10:00:00Z' }],
      total: 1,
      page: 1,
      perPage: 20,
    };
    http.get.mockResolvedValueOnce(fakeResponse);

    await expect(api.getRuleExecutions({ page: 1, perPage: 20 })).resolves.toEqual(fakeResponse);
  });

  it('propagates errors from http.get', async () => {
    const { api, http } = buildApi();
    http.get.mockRejectedValueOnce(new Error('boom'));

    await expect(api.getRuleExecutions()).rejects.toThrow('boom');
  });
});
