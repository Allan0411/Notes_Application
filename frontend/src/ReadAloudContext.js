// src/ReadAloudContext.js
import React, { createContext, useState, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export const ReadAloudContext = createContext();

export const ReadAloudProvider = ({ children }) => {
  const [voiceSpeed, setVoiceSpeed] = useState(1.0); // default 1x
  const [voiceType, setVoiceType] = useState('female'); // default female

  const speak = useCallback((text) => {
    if (!text) return;

    // Normalize speed depending on platform
    let adjustedRate = voiceSpeed;
    if (Platform.OS === 'ios') {
      // iOS normal is around 0.5
      adjustedRate = voiceSpeed * 0.5;
    }

    Speech.speak(text, {
      rate: adjustedRate,
      pitch: 1.0,
    });
  }, [voiceSpeed]); // <--- This is the key change

  const stop = () => {
    Speech.stop();
  };

  return (
    <ReadAloudContext.Provider
      value={{
        voiceSpeed,
        setVoiceSpeed,
        voiceType,
        setVoiceType,
        speak,
        stop,
      }}
    >
      {children}
    </ReadAloudContext.Provider>
  );
};