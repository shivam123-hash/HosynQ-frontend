import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { ImportantDateItem } from '../types';

export interface ImportantDatesViewProps {
  dates: ImportantDateItem[];
  onSelectDateItem: (item: ImportantDateItem) => void;
  onAddImportantDate: () => void;
  onBackToCalendar?: () => void;
}

type FilterType = 'all' | 'birthday' | 'anniversary' | 'document';

export const ImportantDatesView: React.FC<ImportantDatesViewProps> = ({
  dates,
  onSelectDateItem,
  onAddImportantDate,
  onBackToCalendar,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: `All ${dates.length}` },
    { id: 'birthday', label: 'Birthdays' },
    { id: 'anniversary', label: 'Anniversaries' },
    { id: 'document', label: 'Documents' },
  ];

  const filteredDates = dates.filter((d) => {
    if (activeFilter === 'all') return true;
    return d.type === activeFilter;
  });

  const thisMonthList = filteredDates.filter(
    (d) => d.section === 'this_month'
  );
  const next3MonthsList = filteredDates.filter(
    (d) => d.section === 'next_3_months'
  );
  const laterList = filteredDates.filter((d) => d.section === 'later');

  const getItemIcon = (item: ImportantDateItem) => {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('car')) {
      return { icon: 'truck' as const, color: '#CAD4DF', bgColor: '#16284A' };
    }
    if (titleLower.includes('passport')) {
      return {
        icon: 'book-open' as const,
        color: '#F0913A',
        bgColor: '#2D2214',
      };
    }
    if (titleLower.includes('licence') || titleLower.includes('license')) {
      return {
        icon: 'credit-card' as const,
        color: '#CAD4DF',
        bgColor: '#16284A',
      };
    }
    if (item.type === 'birthday') {
      return { icon: 'gift' as const, color: '#CAD4DF', bgColor: '#16284A' };
    }
    if (item.type === 'anniversary') {
      return { icon: 'heart' as const, color: '#C084FC', bgColor: '#261633' };
    }
    return { icon: 'calendar' as const, color: '#CAD4DF', bgColor: '#16284A' };
  };

  const renderDateRow = (
    item: ImportantDateItem,
    idx: number,
    isThisMonth: boolean
  ) => {
    const iconMeta = getItemIcon(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.dateItemRow, idx > 0 && styles.rowDivider]}
        onPress={() => onSelectDateItem(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.dateFormatted}`}
      >
        <View
          style={[styles.iconBox, { backgroundColor: iconMeta.bgColor }]}
        >
          <Feather name={iconMeta.icon} size={18} color={iconMeta.color} />
        </View>

        <View style={styles.dateTextCol}>
          <Text style={styles.dateTitle}>{item.title}</Text>
          <Text style={styles.dateSubtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.dateRightCol}>
          <Text
            style={[
              styles.dateFormattedText,
              isThisMonth && styles.dateFormattedTextOrange,
            ]}
          >
            {item.dateFormatted}
          </Text>
          <Text style={styles.daysLeftText}>{item.timeRemainingText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Row if standalone */}
      {Boolean(onBackToCalendar) && (
        <View style={styles.topNavRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBackToCalendar}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to calendar"
          >
            <Feather name="chevron-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Important dates</Text>
          <View style={styles.backPlaceholder} />
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(tab.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${tab.label}`}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section: THIS MONTH */}
        {thisMonthList.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>THIS MONTH</Text>
            <View style={styles.datesCard}>
              {thisMonthList.map((item, idx) =>
                renderDateRow(item, idx, true)
              )}
            </View>
          </View>
        )}

        {/* Section: NEXT 3 MONTHS */}
        {next3MonthsList.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>NEXT 3 MONTHS</Text>
            <View style={styles.datesCard}>
              {next3MonthsList.map((item, idx) =>
                renderDateRow(item, idx, false)
              )}
            </View>
          </View>
        )}

        {/* Section: LATER */}
        {laterList.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeader}>LATER</Text>
            <View style={styles.datesCard}>
              {laterList.map((item, idx) => renderDateRow(item, idx, false))}
            </View>
          </View>
        )}

        {/* Add Important Date Dashed Button (CAL-15) */}
        <TouchableOpacity
          style={styles.addBtnDashed}
          onPress={onAddImportantDate}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add an important date"
        >
          <Feather
            name="plus"
            size={16}
            color="#F0913A"
            style={styles.btnIcon}
          />
          <Text style={styles.addBtnText}>Add an important date</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ImportantDatesView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNavRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#122440',
    borderWidth: 1,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backPlaceholder: {
    width: 44,
  },
  filtersRow: {
    marginBottom: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#122440',
    borderWidth: 1.5,
    borderColor: '#1F3352',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#F0913A',
    borderColor: '#F0913A',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CAD4DF',
  },
  filterPillTextActive: {
    color: '#0B1A2F',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A97AB',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  datesCard: {
    backgroundColor: '#122440',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F3352',
    overflow: 'hidden',
  },
  dateItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderColor: '#1A2C46',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateTextCol: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dateSubtitle: {
    fontSize: 12.5,
    color: '#8A97AB',
  },
  dateRightCol: {
    alignItems: 'flex-end',
  },
  dateFormattedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dateFormattedTextOrange: {
    color: '#F0913A',
  },
  daysLeftText: {
    fontSize: 12,
    color: '#8A97AB',
  },
  addBtnDashed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#243A5E',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    marginTop: 6,
    marginBottom: 30,
  },
  btnIcon: {
    marginRight: 8,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0913A',
  },
});
