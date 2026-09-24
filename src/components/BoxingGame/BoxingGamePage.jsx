/**
 * BoxingGamePage — entry point for Studio boxing tab.
 */
import React from 'react';
import BoxingGameContainer from './BoxingGameContainer.jsx';

export default function BoxingGamePage({ robotName = 'STRIKER' }) {
  return <BoxingGameContainer robotName={robotName} />;
}
