/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { inject, injectable } from 'inversify';
import type { HttpStart } from '@kbn/core/public';
import { CoreStart } from '@kbn/core-di-browser';
import type { GetRuleExecutionsResponse, RuleExecutionOutcome } from '@kbn/alerting-v2-schemas';
import { ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH } from '../constants';

export type { GetRuleExecutionsResponse };

export interface GetRuleExecutionsParams {
  ruleIds?: string[];
  outcome?: RuleExecutionOutcome[];
  from?: string;
  to?: string;
  sort?: 'startedAt' | 'duration';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

@injectable()
export class RuleExecutionHistoryApi {
  constructor(@inject(CoreStart('http')) private readonly http: HttpStart) {}

  public async getRuleExecutions(params: GetRuleExecutionsParams = {}) {
    return this.http.get<GetRuleExecutionsResponse>(ALERTING_V2_EXECUTION_HISTORY_RULES_API_PATH, {
      query: {
        ruleIds: params.ruleIds,
        outcome: params.outcome,
        from: params.from,
        to: params.to,
        sort: params.sort,
        sortOrder: params.sortOrder,
        page: params.page,
        perPage: params.perPage,
      },
    });
  }
}
