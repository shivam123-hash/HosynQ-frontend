export type CompassScreenMode =
  | 'compass' // CMP-01: Main compass map & member list
  | 'locationPermission' // CMP-02: Permission prompt
  | 'locationConsent' // CMP-03: Sharing settings & consent
  | 'locationOff' // CMP-04: Location disabled state
  | 'memberLocation' // CMP-05: Member detail card & actions
  | 'familyPlaces' // CMP-06: Saved places list
  | 'addEditPlace' // CMP-07: Add / edit place modal
  | 'headingHome' // CMP-08: Heading Home route & ETA
  | 'shareEta' // CMP-09: Share ETA confirmation dialog
  | 'askMemberSharing' // CMP-10: Ask member to turn on sharing
  | 'locationReminders' // CMP-11: Location-based reminders list
  | 'createReminder' // CMP-12: Create location reminder modal
  | 'smartActions'; // CMP-13: Smart actions & shortcuts

export type PlaceType = 'home' | 'school' | 'work' | 'store' | 'activity' | 'other';

export interface CompassMember {
  id: string;
  name: string;
  initial: string;
  bgColor: string;
  textColor?: string;
  locationName: string;
  subLocation: string;
  statusText: string;
  isSharing: boolean;
  isParentControlled?: boolean;
  age?: number;
  roleNote?: string;
  usuallyLeaves?: string;
  homeInMinutes?: number;
  trafficStatus?: string;
  pinType?: PlaceType;
  coords: { x: number; y: number };
  batteryPct?: number;
}

export interface FamilyPlace {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: PlaceType;
  hereMembers?: string[];
  radiusMeters: 100 | 200 | 500;
  coords: { x: number; y: number };
}

export interface LocationReminder {
  id: string;
  title: string;
  condition: 'arrive' | 'leave';
  placeName: string;
  targetMember: string;
  frequency: string;
  completed?: boolean;
  type: PlaceType;
}

export interface SmartShortcut {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
}
