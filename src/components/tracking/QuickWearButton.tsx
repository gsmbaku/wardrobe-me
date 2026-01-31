interface QuickWearButtonProps {
  onClick: () => void;
}

export default function QuickWearButton({ onClick }: QuickWearButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center z-30"
      title="Log today's wear"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
