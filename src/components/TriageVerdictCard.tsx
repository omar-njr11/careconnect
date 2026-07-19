import React from 'react';

interface VerdictCardProps {
  verdict: 'monitor' | 'call_nurse' | 'er';
  explanationKey: string;
}

const verdictConfig = {
  monitor: {
    color: 'bg-green-100 border-green-500 text-green-800',
    title: '🟢 Monitor at home',
    action: 'Log it in the Care Log'
  },
  call_nurse: {
    color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    title: '🟡 Message your nurse',
    action: 'Open Message Thread'
  },
  er: {
    color: 'bg-red-100 border-red-500 text-red-800',
    title: '🔴 Go to the ER',
    action: 'Call Emergency Services (112)'
  }
};

export default function TriageVerdictCard({ verdict, explanationKey }: VerdictCardProps) {
  const config = verdictConfig[verdict];
  
  return (
    <div className={`p-6 rounded-lg border-2 ${config.color} text-center shadow-sm`}>
      <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
      <p className="text-sm mb-6 italic">
        [NEEDS CLINICAL REVIEW] - {explanationKey}
      </p>
      <button className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow w-full text-lg">
        {config.action}
      </button>
      <p className="text-xs mt-4 text-gray-600">
        This is decision support, not a diagnosis. It does not replace emergency services.
      </p>
    </div>
  );
}