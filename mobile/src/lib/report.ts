import { Alert } from 'react-native';
import type { ReportReason, ReportTargetType } from '@ripple/api-client';
import { rippleClient } from '../api/client';

const REASONS: ReportReason[] = [
  'SPAM',
  'HARASSMENT',
  'NUDITY',
  'HATE_SPEECH',
  'OTHER',
];

export function reportViaAlert(
  targetType: ReportTargetType,
  targetId: string,
  onDone?: () => void,
) {
  Alert.alert(
    'Report',
    'Why are you reporting this?',
    [
      ...REASONS.map((reason) => ({
        text: reason,
        onPress: () => {
          void rippleClient.reports
            .create({ targetType, targetId, reason })
            .then(onDone);
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ],
  );
}
