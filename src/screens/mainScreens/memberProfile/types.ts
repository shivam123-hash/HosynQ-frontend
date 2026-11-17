export interface MemberProfileInfo {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  relationship: string;
  age: number;
  gradeAndSchool: string;
  birthDate: string;
  gender: string;
  bloodGroup: string;
  languages: string;
  emergencyContact: {
    name: string;
    phone: string;
    initial: string;
  };
  completionPercent: number;
  sectionsDoneCount: number;
  totalSectionsCount: number;
  nextActionLabel: string;
}

export interface EducationInfo {
  school: string;
  className: string;
  classTeacher: string;
  schoolHours: string;
  gettingThere: string;
  addHolidaysToCalendar: boolean;
  remindFeeDueDates: boolean;
}

export interface ImportantDocumentItem {
  id: string;
  title: string;
  iconType: 'passport' | 'aadhaar' | 'birth' | 'school_id' | 'pan';
  badge?: string;
  subtitle: string;
  isLocked?: boolean;
  isDimmed?: boolean;
}

export interface HealthProfileInfo {
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medicines: string;
  doctor: string;
  healthInsurance: string;
  heightAndWeight: string;
}

export interface VaccineItem {
  id: string;
  name: string;
  status: 'Done' | 'Due' | 'Upcoming';
  subtitle: string;
  certificateAdded?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  schedule: string;
  inCalendar: boolean;
}

export interface InterestsInfo {
  selectedInterests: string[];
  allInterests: string[];
  activities: ActivityItem[];
  favouriteFood: string;
  giftIdeas: string;
}
