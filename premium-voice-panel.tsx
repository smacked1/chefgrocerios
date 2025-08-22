import React from 'react';
import { FeatureAccessWrapper } from './feature-access-wrapper';
import { EnhancedVoicePanel } from './enhanced-voice-panel';
import { VoiceCommandPanel } from './voice-command-panel';

export function PremiumVoicePanel() {
  return (
    <FeatureAccessWrapper
      feature="voice"
      fallbackTitle="Premium Voice Features"
      fallbackDescription="Upgrade to unlock unlimited voice commands and advanced AI cooking assistance"
      usageAmount={1}
    >
      <EnhancedVoicePanel />
    </FeatureAccessWrapper>
  );
}