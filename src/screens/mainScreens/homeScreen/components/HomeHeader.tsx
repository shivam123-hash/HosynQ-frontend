import React, { memo } from 'react';
import AppTopBar, { AppTopBarProps } from '../../../../components/AppTopBar';

export interface HomeHeaderProps extends AppTopBarProps {
  userName?: string;
  onNotificationPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  onNotificationPress,
  onNotificationsPress,
  ...rest
}) => {
  return (
    <AppTopBar
      {...rest}
      onNotificationsPress={onNotificationsPress || onNotificationPress}
    />
  );
};

export default memo(HomeHeader);
