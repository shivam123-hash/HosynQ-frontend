import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  findNodeHandle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import AppConfirmationModal from '../../../components/AppConfirmationModal';
import {
  useAppDispatch,
  useAppSelector,
  fetchLifeProfileSectionThunk,
  updateLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux';
import { getMyMemberId } from '../../../units/AsyncStorageManager';
import { extractInterestsList } from './InterestsDetailsScreen';
import {
  PersonalInfoHeader,
  InterestCategoryGroup,
} from '../components';

export interface InterestCategoryData {
  title: string;
  items: string[];
}

export interface InterestsAndActivitiesScreenProps {
  memberId?: string;
  userName?: string;
  onBack?: () => void;
  onSave?: (selectedInterests: string[]) => void;
  onEnterHosynQ?: (selectedInterests: string[]) => void;
}

export const CATEGORIES: InterestCategoryData[] = [
  {
    title: 'SPORTS',
    items: ['Yoga', 'Badminton', 'Walking', 'Swimming'],
  },
  {
    title: 'MUSIC',
    items: ['Bollywood', 'Classical', 'Ghazals'],
  },
  {
    title: 'READING',
    items: ['Fiction', 'Biographies', 'Cookbooks'],
  },
  {
    title: 'GAMING',
    items: ['Board games', 'Mobile games', 'Puzzles'],
  },
  {
    title: 'TRAVEL',
    items: ['Hill stations', 'Beaches', 'Road trips'],
  },
  {
    title: 'COOKING',
    items: ['Baking', 'Regional Indian', 'Healthy'],
  },
];

const DEFAULT_SELECTED = [
  'Yoga',
  'Walking',
  'Bollywood',
  'Ghazals',
  'Fiction',
  'Board games',
  'Puzzles',
  'Hill stations',
  'Road trips',
  'Baking',
  'Regional Indian',
];

const InterestsAndActivitiesScreen: React.FC<
  InterestsAndActivitiesScreenProps
> = ({
  memberId,
  userName = 'Priya',
  onBack,
  onSave,
  onEnterHosynQ,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const scrollViewRef = useRef<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates ? e.endCoordinates.height : 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = (event: any) => {
    if (scrollViewRef.current) {
      const nodeHandle = findNodeHandle(event.target);
      if (nodeHandle) {
        setTimeout(() => {
          (scrollViewRef.current as any)
            ?.getScrollResponder?.()
            ?.scrollResponderScrollNativeHandleToKeyboard(nodeHandle, 120, true);
        }, 120);
      }
    }
  };

  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileInterests = useAppSelector((state) => state.lifeProfile?.interests);
  const fullProfile = useAppSelector((state) => state.lifeProfile?.full);

  const resolvedMemberId =
    memberId ||
    fullProfile?.member?.memberId ||
    fullProfile?.data?.member?.memberId ||
    (authUser as any)?.lifeProfile?.memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId ||
    authUser?.myMemberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  const resolvedUserName =
    (userName && userName !== 'Priya' ? userName : undefined) ||
    authUser?.name ||
    authUser?.fullName ||
    fullProfile?.member?.fullName ||
    fullProfile?.data?.member?.fullName ||
    userName ||
    'Priya';

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?view=full&section=interests
  useEffect(() => {
    const fetchExisting = async () => {
      let targetId = resolvedMemberId;
      if (!targetId || targetId === 'me') {
        const stored = await getMyMemberId();
        if (stored) targetId = stored;
      }
      if (targetId && targetId !== 'me') {
        dispatch(
          fetchLifeProfileSectionThunk({
            memberId: targetId,
            section: 'interests',
            view: 'full',
          })
        );
        dispatch(
          fetchLifeProfileSectionThunk({
            memberId: targetId,
            section: 'interests',
          })
        );
      }
    };
    fetchExisting();
  }, [dispatch, resolvedMemberId]);

  // Sync incoming backend interests data into selectedInterests
  useEffect(() => {
    const rawInterests = extractInterestsList(lifeProfileInterests);
    const fromFull = extractInterestsList(fullProfile);
    const existing = rawInterests.length > 0 ? rawInterests : fromFull;

    if (Array.isArray(existing) && existing.length > 0) {
      setSelectedInterests(existing);
      const standardItems = new Set(CATEGORIES.flatMap((c) => c.items));
      const customs = existing.filter(
        (item) => typeof item === 'string' && !standardItems.has(item),
      );
      if (customs.length > 0) {
        setCustomItems((prev) => Array.from(new Set([...prev, ...customs])));
      }
    }
  }, [lifeProfileInterests, fullProfile]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleAddCustom = () => {
    const trimmed = customInputText.trim();
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setCustomItems((prev) => [...prev, trimmed]);
      setSelectedInterests((prev) => [...prev, trimmed]);
      setCustomInputText('');
      setIsAddingCustom(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let targetMemberId = resolvedMemberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) targetMemberId = stored;
    }

    const payload = {
      interests: {
        interests: selectedInterests,
      },
    };

    console.log('====================================');
    console.log('[Interests] Submitting PATCH /life-profile with interests:');
    console.log(`[Interests] Target MemberId: ${targetMemberId}`);
    console.log(JSON.stringify(payload, null, 2));
    console.log('====================================');

    try {
      if (targetMemberId && targetMemberId !== 'me') {
        await dispatch(
          updateLifeProfileSectionThunk({
            memberId: targetMemberId,
            payload,
          }),
        ).unwrap();

        try {
          await Promise.allSettled([
            dispatch(
              fetchLifeProfileSectionThunk({
                memberId: targetMemberId,
                section: 'interests',
                view: 'full',
              }),
            ),
            dispatch(
              fetchLifeProfileSectionThunk({
                memberId: targetMemberId,
                section: 'interests',
              }),
            ),
            dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
          ]);
        } catch (refetchErr) {
          console.warn('[Interests] Refetch warning:', refetchErr);
        }
      }

      onSave?.(selectedInterests);
      onEnterHosynQ?.(selectedInterests);
    } catch (err: any) {
      console.error('[Interests] Save failed:', err);
      setErrorMessage(
        err?.message || 'Could not save interests. Please try again.',
      );
      setErrorModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <PersonalInfoHeader
        title="Interests and activities"
        subtitle={`${resolvedUserName} · Section 5 of 5`}
        onBack={onBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0
              ? { paddingBottom: keyboardHeight + 80 }
              : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onFocus={handleInputFocus}
        >
          {/* Information Banner */}
          <View style={styles.bannerContainer}>
            <Feather
              name="star"
              size={15}
              color="#F59E0B"
              style={styles.bannerIcon}
            />
            <Text style={styles.bannerText}>
              Used later for suggestions, like weekend plans and gift ideas.
            </Text>
          </View>

          {/* Categories & Chips */}
          {CATEGORIES.map((category) => (
            <InterestCategoryGroup
              key={category.title}
              categoryTitle={category.title}
              items={category.items}
              selectedItems={selectedInterests}
              onToggleItem={toggleInterest}
            />
          ))}

          {/* Custom Items if any */}
          {customItems.length > 0 && (
            <InterestCategoryGroup
              categoryTitle="MORE"
              items={customItems}
              selectedItems={selectedInterests}
              onToggleItem={toggleInterest}
            />
          )}

          {/* Add Something Else Card */}
          {isAddingCustom ? (
            <View style={styles.customInputCard}>
              <TextInput
                style={styles.customTextInput}
                value={customInputText}
                onChangeText={setCustomInputText}
                placeholder="Type an interest or activity"
                placeholderTextColor="#64748B"
                autoFocus
                onSubmitEditing={handleAddCustom}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAddCustom}
                style={styles.customAddButton}
              >
                <Text style={styles.customAddButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAddingCustom(true)}
              style={styles.addSomethingElseCard}
              accessibilityRole="button"
              accessibilityLabel="Add something else"
            >
              <Feather
                name="plus"
                size={17}
                color="#F0913A"
                style={styles.addPlusIcon}
              />
              <Text style={styles.addSomethingElseText}>
                Add something else
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <CommonBtn
            title="Save"
            onPress={handleSave}
            disabled={isSaving}
            loading={isSaving}
            backgroundColor={Colors.primary || '#F0913A'}
            textColor="#FFFFFF"
            height={54}
            borderRadius={27}
          />
        </View>
      </KeyboardAvoidingView>

      <AppConfirmationModal
        visible={errorModalVisible}
        title="Save Failed"
        message={errorMessage}
        confirmText="OK"
        cancelText=""
        isDestructive={false}
        confirmColor="#F0913A"
        iconName="alert-circle"
        onConfirm={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
      />
    </View>
  );
};

export default InterestsAndActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2238',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 8,
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: RFValue(12),
    lineHeight: 17,
  },
  addSomethingElseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    backgroundColor: 'rgba(15, 34, 56, 0.4)',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
  },
  addPlusIcon: {
    marginRight: 8,
  },
  addSomethingElseText: {
    color: Colors.primary || '#F0913A',
    fontSize: RFValue(13.5),
    fontFamily: 'Roboto-SemiBold',
  },
  customInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary || '#F0913A',
    borderRadius: 14,
    backgroundColor: '#0B1E36',
    marginHorizontal: 20,
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  customTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    paddingVertical: 8,
  },
  customAddButton: {
    backgroundColor: Colors.primary || '#F0913A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  customAddButtonText: {
    color: '#071526',
    fontSize: RFValue(12.5),
    fontFamily: 'Roboto-Bold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
});

