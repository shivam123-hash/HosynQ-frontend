import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

export interface DataRequestsScreenProps {
  onBack?: () => void;
  onExportData?: () => void;
  onCorrectData?: () => void;
  onEraseData?: () => void;
  onRequestDetail?: (requestId: string) => void;
}

export const DataRequestsScreen: React.FC<DataRequestsScreenProps> = ({
  onBack,
  onExportData,
  onCorrectData,
  onEraseData,
  onRequestDetail,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Data requests</Text>

        <View style={styles.topBarRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerSubtitle}>
          Ask for a copy of your data, fix something that’s wrong, or ask us to
          erase it.
        </Text>

        {/* Action Options Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={onExportData}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Export my data"
          >
            <View style={[styles.iconBox, { borderColor: '#4ECDC4' }]}>
              <Feather name="download" size={18} color="#4ECDC4" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Export my data</Text>
              <Text style={styles.actionSubtitle}>
                Get a copy of everything you’ve added
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={onCorrectData}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Correct my data"
          >
            <View style={[styles.iconBox, { borderColor: '#5B9BF1' }]}>
              <Feather name="edit-3" size={18} color="#5B9BF1" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Correct my data</Text>
              <Text style={styles.actionSubtitle}>Tell us what’s wrong</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={onEraseData}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Erase my data"
          >
            <View style={[styles.iconBox, { borderColor: '#FF5A5A' }]}>
              <Feather name="trash-2" size={18} color="#FF5A5A" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: '#FF5A5A' }]}>
                Erase my data
              </Text>
              <Text style={styles.actionSubtitle}>
                Delete some data, or your whole account
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" />
          </TouchableOpacity>
        </View>

        {/* Section: YOUR REQUESTS */}
        <Text style={styles.sectionHeading}>YOUR REQUESTS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.requestRow}
            onPress={() => onRequestDetail?.('DR-20261102-0042')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Export my data, in progress"
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="download" size={18} color="#8A97AB" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Export my data</Text>
              <Text style={styles.actionSubtitle}>Requested Mon, 2 Nov</Text>
            </View>
            <View style={styles.badgeInProgress}>
              <Text style={styles.badgeInProgressText}>In progress</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.requestRow}
            onPress={() => onRequestDetail?.('DR-20260914-0019')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Correct date of birth, done"
          >
            <View style={[styles.iconBox, { borderColor: '#354154' }]}>
              <Feather name="edit-3" size={18} color="#8A97AB" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Correct date of birth</Text>
              <Text style={styles.actionSubtitle}>
                Requested 14 Sep · Done 15 Sep
              </Text>
            </View>
            <View style={styles.badgeDone}>
              <Text style={styles.badgeDoneText}>Done</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#5D6C83" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          We reply to every request within [30] days.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1A2F',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#233348',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topBarRightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A97AB',
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8A97AB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F3352',
    marginLeft: 72,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  badgeInProgress: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F7C08E',
    backgroundColor: 'transparent',
  },
  badgeInProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F7C08E',
  },
  badgeDone: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6FD9A6',
    backgroundColor: 'transparent',
  },
  badgeDoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6FD9A6',
  },
  footerText: {
    fontSize: 13,
    color: '#8A97AB',
    textAlign: 'center',
    marginTop: 8,
  },
});
