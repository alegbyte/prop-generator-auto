const STEPS = [
  'Writing your proposal with Gemini AI...',
  'Building PowerPoint slides...',
  'Rendering AI video...',
  'Creating short links...',
];

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
  );
}

export default function GeneratingSteps({ steps }) {
  const currentStep = steps.findIndex((s) => !s);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-navy mb-6 text-center">Generating your proposal…</h2>

      <ol className="space-y-5">
        {STEPS.map((label, i) => {
          const done = steps[i];
          const active = i === currentStep;

          return (
            <li key={i} className="flex items-center gap-4">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold flex-shrink-0
                  ${done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {done ? '✓' : active ? <Spinner /> : i + 1}
              </span>
              <span
                className={`text-sm ${
                  done ? 'text-green-700 line-through' : active ? 'text-navy font-medium' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-gray-400 text-center mt-8">
        This usually takes 30–90 seconds. Please don't close the tab.
      </p>
    </div>
  );
}
