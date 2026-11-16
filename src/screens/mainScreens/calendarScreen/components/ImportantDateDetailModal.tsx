import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { ImportantDateItem } from '../types';

export interface ImportantDateDetailModalProps {
  visible: boolean;
  item: ImportantDateItem | null;
  onClose: () => void;
  onEditDate?: (item: ImportantDateItem) => void;
  onAddTask?: (item: ImportantDateItem) => void;
}

export const ImportantDateDetailModal: React.FC<ImportantDateDetailModalProps> = ({
  visible,
  item: itemProp,
  onClose,
  onEditDate,
  onAddTask,
}) => {
  const insets = useSafeAreaInsets();
  const [aiSuggestionState, setAiSuggestionState] = useState<
    'pending' | 'confirmed' | 'ignored'
  >('pending');
  const [cachedItem, setCachedItem] = useState<ImportantDateItem | null>(
    itemProp
  );

  React.useEffect(() => {
    if (itemProp) {
      setCachedItem(itemProp);
    }
  }, [itemProp]);

  const item = itemProp || cachedItem;

  if (!item) return null;

  const categoryLabel =
    item.type === 'document'
      ? 'Document expiry'
      : item.type === 'birthday'
      ? 'Birthday'
      : 'Anniversary';

  return (
    <Modal
      visible={visible && Boolean(itemProp)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Top Header (CAL-16) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close important date detail"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Important date</Text>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => {
              Alert.alert('Options', 'Important date options');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={20} color="#CAD4DF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category Pill (CAL-16) */}
          <View style={styles.categoryPill}>
            <View style={styles.categoryDot} />
            <Text style={styles.categoryPillText}>{categoryLabel}</Text>
          </View>

          {/* Title */}
          <Text style={styles.titleText}>{item.title}</Text>

          {/* Hero Countdown Card (CAL-16) */}
          <View style={styles.countdownCard}>
            <View style={styles.countdownLeftCol}>
              <Text style={styles.daysLeftNumber}>
                {String(item.daysLeft)}
              </Text>
              <Text style={styles.daysLeftLabel}>DAYS LEFT</Text>
            </View>

            <View style={styles.countdownDivider} />

            <View style={styles.countdownRightCol}>
              <Text style={styles.countdownDateHeader}>
                {`Monday, ${item.dateFormatted} 2026`}
              </Text>
              <Text style={styles.countdownDesc}>
                Passport renewal can take 3–4 weeks. Start this month.
              </Text>
            </View>
          </View>

          {/* Linked Document Card (CAL-16) */}
          {Boolean(item.documentTitle) && (
            <View style={styles.docCard}>
              <View style={styles.docIconBox}>
                <Feather name="file-text" size={20} color="#F0913A" />
              </View>

              <View style={styles.docTextCol}>
                <Text style={styles.docTitle}>{item.documentTitle}</Text>
                <Text style={styles.docPath}>
                  {item.documentPath || 'Life Profile › Important documents'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Document', `Opening ${item.documentTitle}`);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.openLink}>Open</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Details 3-Row Card (CAL-16) */}
          <View style={styles.detailsCard}>
            {/* Row 1: Person */}
            <View style={styles.cardRow}>
              <View style={styles.rowIconCol}>
                <Feather name="user" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Person</Text>
                <View style={styles.personRow}>
                  <View style={styles.personAvatar}>
                    <Text style={styles.personAvatarText}>
                      {item.personInitial || 'R'}
                    </Text>
                  </View>
                  <Text style={styles.rowValueText}>
                    {item.personName || 'Rohan'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Row 2: Reminders */}
            <View style={[styles.cardRow, styles.cardRowDivider]}>
              <View style={styles.rowIconCol}>
                <Feather name="bell" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Reminders</Text>
                <Text style={styles.rowValueText}>{item.reminders}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>

            {/* Row 3: Who sees it */}
            <View style={[styles.cardRow, styles.cardRowDivider]}>
              <View style={styles.rowIconCol}>
                <Feather name="users" size={18} color="#8A97AB" />
              </View>
              <View style={styles.rowTextCol}>
                <Text style={styles.rowLabel}>Who sees it</Text>
                <View style={styles.whoSeesRow}>
                  <View style={styles.avatarsOverlap}>
                    <View
                      style={[
                        styles.miniAvatar,
                        styles.avatarRohanBg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniAvatarText,
                          styles.avatarRohanColor,
                        ]}
                      >
                        R
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.miniAvatar,
                        styles.miniAvatarOverlap,
                        styles.avatarPriyaBg,
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniAvatarText,
                          styles.avatarPriyaColor,
                        ]}
                      >
                        P
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rowValueText}>
                    {item.whoSeesIt || 'Rohan and you'}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#8A97AB" />
            </View>
          </View>

          {/* AI Suggestion Card (CAL-16) */}
          {Boolean(item.aiSuggestion) && aiSuggestionState === 'pending' && (
            <View style={styles.aiSuggestionCard}>
              <View style={styles.aiTextRow}>
                <Text style={styles.aiSparkle}>✦</Text>
                <Text style={styles.aiSuggestionText}>
                  {` ${item.aiSuggestion}`}
                </Text>
              </View>

              <View style={styles.aiActionsRow}>
                <TouchableOpacity
                  style={styles.aiConfirmBtn}
                  onPress={() => {
                    setAiSuggestionState('confirmed');
                    onAddTask?.(item);
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm add task"
                >
                  <Text style={styles.aiConfirmText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiEditBtn}
                  onPress={() => {
                    Alert.alert(
                      'Edit Task',
                      'Customize renewal appointment task before adding.'
                    );
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Edit task before adding"
                >
                  <Text style={styles.aiEditText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiIgnoreBtn}
                  onPress={() => setAiSuggestionState('ignored')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Ignore task suggestion"
                >
                  <Text style={styles.aiIgnoreText}>Ignore</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {aiSuggestionState === 'confirmed' && (
            <View style={styles.confirmedBanner}>
              <Feather name="check" size={16} color="#2DD4BF" />
              <Text style={styles.confirmedText}>
                Task added to Rohan's tasks list
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions (CAL-16) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.editDateBtn}
            onPress={() => onEditDate?.(item)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Edit date"
          >
            <Text style={styles.editDateBtnText}>Edit date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addRenewalTaskBtn}
            onPress={() => onAddTask?.(item)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add renewal task"
          >
            <Feather
              name="plus"
              size={18}
              color="#FFFFFF"
              style={styles.plusIcon}
            />
            <Text style={styles.addRenewalTaskBtnText}>Add renewal task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ImportantDateDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#F0913A',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0913A',
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 18,
    lineHeight: 30,
  },
  countdownCard: {
    backgroundColor: '#122440',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1F3352',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownLeftCol: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  daysLeftNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#F0913A',
    lineHeight: 44,
  },
  daysLeftLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0913A',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  countdownDivider: {
    width: 1,
    height: 54,
    backgroundColor: '#243A5E',
    marginHorizontal: 16,
  },
  countdownRightCol: {
    flex: 1,
  },
  countdownDateHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countdownDesc: {
    fontSize: 12.5,
    color: '#8A97AB',
    lineHeight: 18,
    marginTop: 4,
  },
  docCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  docIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2E2215',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTextCol: {
    flex: 1,
    marginLeft: 14,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  docPath: {
    fontSize: 12.5,
    color: '#8A97AB',
    marginTop: 3,
  },
  openLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F0913A',
    marginLeft: 12,
  },
  detailsCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  cardRowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  rowIconCol: {
    width: 32,
    alignItems: 'center',
  },
  rowTextCol: {
    flex: 1,
    marginLeft: 8,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8A97AB',
    marginBottom: 4,
  },
  rowValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E3A66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  personAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8DB8F5',
  },
  whoSeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarsOverlap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarOverlap: {
    marginLeft: -6,
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  avatarRohanBg: {
    backgroundColor: '#1E3A66',
  },
  avatarRohanColor: {
    color: '#8DB8F5',
  },
  avatarPriyaBg: {
    backgroundColor: '#4A2E1A',
  },
  avatarPriyaColor: {
    color: '#F6C08E',
  },
  aiSuggestionCard: {
    backgroundColor: '#0F1E36',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    padding: 16,
    marginBottom: 20,
  },
  aiTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiSparkle: {
    fontSize: 14,
    color: '#F0913A',
    fontWeight: '700',
  },
  aiSuggestionText: {
    flex: 1,
    fontSize: 13.5,
    color: '#CAD4DF',
    lineHeight: 20,
  },
  aiActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  aiConfirmBtn: {
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0913A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiConfirmText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiEditBtn: {
    paddingHorizontal: 20,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16284A',
    borderWidth: 1,
    borderColor: '#243A5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  aiEditText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiIgnoreBtn: {
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  aiIgnoreText: {
    fontSize: 13.5,
    color: '#8A97AB',
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B2625',
    borderWidth: 1,
    borderColor: '#134E4A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  confirmedText: {
    fontSize: 13.5,
    color: '#2DD4BF',
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomBar: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: '#172945',
    backgroundColor: '#0B1A2F',
  },
  editDateBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#243A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editDateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addRenewalTaskBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0913A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  plusIcon: {
    marginRight: 6,
  },
  addRenewalTaskBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
