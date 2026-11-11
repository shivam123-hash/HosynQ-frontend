export type AddSheetAction =
  | 'task'
  | 'event'
  | 'reminder'
  | 'list'
  | 'scan'
  | 'upload'
  | 'ask';

export interface ReminderItem {
  id: string;
  title: string;
  type: 'time' | 'place';
  whenText: string;
  assignee: string;
  repeat: string;
}

export interface ScannedItem {
  id: string;
  type: 'EVENT' | 'TASK' | 'REMINDER';
  title: string;
  subtitle: string;
  statusBadge: 'Looks right' | 'Check this' | 'Not sure';
  selected: boolean;
  dateAmbiguous?: boolean;
  chosenDate?: string;
  assignee?: string;
  location?: string;
  timeRange?: string;
}

export interface ProposedAction {
  id: string;
  type: 'EVENT' | 'REMINDER' | 'TASK';
  title: string;
  time: string;
  tag: string;
  people?: string;
}

export interface ToastConfig {
  visible: boolean;
  message: string;
  type?: 'success' | 'cancelled' | 'info';
  onUndo?: () => void;
  onView?: () => void;
}
