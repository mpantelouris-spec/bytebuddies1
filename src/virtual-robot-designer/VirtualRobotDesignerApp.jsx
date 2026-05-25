import React from 'react';
import AcademyExperience from './components/AcademyExperience.jsx';
import './styles/vrd-theme.css';

/**
 * Virtual Robot Designer — Robotics Academy product UI.
 */
export default function VirtualRobotDesignerApp() {
  return (
    <div className="vrd-app vrd-app--product">
      <AcademyExperience />
    </div>
  );
}
