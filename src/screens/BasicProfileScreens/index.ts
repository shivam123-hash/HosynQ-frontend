import BasicProfileScreen, {
  BasicProfileScreenProps,
  BasicProfileData,
} from './BasicProfileScreen';
import DeviceSecurityScreen, {
  DeviceSecurityScreenProps,
  SecurityOptionType,
} from './DeviceSecurityScreen';
import NotificationPermissionScreen, {
  NotificationPermissionScreenProps,
} from './NotificationPermissionScreen';

export {
  BasicProfileScreen,
  DeviceSecurityScreen,
  NotificationPermissionScreen,
};

export type {
  BasicProfileScreenProps,
  BasicProfileData,
  DeviceSecurityScreenProps,
  SecurityOptionType,
  NotificationPermissionScreenProps,
};

export * from './components';
export default BasicProfileScreen;
