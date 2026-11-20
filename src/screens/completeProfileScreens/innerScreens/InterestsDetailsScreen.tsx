import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import {
  useAppDispatch,
  useAppSelector,
  fetchLifeProfileSectionThunk,
  fetchLifeProfileFullThunk,
} from '../../../redux';
import { getMyMemberId } from '../../../units/asyncStorageManager';
import { CATEGORIES, InterestCategoryData } from './InterestsAndActivitiesScreen';

export interface InterestsDetailsScreenProps {
  memberId?: string;
  userName?: string;
  interests?: string[];
  onBack?: () => void;
  onEditPress?: () => void;
}

/**
 * Robust extractor for interests list across all possible backend shapes
 * Handles strings, objects with name/title/interest/label/value, and category groups
 */
export const extractInterestsList = (source: any): string[] => {
  if (!source) return [];

  const parseItem = (x: any): string | null => {
    if (typeof x === 'string' && x.trim()) return x.trim();
    if (x && typeof x === 'object') {
      const candidate =
        x.name || x.title || x.interest || x.label || x.value || x.id;
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }
    return null;
  };

  const parseArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    const result: string[] = [];
    for (const el of arr) {
      const parsed = parseItem(el);
      if (parsed && !result.includes(parsed)) {
        result.push(parsed);
      }
    }
    return result;
  };

  if (Array.isArray(source)) {
    const list = parseArray(source);
    if (list.length > 0) return list;
  }

  const candidates = [
    source?.interests?.interests,
    source?.interests,
    source?.data?.interests?.interests,
    source?.data?.interests,
    source?.data?.data?.interests?.interests,
    source?.data?.data?.interests,
    source?.data?.items,
    source?.data,
    source?.lifeProfile?.interests?.interests,
    source?.lifeProfile?.interests,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) {
      const parsed = parseArray(item);
      if (parsed.length > 0) return parsed;
    } else if (item && typeof item === 'object') {
      if (Array.isArray(item.interests)) {
        const parsed = parseArray(item.interests);
        if (parsed.length > 0) return parsed;
      }
      if (Array.isArray(item.items)) {
        const parsed = parseArray(item.items);
        if (parsed.length > 0) return parsed;
      }
    }
  }

  // Handle case where source or data has categories: [ { category: 'SPORTS', items: [...] } ]
  const categoriesList = source?.categories || source?.data?.categories;
  if (Array.isArray(categoriesList)) {
    const list: string[] = [];
    for (const cat of categoriesList) {
      const catItems = parseArray(cat?.items || cat?.interests);
      catItems.forEach((c) => {
        if (!list.includes(c)) list.push(c);
      });
    }
    if (list.length > 0) return list;
  }

  return [];
};

const CATEGORY_ICONS: Record<string, string> = {
  SPORTS: 'activity',
  MUSIC: 'music',
  READING: 'book-open',
  GAMING: 'play-circle',
  TRAVEL: 'compass',
  COOKING: 'coffee',
};

const InterestsDetailsScreen: React.FC<InterestsDetailsScreenProps> = ({
  memberId,
  userName = 'Priya',
  interests: propInterests,
  onBack,
  onEditPress,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    navigation = null;
  }

  const [fetchedInterests, setFetchedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authUser = useAppSelector(
    (state) => state.auth?.user || (state as any).emailAuth?.user
  );
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileInterests = useAppSelector(
    (state) => state.lifeProfile?.interests
  );
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

  // Fetch GET api/v1/family/members/:memberId/life-profile?view=full&section=interests
  const fetchInterests = useCallback(async () => {
    let targetMemberId = resolvedMemberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const stored = await getMyMemberId();
      if (stored) targetMemberId = stored;
    }
    if (targetMemberId && targetMemberId !== 'me') {
      console.log(
        `[InterestsDetails] Fetching GET /api/v1/family/members/${targetMemberId}/life-profile?view=full&section=interests`
      );
      setIsLoading(true);
      try {
        const [resSectionFull, resFull] = await Promise.allSettled([
          dispatch(
            fetchLifeProfileSectionThunk({
              memberId: targetMemberId,
              section: 'interests',
              view: 'full',
            })
          ).unwrap(),
          dispatch(
            fetchLifeProfileFullThunk({
              memberId: targetMemberId,
            })
          ).unwrap(),
        ]);

        let extracted: string[] = [];
        if (resSectionFull.status === 'fulfilled') {
          extracted = extractInterestsList(resSectionFull.value);
        }
        if (extracted.length === 0 && resFull.status === 'fulfilled') {
          extracted = extractInterestsList(resFull.value);
        }

        // Fallback to section=interests without view=full if still empty
        if (extracted.length === 0) {
          try {
            const resSectionOnly = await dispatch(
              fetchLifeProfileSectionThunk({
                memberId: targetMemberId,
                section: 'interests',
              })
            ).unwrap();
            extracted = extractInterestsList(resSectionOnly);
          } catch {
            // ignore
          }
        }

        if (extracted.length > 0) {
          setFetchedInterests(extracted);
        }
      } catch (err) {
        console.log('[InterestsDetails] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [dispatch, resolvedMemberId]);

  useEffect(() => {
    fetchInterests();

    const unsubscribe = navigation?.addListener
      ? navigation.addListener('focus', fetchInterests)
      : undefined;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchInterests, navigation]);

  // Extract saved interests from Redux, props, or local fetched state
  const savedInterests: string[] = useMemo(() => {
    if (propInterests && propInterests.length > 0) {
      return propInterests;
    }

    if (fetchedInterests && fetchedInterests.length > 0) {
      return fetchedInterests;
    }

    const fromSection = extractInterestsList(lifeProfileInterests);
    if (fromSection.length > 0) {
      return fromSection;
    }

    const fromFull = extractInterestsList(fullProfile);
    if (fromFull.length > 0) {
      return fromFull;
    }

    const fromAuth = extractInterestsList((authUser as any)?.lifeProfile);
    if (fromAuth.length > 0) {
      return fromAuth;
    }

    return [];
  }, [propInterests, fetchedInterests, lifeProfileInterests, fullProfile, authUser]);

  // Group selected favorites by category
  const groupedCategories = useMemo(() => {
    const selectedSet = new Set(savedInterests);
    const standardSet = new Set<string>();

    const categorized = CATEGORIES.map((cat: InterestCategoryData) => {
      cat.items.forEach((item) => standardSet.add(item));
      const matched = cat.items.filter((item) => selectedSet.has(item));
      return {
        title: cat.title,
        items: matched,
        icon: CATEGORY_ICONS[cat.title] || 'star',
      };
    }).filter((group) => group.items.length > 0);

    // Any items not in standard categories are custom
    const customs = savedInterests.filter((item) => !standardSet.has(item));
    if (customs.length > 0) {
      categorized.push({
        title: 'CUSTOM FAVORITES',
        items: customs,
        icon: 'heart',
      });
    }

    return categorized;
  }, [savedInterests]);

  const totalCount = savedInterests.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Main Content with Safe Area insets */}
      <View
        style={[
          styles.mainContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.headerCircleBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Interests and activities
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {`${resolvedUserName} · Section 5 of 5`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onEditPress}
            style={styles.headerCircleBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit interests"
          >
            <Feather name="edit-2" size={18} color="#F0913A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Banner Box (Matching Section 5 Style) */}
          <View style={styles.bannerBox}>
            <View style={styles.bannerIconCol}>
              <Feather name="star" size={17} color="#F0913A" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerText}>
                Used later for suggestions, like weekend plans and gift ideas.
              </Text>
              {totalCount > 0 && (
                <View style={styles.countBadgeRow}>
                  <View style={styles.countBadge}>
                    <Feather
                      name="check-circle"
                      size={12}
                      color="#10B981"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.countBadgeText}>
                      {`${totalCount} ${
                        totalCount === 1 ? 'favorite' : 'favorites'
                      } saved`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Grouped Favorites List */}
          {groupedCategories.length > 0 ? (
            groupedCategories.map((group) => (
              <View key={group.title} style={styles.categoryCard}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleRow}>
                    <View style={styles.categoryIconCircle}>
                      <Feather
                        name={group.icon as any}
                        size={14}
                        color="#F0913A"
                      />
                    </View>
                    <Text style={styles.categoryTitle}>{group.title}</Text>
                  </View>
                  <Text style={styles.categoryCount}>
                    {`${group.items.length} ${
                      group.items.length === 1 ? 'item' : 'items'
                    }`}
                  </Text>
                </View>

                {/* Chips */}
                <View style={styles.chipsRow}>
                  {group.items.map((item) => (
                    <View key={item} style={styles.interestPill}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#10B981"
                        style={styles.pillCheckIcon}
                      />
                      <Text style={styles.interestPillText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            /* Empty State */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="star" size={32} color="#F0913A" />
              </View>
              <Text style={styles.emptyTitle}>No interests selected yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your favorite hobbies, sports, and activities so your family
                can give great gift and weekend recommendations.
              </Text>
              <CommonBtn
                title="Choose favorites"
                onPress={onEditPress}
                backgroundColor="#F0913A"
                textColor="#FFFFFF"
                height={46}
                borderRadius={23}
                containerStyle={styles.emptyAddBtn}
              />
            </View>
          )}
        </ScrollView>

        {/* Bottom Bar with "Edit interests" button */}
        {groupedCategories.length > 0 && (
          <View style={styles.bottomBar}>
            <CommonBtn
              title="Edit interests"
              onPress={onEditPress}
              backgroundColor={Colors.primary || '#F0913A'}
              textColor="#FFFFFF"
              height={52}
              borderRadius={26}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default InterestsDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08111E',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F1D30',
    borderWidth: 1,
    borderColor: '#1E324A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: RFValue(17),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: RFValue(12),
    color: '#8E9BAE',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  bannerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 145, 58, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(240, 145, 58, 0.22)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  bannerIconCol: {
    marginRight: 12,
    marginTop: 2,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerText: {
    fontSize: RFValue(13),
    color: '#CAD4DF',
    lineHeight: 19,
  },
  countBadgeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  countBadgeText: {
    fontSize: RFValue(11.5),
    fontWeight: '600',
    color: '#10B981',
  },
  categoryCard: {
    backgroundColor: '#0F1D30',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E324A',
    padding: 16,
    marginBottom: 14,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: RFValue(12.5),
    fontWeight: '700',
    color: '#CAD4DF',
    letterSpacing: 0.8,
  },
  categoryCount: {
    fontSize: RFValue(11.5),
    color: '#64748B',
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13243A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#243C5C',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillCheckIcon: {
    marginRight: 6,
  },
  interestPillText: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#0F1D30',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E324A',
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(240, 145, 58, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: RFValue(13),
    color: '#8E9BAE',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyAddBtn: {
    width: '60%',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#08111E',
    borderTopWidth: 1,
    borderTopColor: '#12243F',
  },
});
