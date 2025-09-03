import React, { useState } from 'react';
import { IAPFull } from './IAPFull';
import { IAPEnhanced } from './IAPEnhanced';

export function UnifiedIAP({ operationId }: { operationId: string }) {
  // Use the enhanced IAP with accordion layout and photo upload features
  return <IAPEnhanced />;
}