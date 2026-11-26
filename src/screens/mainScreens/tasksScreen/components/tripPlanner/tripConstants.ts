import { BookingKind } from '../../../../../services/tripServices';
import { UiBookingType } from './types';

export const BOOKING_KIND_OPTIONS: Array<{
  kind: BookingKind;
  uiType: UiBookingType;
  label: string;
}> = [
  { kind: 'TRAIN', uiType: 'train', label: 'Train' },
  { kind: 'FLIGHT', uiType: 'flight', label: 'Flight' },
  { kind: 'BUS', uiType: 'bus', label: 'Bus' },
  { kind: 'CAB', uiType: 'cab', label: 'Cab' },
  { kind: 'HOTEL', uiType: 'hotel', label: 'Hotel' },
  { kind: 'DOCUMENT', uiType: 'document', label: 'Document' },
  { kind: 'OTHER', uiType: 'other', label: 'Other' },
];
