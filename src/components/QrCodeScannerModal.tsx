import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import { Camera, CameraType, TorchMode } from 'react-native-camera-kit';
import Colors from '../units/Colors';

export interface QrCodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
  title?: string;
  subtitle?: string;
}

const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  visible,
  onClose,
  onScanSuccess,
  title = 'Scan QR code',
  subtitle = 'Point camera at the Family QR code',
}) => {
  const insets = useSafeAreaInsets();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchMode, setTorchMode] = useState<TorchMode>('off');
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (visible) {
      isScanningRef.current = false;
      checkCameraPermission();
    } else {
      setTorchMode('off');
    }
  }, [visible]);

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (granted) {
          setHasPermission(true);
        } else {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'HosynQ needs access to your camera to scan Family QR codes.',
              buttonPositive: 'Allow',
              buttonNegative: 'Cancel',
            }
          );
          setHasPermission(result === PermissionsAndroid.RESULTS.GRANTED);
        }
      } else {
        // iOS permissions
        setHasPermission(true);
      }
    } catch (err) {
      console.warn('[QrCodeScannerModal] Error checking permission:', err);
      setHasPermission(false);
    }
  };

  const handleReadCode = (event: any) => {
    if (isScanningRef.current) return;
    const rawValue = event?.nativeEvent?.codeStringValue;
    if (!rawValue) return;

    isScanningRef.current = true;
    console.log('[QrCodeScannerModal] Successfully scanned code:', rawValue);
    onScanSuccess(rawValue);
  };

  const toggleTorch = () => {
    setTorchMode((prev: string) => (prev === 'on' ? 'off' : 'on'));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" />

        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
          >
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.torchBtn,
              torchMode === 'on' && styles.torchBtnActive,
            ]}
            onPress={toggleTorch}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle torch"
          >
            <Feather
              name={torchMode === 'on' ? 'zap' : 'zap-off'}
              size={20}
              color={torchMode === 'on' ? Colors.primary : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>

        {/* Camera View Area */}
        <View style={styles.cameraContainer}>
          {hasPermission === null ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.statusText}>Requesting camera permission...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.permissionDeniedContainer}>
              <Feather name="camera-off" size={48} color="#EF4444" />
              <Text style={styles.permissionTitle}>Camera Permission Required</Text>
              <Text style={styles.permissionDesc}>
                Please allow camera access in your device settings to scan Family QR codes.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={checkCameraPermission}
                activeOpacity={0.7}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              <Camera
                style={StyleSheet.absoluteFill}
                cameraType={CameraType.Back}
                scanBarcode={true}
                showFrame={false}
                torchMode={torchMode}
                onReadCode={handleReadCode}
              />

              {/* Viewfinder Target Overlay */}
              <View style={styles.viewfinderOverlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddleRow}>
                  <View style={styles.overlaySide} />
                  <View style={styles.targetBox}>
                    {/* Viewfinder Corner Accents */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />

                    {/* Laser scanning line */}
                    <View style={styles.laserLine} />
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                  <Text style={styles.scanInstruction}>
                    Align the Family QR code inside the frame
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default QrCodeScannerModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0F1D',
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12),
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  torchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchBtnActive: {
    backgroundColor: 'rgba(240, 145, 58, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-Medium',
    marginTop: 16,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontFamily: 'Roboto-Bold',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionDesc: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-Regular',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontFamily: 'Roboto-Bold',
  },
  // Viewfinder Overlay
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.65)',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: 260,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 29, 0.65)',
  },
  targetBox: {
    width: 260,
    height: 260,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBottom: {
    flex: 1.3,
    backgroundColor: 'rgba(10, 15, 29, 0.65)',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  // Corner accents
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
});
