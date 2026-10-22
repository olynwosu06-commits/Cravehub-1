import React from 'react';
import { useLoader } from '../context/LoaderContext';
import './LoaderOverlay.css';

function LoaderOverlay() {
  const { isLoading } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
    </div>
  );
}

export default LoaderOverlay;   