import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import StudioEntry from './StudioEntry.jsx';
import './styles.css';
import './cinematic.css';
import './studio-brand.css';
import './visual-system.css';

const root = document.getElementById('root');
const app = <React.StrictMode><StudioEntry /></React.StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
