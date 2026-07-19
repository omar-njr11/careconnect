'use client';

import { useState } from 'react';
import confusionTree from '@/lib/triage/trees/confusion.json';
import { evaluateTree } from '@/lib/triage/engine';
import TriageVerdictCard from '@/components/TriageVerdictCard';

export default function TriagePage() {
  const [step, setStep] = useState<'category' | 'questions' | 'verdict'>('category');
  const [currentNode, setCurrentNode] = useState<any>(confusionTree.entry_questions[0]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [verdict, setVerdict] = useState<any>(null);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentNode.type === 'single_select') {
      const option = currentNode.options.find((o: any) => o.value === answer);
      if (option?.verdict) {
        finishTriage(newAnswers);
      } else if (option?.next) {
        const nextNode = confusionTree.entry_questions.find((n: any) => n.id === option.next);
        setCurrentNode(nextNode);
      }
    } else if (currentNode.type === 'multi_select') {
      finishTriage(newAnswers);
    }
  };

  const finishTriage = (finalAnswers: Record<string, any>) => {
    const result = evaluateTree(confusionTree as any, finalAnswers);
    setVerdict(result);
    setStep('verdict');
  };

  if (step === 'verdict' && verdict) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <TriageVerdictCard verdict={verdict.verdict} explanationKey={verdict.explanation_key} />
      </div>
    );
  }

  if (step === 'category') {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl mb-4">Select a symptom category</h1>
        <div className="grid grid-cols-2 gap-4">
          {['Confusion', 'Fall', 'Breathing', 'Pain', 'Medication', 'Not eating', 'Mood', 'Fever'].map(cat => (
            <button 
              key={cat}
              onClick={() => setStep('questions')}
              className="bg-white border border-slate-200 p-4 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Questions step
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg text-slate-800 mb-6">{currentNode.text}</h2>
      
      {currentNode.type === 'single_select' && currentNode.options.map((opt: any) => (
        <button 
          key={opt.value}
          onClick={() => handleAnswer(currentNode.id, opt.value)}
          className="block w-full bg-white border border-slate-200 p-4 rounded-lg mb-3 text-left hover:bg-indigo-50"
        >
          {opt.value === 'yes' ? 'Yes' : opt.value === 'no' ? 'No' : opt.value}
        </button>
      ))}

      {currentNode.type === 'multi_select' && (
        <MultiSelectHandler 
          options={currentNode.options} 
          onSubmit={(selected: string[]) => handleAnswer(currentNode.id, selected)} 
        />
      )}
    </div>
  );
}

function MultiSelectHandler({ options, onSubmit }: { options: any[], onSubmit: (v: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (val: string) => {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  return (
    <div>
      {options.map(opt => (
        <label key={opt.value} className="flex items-center p-4 bg-white border rounded-lg mb-2">
          <input type="checkbox" className="mr-3 h-5 w-5" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} />
          {opt.value}
        </label>
      ))}
      <button onClick={() => onSubmit(selected)} className="w-full bg-indigo-600 text-white p-4 rounded-lg mt-4">Submit</button>
    </div>
  );
}