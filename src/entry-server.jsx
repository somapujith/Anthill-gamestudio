import React from 'react';
import { renderToString } from 'react-dom/server';
import StudioEntry from './StudioEntry.jsx';

export function render() {
  return renderToString(<React.StrictMode><StudioEntry /></React.StrictMode>);
}
