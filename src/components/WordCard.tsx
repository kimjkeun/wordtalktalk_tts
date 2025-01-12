import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useVocabularyStore from '../store/vocabularyStore';

const WordCard: React.FC = () => {
  const [showTranslation, setShowTranslation] = useState(false);
  
  const {
    parts,
    currentPart,
    currentWord,
    playbackSettings,
    isPlaying,
    toggleVoice,
    toggleKorean,
    togglePlayback,
    playCurrentWord,
    nextWord,
    previousWord,
  } = useVocabularyStore();

  const currentPartData = parts[currentPart];
  const currentWordData = currentPartData?.words[currentWord];

  const getBasePath = () => {
    return process.env.NODE_ENV === 'production' 
      ? '/wordtalktalk_tts'
      : '';
  };

  const playAudio = async (url: string) => {
    const audio = new Audio(`${getBasePath()}${url}`);
    await audio.play();
  };

  const handlePlayToggle = () => {
    togglePlayback();
    if (!isPlaying) {
      playCurrentWord();
    }
  };

  const playKorean = async () => {
    if (currentWordData.audioFiles.kr) {
      await playAudio(currentWordData.audioFiles.kr);
    }
  };

  if (!currentWordData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-between">
          {currentWordData.word}
          <span className="text-sm font-normal">
            Part {currentPart + 1} - {currentWord + 1}/{currentPartData.words.length}
          </span>
        </h2>
        
        <AnimatePresence>
          {showTranslation && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-lg text-center text-primary"
            >
              {currentWordData.translation}
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Voice Selection */}
        <div className="form-control">
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium">영어 성우:</span>
              {['matt', 'danna', 'clara'].map((voice) => (
                <label key={voice} className="label cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={playbackSettings.selectedVoices.includes(voice)}
                    onChange={() => toggleVoice(voice)}
                  />
                  <span className="label-text ml-2 capitalize">{voice}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium">한국어 포함:</span>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-secondary"
                  checked={playbackSettings.includeKorean}
                  onChange={toggleKorean}
                />
                <span className="label-text ml-2">한국어 음성 포함</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Audio Controls */}
          <div className="flex justify-center gap-2">
            <button
              className="btn btn-primary"
              onClick={playCurrentWord}
            >
              🔊 English
            </button>
            <button
              className="btn btn-secondary"
              onClick={playKorean}
            >
              🔊 한국어
            </button>
          </div>

          {/* Translation Toggle */}
          <button
            className="btn btn-outline"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? '뜻 숨기기' : '뜻 보기'}
          </button>

          {/* Playback Controls */}
          <div className="card-actions justify-between items-center mt-4">
            <button className="btn btn-circle" onClick={previousWord}>
              ←
            </button>
            <button 
              className={`btn ${isPlaying ? 'btn-error' : 'btn-primary'}`}
              onClick={handlePlayToggle}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>
            <button className="btn btn-circle" onClick={nextWord}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
