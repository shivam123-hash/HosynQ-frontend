import React from 'react';
import { SensitiveDataConsentScreen } from './SensitiveDataConsentScreen';

export interface SensitiveDataConsentModalProps {
  visible?: boolean;
  memberName?: string;
  onClose: () => void;
  onAgree: () => void;
  onPrivacyNoticePress?: () => void;
  onNotNow?: () => void;
}

export const SensitiveDataConsentModal: React.FC<SensitiveDataConsentModalProps> = ({
  memberName = 'Aarav',
  onClose,
  onAgree,
  onPrivacyNoticePress,
  onNotNow,
}) => {
  return (
    <SensitiveDataConsentScreen
      memberName={memberName}
      onClose={onClose}
      onAgree={onAgree}
      onPrivacyNoticePress={onPrivacyNoticePress}
      onNotNow={onNotNow}
    />
  );
};

export default SensitiveDataConsentModal;
