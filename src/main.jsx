import React from 'react';
import { createRoot } from 'react-dom/client';
import StudioEntry from './StudioEntry.jsx';
import './styles.css';
import './cinematic.css';
import './studio-brand.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><StudioEntry /></React.StrictMode>);
