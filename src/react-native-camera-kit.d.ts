declare module 'react-native-camera-kit' {
  import React from 'react';
  import { ViewProps } from 'react-native';

  export enum CameraType {
    Back = 'back',
    Front = 'front',
  }
  export type TorchMode = 'on' | 'off';

  export interface CameraProps extends ViewProps {
    cameraType?: CameraType | 'back' | 'front';
    torchMode?: TorchMode;
    scanBarcode?: boolean;
    showFrame?: boolean;
    laserColor?: string;
    frameColor?: string;
    surfaceColor?: string;
    onReadCode?: (event: { nativeEvent: { codeStringValue: string } }) => void;
  }

  export class Camera extends React.Component<CameraProps> {}
}
