import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import ImagePath from '../../../units/ImagePath';
import CommonBtn from '../../../components/CommonBtn';
import CommonInput from '../../../components/CommonInput';
import KeyboardAvoidingWrapper from '../../../components/KeyboardAvoidingWrapper';

interface EmailScreenProps {
  onBack?: () => void;
  onSendLink?: (email: string) => void;
}

const EmailScreen: React.FC<EmailScreenProps> = ({ onBack, onSendLink }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleSendLink = () => {
    onSendLink?.(email);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Header with Orange Round Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        {/* Illustration from ImagePath (cuate.png) */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={ImagePath.cuate}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Heading and Subtitle */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Continue with email</Text>
          <Text style={styles.subtitle}>
            We'll email you a sign-in link. No password needed.
          </Text>
        </View>

        {/* Input & Action Button Section */}
        <View style={styles.formSection}>
          <CommonInput
            value={email}
            onChangeText={setEmail}
            placeholder="priya.sharma@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            activeBackgroundColor={Colors.cardBackground}
            inactiveBackgroundColor="transparent"
            activeBorderColor={Colors.inputActiveBorder}
            inactiveBorderColor={Colors.border}
            textColor={Colors.text}
            placeholderTextColor={Colors.textSecondary}
            inputContainerStyle={styles.inputContainerCustom}
          />

          {/* Send sign-in link Button */}
          <CommonBtn
            title="Send sign-in link"
            onPress={handleSendLink}
            backgroundColor={Colors.primary}
            textColor="#FFFFFF"
            height={56}
            borderRadius={28}
            marginTop={20}
            fontSize={RFValue(14)}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  illustrationWrapper: {
    width: '100%',
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: RFValue(21),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: RFValue(13),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: RFValue(18),
  },
  formSection: {
    width: '100%',
    marginTop: 'auto',
  },
  inputContainerCustom: {
    height: 56,
    borderRadius: 28,
  },
});
