export type Verdict = 'monitor' | 'call_nurse' | 'er';

export interface TriagedAnswers {
  [questionId: string]: string | string[];
}

export interface VerdictObject {
  verdict: Verdict;
  symptom_category_id: string;
  triggered_rule_id: string | null;
  explanation_key: string;
  tree_version: string;
}

export interface TriageTree {
  symptom_category_id: string;
  display_name: string;
  version: string;
  entry_questions: any[];
  red_flags: any[];
  verdict_default_if_unmatched: Verdict;
}

/**
 * Evaluates a decision tree based on user answers.
 * Pure function, no network calls.
 */
export function evaluateTree(
  tree: TriageTree,
  answers: TriagedAnswers
): VerdictObject {
  // 1. Check Red Flags first (highest priority)
  for (const flag of tree.red_flags) {
    if (evaluateCondition(flag.condition, answers)) {
      return {
        verdict: flag.verdict,
        symptom_category_id: tree.symptom_category_id,
        triggered_rule_id: flag.id,
        explanation_key: flag.reason_code,
        tree_version: tree.version,
      };
    }
  }

  // 2. Traverse decision tree
  let currentNodeId = tree.entry_questions[0]?.id;
  const visited = new Set<string>();

  while (currentNodeId) {
    if (visited.has(currentNodeId)) break; // Prevent infinite loops
    visited.add(currentNodeId);

    const node = findNodeInTree(tree, currentNodeId);
    if (!node) break;

    const userAnswer = answers[currentNodeId];

    // If answer is missing, default to cautious fallback
    if (userAnswer === undefined || userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      return getDefaultVerdict(tree);
    }

    if (node.type === 'single_select' && node.options) {
      const next = node.options.find((opt: any) => opt.value === userAnswer);
      if (next) {
        if (next.verdict) {
          return {
            verdict: next.verdict,
            symptom_category_id: tree.symptom_category_id,
            triggered_rule_id: `end_${currentNodeId}_${next.value}`,
            explanation_key: next.explanation_key || 'default_explanation',
            tree_version: tree.version,
          };
        }
        currentNodeId = next.next;
      } else {
        return getDefaultVerdict(tree);
      }
    } else if (node.type === 'multi_select' && node.rules) {
      // Handle multi-select logic based on array combinations
      const ansArray = userAnswer as string[];
      for (const rule of node.rules) {
        if (matchesMultiSelectRule(rule, ansArray)) {
          return {
            verdict: rule.verdict,
            symptom_category_id: tree.symptom_category_id,
            triggered_rule_id: `multi_${currentNodeId}_${rule.id}`,
            explanation_key: rule.explanation_key,
            tree_version: tree.version,
          };
        }
      }
      return getDefaultVerdict(tree);
    } else {
      break;
    }
  }

  // 3. Default fallback
  return getDefaultVerdict(tree);
}

function getDefaultVerdict(tree: TriageTree): VerdictObject {
  return {
    verdict: tree.verdict_default_if_unmatched,
    symptom_category_id: tree.symptom_category_id,
    triggered_rule_id: 'default_unmatched',
    explanation_key: 'default_caution_explanation',
    tree_version: tree.version,
  };
}

function evaluateCondition(condition: string, answers: TriagedAnswers): boolean {
  // Basic safe eval for simple conditions like "q2_alertness == 'yes'"
  try {
    const match = condition.match(/(\w+)\s*==\s*'(\w+)'/);
    if (match) {
      const [, key, val] = match;
      return answers[key] === val;
    }
    return false;
  } catch {
    return false;
  }
}

function findNodeInTree(tree: TriageTree, nodeId: string): any | null {
  // In a flat array structure, we might need to search. 
  // Assuming entry_questions contains nested nodes or we have a flat map.
  // For this MVP, we assume questions are structured sequentially or via a flat lookup.
  // Let's implement a recursive search for flexibility.
  function search(nodes: any[]): any | null {
    for (const n of nodes) {
      if (n.id === nodeId) return n;
      if (n.options) {
        const found = search(n.options);
        if (found) return found;
      }
      if (n.branches) {
        const found = search(n.branches);
        if (found) return found;
      }
    }
    return null;
  }
  return search(tree.entry_questions);
}

function matchesMultiSelectRule(rule: any, answers: string[]): boolean {
  if (rule.requires_all) {
    return rule.requires_all.every((v: string) => answers.includes(v));
  }
  if (rule.requires_any) {
    return rule.requires_any.some((v: string) => answers.includes(v));
  }
  if (rule.requires_none) {
    return !rule.requires_none.some((v: string) => answers.includes(v));
  }
  return false;
}