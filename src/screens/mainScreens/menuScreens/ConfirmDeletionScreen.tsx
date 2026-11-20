import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface ConfirmDeletionScreenProps {
  onBack?: () => void;
  onConfirmDelete?: (code: string) => void;
  onResendCode?: () => void;
  mobileNumber?: string;
  gracePeriodDays?: number;
  initialSeconds?: number;
}

export const ConfirmDeletionScreen: React.FC<ConfirmDeletionScreenProps> = ({
  onBack,
  onConfirmDelete,
  onResendCode,
  mobileNumber = '+91 98••• ••123',
  gracePeriodDays = 30,
  initialSeconds = 24,
}) => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(['4', '8', '2', '1', '', '']);
  const [activeIndex, setActiveIndex] = useState(4);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const inputRefs = useRef<Array<any>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleDigitChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = code.join('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Main Inner Content */}
      <View style={styles.innerContent}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>Confirm deletion</Text>

          <View style={styles.circlePlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Enter the 6-digit code we sent to {mobileNumber}.
          </Text>

          {/* 6 OTP Input Boxes */}
          <View style={styles.otpRow}>
            {code.map((digit, idx) => {
              const isFocused = activeIndex === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.otpBox,
                    isFocused && styles.otpBoxFocused,
                  ]}
                  onPress={() => {
                    setActiveIndex(idx);
                    inputRefs.current[idx]?.focus();
                  }}
                  activeOpacity={0.9}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[idx] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(val) => handleDigitChange(val.slice(-1), idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    onFocus={() => setActiveIndex(idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    selectionColor="#F0913A"
                  />
                  {isFocused && !digit && (
                    <View style={styles.cursor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Resend Code Section */}
          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <Text style={styles.resendTimerText}>
                Resend code in 0:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setSecondsLeft(30);
                  onResendCode?.();
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Resend code"
              >
                <Text style={styles.resendActiveText}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Feather name="alert-circle" size={18} color="#F06A6A" />
            <Text style={styles.warningText}>
              After {gracePeriodDays} days this can’t be undone.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Fixed Bottom Action Container */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onConfirmDelete?.(fullCode)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Delete my account"
        >
          <Text style={styles.deleteButtonText}>Delete my account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  innerContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0B1A2F',
    borderWidth: 1.5,
    borderColor: '#3A4556',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePlaceholder: {
    width: 44,
    height: 44,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A97AB',
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  otpBox: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    backgroundColor: '#122440',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  otpBoxFocused: {
    borderColor: '#F0913A',
  },
  otpInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 22,
    backgroundColor: '#F0913A',
  },
  resendRow: {
    marginTop: 18,
  },
  resendTimerText: {
    fontSize: 14,
    color: '#8A97AB',
  },
  resendActiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0913A',
  },
  warningBanner: {
    backgroundColor: '#22192A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#472A32',
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#E6EBF2',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F3352',
    backgroundColor: '#0B1A2F',
  },
  deleteButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F06A6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
