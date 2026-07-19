import { evaluateTree } from './engine';
import confusionTree from './trees/confusion.json';

describe('Triage Engine - Confusion Tree', () => {
  it('routes to ER if hard to wake up', () => {
    const answers = { q1_onset: 'sudden', q2_alertness: 'yes' };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('er');
    expect(result.triggered_rule_id).toContain('q2_alertness');
  });

  it('routes to ER if fall/head bump is present', () => {
    const answers = {
      q1_onset: 'sudden',
      q2_alertness: 'no',
      q3_conversation: 'no',
      q4_multi: ['fever', 'fall_head'] // Has fall/head
    };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('er');
    expect(result.triggered_rule_id).toBe('multi_q4_multi_rule_fall_head');
  });

  it('routes to CALL_NURSE if fever + new med, no fall', () => {
    const answers = {
      q1_onset: 'sudden',
      q2_alertness: 'no',
      q3_conversation: 'no',
      q4_multi: ['fever', 'new_med']
    };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('call_nurse');
    expect(result.triggered_rule_id).toBe('multi_q4_multi_rule_fever_med');
  });

  it('routes to CALL_NURSE if no specific flags in multi-select', () => {
    const answers = {
      q1_onset: 'sudden',
      q2_alertness: 'no',
      q3_conversation: 'no',
      q4_multi: ['not_eating']
    };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('call_nurse');
    expect(result.triggered_rule_id).toBe('multi_q4_multi_rule_default_caution');
  });

  it('routes to MONITOR if happened before and resolved', () => {
    const answers = {
      q1_onset: 'sudden',
      q2_alertness: 'no',
      q3_conversation: 'yes',
      q5_history: 'yes'
    };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('monitor');
  });

  it('defaults to CALL_NURSE on unmatched path', () => {
    const answers = { q1_onset: 'sudden', q2_alertness: 'no', q3_conversation: 'yes', q5_history: undefined };
    const result = evaluateTree(confusionTree as any, answers);
    expect(result.verdict).toBe('call_nurse');
    expect(result.triggered_rule_id).toBe('default_unmatched');
  });
});