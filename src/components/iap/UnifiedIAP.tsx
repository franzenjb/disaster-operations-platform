import React, { useState } from 'react';
import { IAPFull } from './IAPFull';
import { IAPEnhanced } from './IAPEnhanced';
import { IAPWithEditMode } from './IAPWithEditMode';

export function UnifiedIAP({ operationId }: { operationId: string }) {
  // Use the IAP with edit/view mode toggle like ICS Form 215
  return <IAPWithEditMode />;
}