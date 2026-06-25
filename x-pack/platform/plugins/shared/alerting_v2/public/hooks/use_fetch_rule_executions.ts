/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from '@kbn/react-query';
import { useService } from '@kbn/core-di-browser';
import type { GetRuleExecutionsResponse, RuleExecutionOutcome } from '@kbn/alerting-v2-schemas';
import { RuleExecutionHistoryApi } from '../services/rule_execution_history_api';
import { ruleExecutionKeys } from './query_key_factory';

interface UseFetchRuleExecutionsParams {
  page: number;
  perPage: number;
  outcome?: RuleExecutionOutcome[];
}

export const useFetchRuleExecutions = ({
  page,
  perPage,
  outcome,
}: UseFetchRuleExecutionsParams) => {
  const api = useService(RuleExecutionHistoryApi);

  return useQuery<GetRuleExecutionsResponse, Error>({
    queryKey: ruleExecutionKeys.list({ page, perPage, outcome }),
    queryFn: () => api.getRuleExecutions({ page, perPage, outcome }),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
};
