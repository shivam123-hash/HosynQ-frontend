import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';
import CommonBtn from '../../../components/CommonBtn';
import { useAppDispatch, useAppSelector, fetchLifeProfileSectionThunk } from '../../../redux';
import {
  PersonalInfoHeader,
  AddDocumentBottomSheet,
} from '../components';
import AddPassportScreen, {
  PassportFormData,
  DEFAULT_PASSPORT_DATA,
} from './AddPassportScreen';
import AddVisaScreen, { VisaFormData } from './AddVisaScreen';
import AddDrivingLicenceScreen, {
  DrivingLicenceFormData,
} from './AddDrivingLicenceScreen';
import AddAadhaarScreen, { AadhaarFormData } from './AddAadhaarScreen';
import AddPanScreen, { PanFormData } from './AddPanScreen';
import AddInsuranceScreen, { InsuranceFormData } from './AddInsuranceScreen';
import DocumentDetailRemindersScreen from './DocumentDetailRemindersScreen';
import DrivingLicenceDetailScreen from './DrivingLicenceDetailScreen';
import VisaDetailScreen from './VisaDetailScreen';
import AadhaarDetailScreen from './AadhaarDetailScreen';
import PanDetailScreen from './PanDetailScreen';
import InsuranceDetailScreen from './InsuranceDetailScreen';

export type ImportantDocsStep =
  | 'landing'
  | 'add-passport'
  | 'add-visa'
  | 'add-driving-licence'
  | 'add-aadhaar'
  | 'add-pan'
  | 'add-insurance'
  | 'details-passport'
  | 'details-dl'
  | 'details-visa'
  | 'details-aadhaar'
  | 'details-pan'
  | 'details-insurance';

export interface ImportantDocumentsScreenProps {
  memberId?: string;
  userName?: string;
  initialStep?: ImportantDocsStep;
  onBack?: () => void;
  onAddDocument?: () => void;
  onContinue?: (data: any) => void;
  onDocumentPress?: (documentId: string) => void;
}

const ImportantDocumentsScreen: React.FC<ImportantDocumentsScreenProps> = ({
  memberId,
  userName = 'Aarav',
  initialStep = 'landing',
  onBack,
  onAddDocument,
  onContinue,
  onDocumentPress,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth?.user || state.emailAuth?.user);
  const lifeProfileDocuments = useAppSelector((state) => state.lifeProfile?.documents);

  const resolvedMemberId =
    memberId ||
    authUser?.memberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?section=documents
  useEffect(() => {
    if (resolvedMemberId) {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'documents',
        })
      );
    }
  }, [dispatch, resolvedMemberId]);

  /*
   * DATA MAPPING (Ready to connect when documents API data is connected):
   * const documentsData = lifeProfileDocuments?.data || lifeProfileDocuments;
   * // e.g. if documentsData?.items?.length > 0 -> render populated documents list
   * // else -> keep rendering empty 'landing' state (No documents yet)
   */

  const [currentStep, setCurrentStep] = useState<ImportantDocsStep>(initialStep);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [savedPassport, setSavedPassport] = useState<PassportFormData | null>(
    null,
  );
  const [savedVisa, setSavedVisa] = useState<VisaFormData | null>(null);
  const [savedDL, setSavedDL] = useState<DrivingLicenceFormData | null>(null);
  const [savedAadhaar, setSavedAadhaar] = useState<AadhaarFormData | null>(null);
  const [savedPan, setSavedPan] = useState<PanFormData | null>(null);
  const [savedInsurance, setSavedInsurance] = useState<InsuranceFormData | null>(
    null,
  );

  // Step 2: Handle Add Document selection from BottomSheet
  const handleSelectDocumentType = (optionId: string) => {
    setIsAddModalVisible(false);
    switch (optionId) {
      case 'passport':
        setCurrentStep('add-passport');
        break;
      case 'visa':
        setCurrentStep('add-visa');
        break;
      case 'driving-licence':
        setCurrentStep('add-driving-licence');
        break;
      case 'aadhaar':
        setCurrentStep('add-aadhaar');
        break;
      case 'pan':
        setCurrentStep('add-pan');
        break;
      case 'insurance':
        setCurrentStep('add-insurance');
        break;
      default:
        setCurrentStep('add-passport');
        break;
    }
  };

  // After upload modal confirmed on AddPassportScreen -> navigate to final summary view
  const handlePassportSaved = (data: PassportFormData) => {
    setSavedPassport(data);
    setCurrentStep('details-passport');
  };

  // 1. Add Passport Screen (Screen 3)
  if (currentStep === 'add-passport') {
    return (
      <AddPassportScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        onClose={() => setCurrentStep('landing')}
        onSaveSuccess={handlePassportSaved}
      />
    );
  }

  // 2. Add Visa Screen (Image 1)
  if (currentStep === 'add-visa') {
    return (
      <AddVisaScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        onClose={() => setCurrentStep('landing')}
        onSave={(data) => {
          setSavedVisa(data);
          setCurrentStep('details-visa');
        }}
      />
    );
  }

  // 3. Add Driving Licence Screen (Image 2)
  if (currentStep === 'add-driving-licence') {
    return (
      <AddDrivingLicenceScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        onClose={() => setCurrentStep('landing')}
        onSave={(data) => {
          setSavedDL(data);
          setCurrentStep('details-dl');
        }}
      />
    );
  }

  // 4. Add Aadhaar Screen (Image 3 Left)
  if (currentStep === 'add-aadhaar') {
    return (
      <AddAadhaarScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        onClose={() => setCurrentStep('landing')}
        onSave={(data) => {
          setSavedAadhaar(data);
          setCurrentStep('details-aadhaar');
        }}
      />
    );
  }

  // 5. Add PAN Screen (Image 3 Right)
  if (currentStep === 'add-pan') {
    return (
      <AddPanScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        onClose={() => setCurrentStep('landing')}
        onSave={(data) => {
          setSavedPan(data);
          setCurrentStep('details-pan');
        }}
      />
    );
  }

  // 6. Add Insurance Screen (Image 4 Left)
  if (currentStep === 'add-insurance') {
    return (
      <AddInsuranceScreen
        onClose={() => setCurrentStep('landing')}
        onSave={(data) => {
          setSavedInsurance(data);
          setCurrentStep('details-insurance');
        }}
      />
    );
  }

  // 7. Driving Licence Detail Screen (Image 4 Right)
  if (currentStep === 'details-dl') {
    return (
      <DrivingLicenceDetailScreen
        userName="Rohan"
        licenceNumber={savedDL?.licenceNumber || '•••• •••• 0456'}
        expiryDate={
          savedDL?.validTill
            ? `${savedDL.validTill}`
            : '2 Nov 2026 · Expired'
        }
        issuingRTO={savedDL?.issuingRTO || 'Gurugram'}
        onBack={() => setCurrentStep('landing')}
        onRenewPress={() => setCurrentStep('add-driving-licence')}
      />
    );
  }

  // 8. Passport Final Summary View (Screen 4 / Image 4)
  if (currentStep === 'details-passport') {
    return (
      <DocumentDetailRemindersScreen
        documentTitle="Passport"
        userName={userName === 'Aarav' ? 'Priya' : userName}
        fileName="Passport_Priya.pdf"
        fileDetails="2 pages · Added 12 Oct 2026"
        documentNumber={
          savedPassport?.passportNumber
            ? `•••• •••• ${savedPassport.passportNumber.slice(-4)}`
            : '•••• •••• 4471'
        }
        issuedDate={
          savedPassport
            ? `${savedPassport.issueDate} · ${savedPassport.placeOfIssue}`
            : '22 Aug 2017 · Delhi'
        }
        expiryDate={savedPassport?.expiryDate || '21 Aug 2027'}
        onBack={() => setCurrentStep('landing')}
        onSave={(remindersData) => {
          if (onContinue) {
            onContinue({
              passport: savedPassport,
              reminders: remindersData,
            });
          }
          setCurrentStep('landing');
        }}
      />
    );
  }

  // 9. Visa Detail Screen
  if (currentStep === 'details-visa') {
    return (
      <VisaDetailScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        country={savedVisa?.country || 'United States'}
        visaType={savedVisa?.visaType || 'Tourist or business (B1/B2)'}
        visaNumber={savedVisa?.visaNumber || 'H1234567'}
        linkedPassport={savedVisa?.linkedPassport || 'Passport ending 4567'}
        validFrom={savedVisa?.validFrom || '4 Mar 2017'}
        validUntil={savedVisa?.validUntil || '3 Mar 2027'}
        entries={savedVisa?.entries || 'Multiple'}
        reminders={savedVisa?.reminders || ['6 months', '1 month']}
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => setCurrentStep('add-visa')}
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // 10. Aadhaar Detail Screen
  if (currentStep === 'details-aadhaar') {
    return (
      <AadhaarDetailScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        aadhaarNumber={savedAadhaar?.aadhaarNumber || '•••• •••• 2290'}
        fullName={savedAadhaar?.fullName || 'Priya Sharma'}
        isMasked={savedAadhaar?.keepLastFourOnly ?? true}
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => setCurrentStep('add-aadhaar')}
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // 11. PAN Detail Screen
  if (currentStep === 'details-pan') {
    return (
      <PanDetailScreen
        userName={userName === 'Aarav' ? 'Priya' : userName}
        panNumber={savedPan?.panNumber || 'ABCDE 1234 F'}
        fullName={savedPan?.fullName || 'PRIYA SHARMA'}
        dob={savedPan?.dob || '8 Aug 1988'}
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => setCurrentStep('add-pan')}
      />
    );
  }

  // 12. Insurance Detail Screen
  if (currentStep === 'details-insurance') {
    return (
      <InsuranceDetailScreen
        type={savedInsurance?.type || 'Health'}
        insurer={savedInsurance?.insurer || 'Star Health'}
        planName={savedInsurance?.planName || 'Family Floater'}
        policyNumber={savedInsurance?.policyNumber || '•••• 5521'}
        sumInsured={savedInsurance?.sumInsured || '₹10,00,000'}
        premiumPerYear={savedInsurance?.premiumPerYear || '₹24,600'}
        renewalDate={savedInsurance?.renewalDate || '12 Mar 2027'}
        saveInFamilyVault={savedInsurance?.saveInFamilyVault ?? true}
        remindRenewal={savedInsurance?.remindRenewal ?? true}
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => setCurrentStep('add-insurance')}
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // Default Initial Screen (Screen 1 / Image 1: No documents yet)
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
        title="Important documents"
        subtitle={`${userName} · Section 2 of 5`}
        onBack={onBack}
        icon="back"
      />

      {/* Empty State Landing View */}
      <View style={styles.emptyContainer}>
        {/* Double Concentric Circle Icon */}
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Feather name="file-text" size={32} color="#F0913A" />
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.emptyTitle}>No documents yet</Text>
        <Text style={styles.emptySubtitle}>
          {`Add ${userName}'s passport, birth certificate or school ID. HosynQ reminds you before anything expires.`}
        </Text>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {/* + Add document button */}
        <CommonBtn
          title="+ Add document"
          onPress={() => {
            if (onAddDocument) {
              onAddDocument();
            }
            setIsAddModalVisible(true);
          }}
          backgroundColor={Colors.primary || '#F0913A'}
          textColor="#FFFFFF"
          height={52}
          borderRadius={26}
        />

        {/* Scan a document */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsAddModalVisible(true)}
          style={styles.scanButton}
        >
          <Feather name="camera" size={17} color="#F0913A" />
          <Text style={styles.scanButtonText}>Scan a document</Text>
        </TouchableOpacity>
      </View>

      {/* Add Document Selection Bottom Sheet (Image 2) */}
      <AddDocumentBottomSheet
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSelectOption={handleSelectDocumentType}
      />
    </View>
  );
};

export default ImportantDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#0A111F',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -20,
  },
  outerCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  innerCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#121C2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: RFValue(19),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#8E9BAE',
    fontSize: RFValue(13),
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background || '#0A111F',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  scanButtonText: {
    color: '#F0913A',
    fontSize: RFValue(13.5),
    fontWeight: '600',
    marginLeft: 8,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
});
