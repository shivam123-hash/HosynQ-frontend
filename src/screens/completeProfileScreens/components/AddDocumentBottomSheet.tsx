import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { RFValue } from 'react-native-responsive-fontsize';

export interface AddDocumentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (optionId: string) => void;
  onScanPress?: () => void;
}

interface DocOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

const DOC_GRID_OPTIONS: DocOption[] = [
  {
    id: 'passport',
    title: 'Passport',
    icon: <Feather name="book-open" size={17} color="#38BDF8" />,
    iconColor: '#38BDF8',
    iconBg: 'rgba(56, 189, 248, 0.12)',
  },
  {
    id: 'visa',
    title: 'Visa',
    icon: <Feather name="globe" size={17} color="#14B8A6" />,
    iconColor: '#14B8A6',
    iconBg: 'rgba(20, 184, 166, 0.12)',
  },
  {
    id: 'driving-licence',
    title: 'Driving licence',
    icon: <Ionicons name="car-outline" size={18} color="#10B981" />,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.12)',
  },
  {
    id: 'aadhaar',
    title: 'Aadhaar · optional',
    icon: <Feather name="user-check" size={17} color="#F43F5E" />,
    iconColor: '#F43F5E',
    iconBg: 'rgba(244, 63, 94, 0.12)',
  },
  {
    id: 'pan',
    title: 'PAN · optional',
    icon: <Feather name="credit-card" size={17} color="#F59E0B" />,
    iconColor: '#F59E0B',
    iconBg: 'rgba(245, 158, 11, 0.12)',
  },
  {
    id: 'insurance',
    title: 'Insurance',
    icon: <Feather name="shield" size={17} color="#A855F7" />,
    iconColor: '#A855F7',
    iconBg: 'rgba(168, 85, 247, 0.12)',
  },
];

const AddDocumentBottomSheet: React.FC<AddDocumentBottomSheetProps> = ({
  visible,
  onClose,
  onSelectOption,
  onScanPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top Drag Handle */}
          <View style={styles.handle} />

          {/* Title & Subtitle */}
          <Text style={styles.title}>Add a document</Text>
          <Text style={styles.subtitle}>Pick what you're adding.</Text>

          {/* Featured Scan Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.scanCard}
            onPress={onScanPress || (() => onSelectOption('scan'))}
          >
            <Feather name="camera" size={18} color="#F0913A" />
            <Text style={styles.scanText}>
              Scan it and let HosynQ fill the details
            </Text>
            <Feather name="chevron-right" size={18} color="#F0913A" />
          </TouchableOpacity>

          {/* 2-Column Grid */}
          <View style={styles.grid}>
            {DOC_GRID_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={styles.gridItem}
                onPress={() => onSelectOption(item.id)}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: item.iconBg,
                      borderColor: item.iconColor + '40',
                    },
                  ]}
                >
                  {item.icon}
                </View>
                <Text style={styles.gridItemText} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Something Else Card */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.somethingElseCard}
            onPress={() => onSelectOption('something-else')}
          >
            <View style={styles.fileIconBox}>
              <Feather name="file-text" size={17} color="#94A3B8" />
            </View>
            <View style={styles.somethingElseTextContainer}>
              <Text style={styles.somethingElseTitle}>Something else</Text>
              <Text style={styles.somethingElseSubtitle}>
                Voter ID, birth certificate, ration card
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AddDocumentBottomSheet;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: RFValue(17),
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(12.5),
    marginBottom: 16,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#F0913A',
    backgroundColor: 'rgba(240, 145, 58, 0.08)',
    marginBottom: 14,
  },
  scanText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '600',
    marginLeft: 10,
    marginRight: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131F35',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gridItemText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: RFValue(12.5),
    fontWeight: '600',
  },
  somethingElseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131F35',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fileIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  somethingElseTextContainer: {
    flex: 1,
  },
  somethingElseTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(13.5),
    fontWeight: '600',
  },
  somethingElseSubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 2,
  },
});

