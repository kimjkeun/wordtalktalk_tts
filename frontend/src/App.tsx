import { useEffect } from 'react';
import useVocabularyStore from './store/vocabularyStore';
import WordCard from './components/WordCard';

function App() {
  const { loadVocabulary, isLoading, error } = useVocabularyStore();

  useEffect(() => {
    loadVocabulary();
  }, [loadVocabulary]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <WordCard />
    </div>
  );
}

export default App;
