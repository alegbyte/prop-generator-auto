import { useState } from 'react';
import JobForm from './components/JobForm';
import GeneratingSteps from './components/GeneratingSteps';
import ProposalResult from './components/ProposalResult';

export default function App() {
  const [phase, setPhase] = useState('idle'); // idle | generating | done | error
  const [steps, setSteps] = useState([false, false, false, false]);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleGenerate(jobDescription) {
    setPhase('generating');
    setSteps([false, false, false, false]);
    setResult(null);
    setErrorMsg('');

    // Simulate step progression while waiting for the real response
    const stepDelay = (ms) => new Promise((r) => setTimeout(r, ms));

    const tickStep = async (index, ms) => {
      await stepDelay(ms);
      setSteps((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    };

    // Start ticking steps optimistically
    const stepTimers = Promise.all([
      tickStep(0, 1000),
      tickStep(1, 4000),
      tickStep(2, 7000),
      tickStep(3, 10000),
    ]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate proposal.');
      }

      // Mark all steps done
      setSteps([true, true, true, true]);
      setResult(data);
      setPhase('done');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  function handleReset() {
    setPhase('idle');
    setResult(null);
    setErrorMsg('');
    setSteps([false, false, false, false]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white py-5 px-6 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight">ProposalAI</span>
          <span className="text-sm text-blue-300 mt-1">Upwork Proposal Generator</span>
        </div>
      </header>

      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {phase === 'idle' && (
            <JobForm onSubmit={handleGenerate} />
          )}

          {phase === 'generating' && (
            <GeneratingSteps steps={steps} />
          )}

          {phase === 'done' && result && (
            <ProposalResult result={result} onReset={handleReset} />
          )}

          {phase === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium mb-4">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Powered by Gemini AI · HeyGen · pptxgenjs
      </footer>
    </div>
  );
}
