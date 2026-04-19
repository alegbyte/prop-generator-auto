import { useState } from 'react';

const MIN_CHARS = 50;

export default function JobForm({ onSubmit }) {
  const [text, setText] = useState('');

  const charCount = text.trim().length;
  const isValid = charCount >= MIN_CHARS;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(text.trim());
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-navy mb-2">Generate Your Upwork Proposal</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Paste a job description below. We'll write a tailored proposal, build a slide deck, and
        create a short video — all in under 2 minutes.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="jd" className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          id="jd"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the Upwork job description here..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm leading-relaxed
                     focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent
                     resize-y placeholder-gray-400"
        />

        <div className="flex items-center justify-between mt-2 mb-6">
          <span
            className={`text-xs ${charCount < MIN_CHARS ? 'text-amber-500' : 'text-green-600'}`}
          >
            {charCount} / {MIN_CHARS} characters minimum
          </span>
          {charCount >= MIN_CHARS && (
            <span className="text-xs text-green-600 font-medium">Ready to generate</span>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3 rounded-xl font-semibold text-white bg-navy
                     hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-200 text-sm tracking-wide"
        >
          Generate Proposal
        </button>
      </form>
    </div>
  );
}
