import { useState } from 'react';

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors font-medium"
    >
      {copied ? '✓ Copied!' : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2
                 M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function LinkBadge({ href, icon, label, copyText }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">{icon}</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline truncate font-medium"
        >
          {href || label}
        </a>
      </div>
      <CopyButton text={copyText || href} />
    </div>
  );
}

export default function ProposalResult({ result, onReset }) {
  const { proposalText, videoShortLink, pptxShortLink, status } = result;

  const fullCopyText = [
    proposalText,
    '',
    pptxShortLink ? `📎 Slides: ${pptxShortLink}` : '',
    videoShortLink ? `🎥 Video: ${videoShortLink}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-6">
      {/* Proposal Text */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">Your Proposal</h2>
          <CopyButton text={proposalText} label="Copy Proposal" />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposalText}</p>
      </div>

      {/* Short Links */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Your Resources</h2>

        <div className="space-y-3">
          {pptxShortLink && (
            <LinkBadge
              href={pptxShortLink}
              icon="📊"
              label="Download Slides"
              copyText={pptxShortLink}
            />
          )}

          {videoShortLink ? (
            <LinkBadge
              href={videoShortLink}
              icon="🎥"
              label="Watch Video"
              copyText={videoShortLink}
            />
          ) : (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-lg">🎥</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Video is being rendered…</p>
                <p className="text-xs text-amber-600">
                  {status === 'video_processing'
                    ? "HeyGen is still processing your video. Check your HeyGen dashboard for the link when it's ready."
                    : 'Video generation timed out. Your proposal and slides are ready to use.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy Full Proposal with Links */}
      <div className="bg-navy rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold text-sm">Copy Everything</p>
          <p className="text-blue-200 text-xs">Proposal text + slide link + video link</p>
        </div>
        <CopyButton text={fullCopyText} label="Copy Full Proposal with Links" />
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-xl border border-gray-300 text-gray-600
                   hover:bg-gray-100 transition-colors text-sm font-medium"
      >
        Generate Another Proposal
      </button>
    </div>
  );
}
