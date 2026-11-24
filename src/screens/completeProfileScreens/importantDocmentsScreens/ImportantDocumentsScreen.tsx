import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  updateLifeProfileSectionThunk,
  deleteDocumentThunk,
  getMyFamilyThunk,
} from '../../../redux';
import lifeProfileServices from '../../../services/lifeProfileServices';
import { getMyMemberId } from '../../../units/AsyncStorageManager';
import {
  PersonalInfoHeader,
  AddDocumentBottomSheet,
  DocumentGroupCard,
  DocumentItemRow,
  DocumentReminderBanner,
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
import {
  buildPassportPayload,
  buildVisaPayload,
  buildDrivingLicencePayload,
  buildAadhaarPayload,
  buildPanPayload,
  buildInsurancePayload,
  buildOtherDocumentPayload,
  mapDocToPassportFormData,
  mapDocToVisaFormData,
  mapDocToDLFormData,
  mapDocToAadhaarFormData,
  mapDocToPanFormData,
  mapDocToInsuranceFormData,
  formatDisplayDateFromIso,
} from './documentPayloadUtils';

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

const extractDocumentDetail = (res: any): any => {
  if (!res) return null;
  const d = res.data !== undefined ? res.data : res;
  if (Array.isArray(d?.documents)) return d.documents[0] || null;
  if (
    d?.documents &&
    typeof d.documents === 'object' &&
    !Array.isArray(d.documents)
  ) {
    return d.documents;
  }
  if (Array.isArray(d)) return d[0] || null;
  if (d?.id || d?.type || d?.number || d?.nameOnDocument) return d;
  return null;
};

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
  const familyState = useAppSelector((state) => (state as any).family);
  const lifeProfileDocuments = useAppSelector((state) => state.lifeProfile?.documents);
  const lifeProfileFull = useAppSelector((state) => state.lifeProfile?.full);

  const resolvedMemberId =
    memberId ||
    familyState?.myMemberId ||
    familyState?.family?.myMemberId ||
    authUser?.memberId ||
    authUser?.myMemberId ||
    authUser?.id ||
    authUser?._id ||
    'me';

  // API Call Structure: GET {{BaseURL}}/api/v1/family/members/{{memberId}}/life-profile?section=documents
  useEffect(() => {
    dispatch(getMyFamilyThunk());
    if (resolvedMemberId) {
      dispatch(
        fetchLifeProfileSectionThunk({
          memberId: resolvedMemberId,
          section: 'documents',
        })
      );
    }
  }, [dispatch, resolvedMemberId]);

  const [currentStep, setCurrentStep] = useState<ImportantDocsStep>(initialStep);
  const [returnStep, setReturnStep] = useState<ImportantDocsStep>('landing');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  // Extract documents list safely from redux
  const documentsData = lifeProfileDocuments?.data || lifeProfileDocuments;
  const rawDocs: any[] =
    (Array.isArray(documentsData) ? documentsData : null) ||
    (Array.isArray(documentsData?.documents) ? documentsData.documents : null) ||
    (Array.isArray(lifeProfileFull?.data?.documents) ? lifeProfileFull.data.documents : null) ||
    [];
  const hasDocuments = rawDocs.length > 0;

  // Step 2: Handle Add Document selection from BottomSheet
  const handleSelectDocumentType = (optionId: string) => {
    setIsAddModalVisible(false);
    setEditingDocId(undefined); // Fresh create mode
    setReturnStep('landing');
    switch (optionId) {
      case 'passport':
        setSavedPassport(null);
        setCurrentStep('add-passport');
        break;
      case 'visa':
        setSavedVisa(null);
        setCurrentStep('add-visa');
        break;
      case 'driving-licence':
        setSavedDL(null);
        setCurrentStep('add-driving-licence');
        break;
      case 'aadhaar':
        setSavedAadhaar(null);
        setCurrentStep('add-aadhaar');
        break;
      case 'pan':
        setSavedPan(null);
        setCurrentStep('add-pan');
        break;
      case 'insurance':
        setSavedInsurance(null);
        setCurrentStep('add-insurance');
        break;
      default:
        setSavedPassport(null);
        setCurrentStep('add-passport');
        break;
    }
  };

  /**
   * Central Document Save Handler for Step 2:
   * Translates UI form states into backend-validated DocumentItemDto payload
   * Dispatches PATCH /api/v1/family/members/:memberId/life-profile
   * Immediately refetches full life profile & documents section to update UI
   */
  const handleSaveDocument = async (
    type: 'PASSPORT' | 'VISA' | 'DRIVING_LICENCE' | 'AADHAAR' | 'PAN' | 'INSURANCE' | 'OTHER',
    data: any,
    docId?: string
  ) => {
    setIsSaving(true);
    let targetMemberId = resolvedMemberId;
    if (!targetMemberId || targetMemberId === 'me') {
      const storedMemberId = await getMyMemberId();
      if (storedMemberId) {
        targetMemberId = storedMemberId;
      }
    }

    let payload: Record<string, any>;
    switch (type) {
      case 'PASSPORT':
        payload = buildPassportPayload(data, docId);
        break;
      case 'VISA':
        payload = buildVisaPayload(data, docId);
        break;
      case 'DRIVING_LICENCE':
        payload = buildDrivingLicencePayload(data, docId);
        break;
      case 'AADHAAR':
        payload = buildAadhaarPayload(data, docId);
        break;
      case 'PAN':
        payload = buildPanPayload(data, docId);
        break;
      case 'INSURANCE':
        payload = buildInsurancePayload(data, docId);
        break;
      case 'OTHER':
      default:
        payload = buildOtherDocumentPayload(data, docId);
        break;
    }

    // Ensure remindMemberIds and coveredMemberIds only contain valid memberIds from /api/v1/family/my-family
    const validFamilyMembers: any[] =
      familyState?.myFamilyData?.family?.members ||
      familyState?.family?.members ||
      [];
    const validMemberIdSet = new Set(
      validFamilyMembers.map((m: any) => m.memberId || m.id).filter(Boolean)
    );
    if (targetMemberId) {
      validMemberIdSet.add(targetMemberId);
    }

    if (Array.isArray(payload.remindMemberIds)) {
      if (validMemberIdSet.size > 0) {
        payload.remindMemberIds = payload.remindMemberIds.filter((id: string) =>
          validMemberIdSet.has(id)
        );
      }
    } else if (type === 'PASSPORT' || type === 'VISA' || type === 'DRIVING_LICENCE' || type === 'INSURANCE') {
      payload.remindMemberIds = [];
    }

    if (Array.isArray(payload.coveredMemberIds)) {
      if (validMemberIdSet.size > 0) {
        payload.coveredMemberIds = payload.coveredMemberIds.filter((id: string) =>
          validMemberIdSet.has(id)
        );
      }
    } else if (type === 'INSURANCE') {
      payload.coveredMemberIds = [];
    }

    console.log('====================================');
    console.log(`[ImportantDocuments] SAVE PRESSED for Document Type: ${type}`);
    console.log(`[ImportantDocuments] Mode: ${docId ? `EDIT (Updating existing id: ${docId})` : 'CREATE (Adding document for 1st time)'}`);
    console.log(`[ImportantDocuments] Resolved Member ID: ${targetMemberId}`);
    console.log(`[ImportantDocuments] Submitting PATCH api/v1/family/members/${targetMemberId}/life-profile`);
    console.log('[ImportantDocuments] Document Payload:\n', JSON.stringify({ documents: [payload] }, null, 2));
    if (type === 'PAN') {
      const panNum = payload.number;
      const backendPanPattern = /^[A-Z]{3}[PCHFATBLJG][A-Z]\d{4}[A-Z]$/;
      console.log('[ImportantDocuments] PAN Field Diagnostics:', {
        number: panNum,
        length: panNum?.length,
        fourthChar: panNum?.charAt(3),
        isFourthCharValid: /[PCHFATBLJG]/.test(panNum?.charAt(3) || ''),
        matchesBackendPattern: backendPanPattern.test(panNum || ''),
      });
    }
    console.log('====================================');

    try {
      const responseAction = await dispatch(
        updateLifeProfileSectionThunk({
          memberId: targetMemberId,
          payload: {
            documents: [payload],
          },
        })
      ).unwrap();

      console.log('====================================');
      console.log(`[ImportantDocuments] PATCH SUCCESS RESPONSE for memberId ${targetMemberId}:`);
      console.log(JSON.stringify(responseAction, null, 2));
      console.log('====================================');

      // Refresh full profile & documents section so badges and list update immediately
      try {
        console.log(`[ImportantDocuments] Refreshing Life Profile: GET api/v1/family/members/${targetMemberId}/life-profile?view=full`);
        await Promise.all([
          dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
          dispatch(fetchLifeProfileSectionThunk({ memberId: targetMemberId, section: 'documents' })),
        ]);
      } catch (fetchErr) {
        console.log('[ImportantDocuments] Error refreshing profile after patch:', fetchErr);
      }

      // Update local state and navigate
      switch (type) {
        case 'PASSPORT':
          setSavedPassport(data);
          setCurrentStep('details-passport');
          break;
        case 'VISA':
          setSavedVisa(data);
          setCurrentStep('details-visa');
          break;
        case 'DRIVING_LICENCE':
          setSavedDL(data);
          setCurrentStep('details-dl');
          break;
        case 'AADHAAR':
          setSavedAadhaar(data);
          setCurrentStep('details-aadhaar');
          break;
        case 'PAN':
          setSavedPan(data);
          setCurrentStep('details-pan');
          break;
        case 'INSURANCE':
          setSavedInsurance(data);
          setCurrentStep('details-insurance');
          break;
        default:
          setCurrentStep('landing');
          break;
      }
    } catch (error: any) {
      console.log('====================================');
      console.log('[ImportantDocuments] PATCH API ERROR:');
      console.log('Error details:', error);
      if (error?.response?.data) {
        console.log('Backend Error Response Data:\n', JSON.stringify(error.response.data, null, 2));
      }
      console.log('Payload that was rejected:\n', JSON.stringify({ documents: [payload] }, null, 2));
      console.log('====================================');
      Alert.alert(
        'Save Failed',
        Array.isArray(error) ? error.join('\n') : (error?.message || error || 'Failed to save document. Please check your inputs.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete document handler: Calls DELETE /api/v1/family/documents/:documentId
  const handleDeleteDocument = async (documentId?: string) => {
    const docToDelete = documentId || editingDocId;
    if (!docToDelete) return;

    setIsDeleting(true);
    try {
      console.log(`[ImportantDocuments] Deleting document ${docToDelete}...`);
      await dispatch(deleteDocumentThunk({ documentId: docToDelete })).unwrap();

      let targetMemberId = resolvedMemberId;
      if (!targetMemberId || targetMemberId === 'me') {
        const storedMemberId = await getMyMemberId();
        if (storedMemberId) {
          targetMemberId = storedMemberId;
        }
      }

      if (targetMemberId) {
        await Promise.all([
          dispatch(
            fetchLifeProfileSectionThunk({
              memberId: targetMemberId,
              section: 'documents',
            })
          ),
          dispatch(fetchLifeProfileFullThunk({ memberId: targetMemberId })),
        ]);
      }

      setSavedPassport(null);
      setSavedVisa(null);
      setSavedDL(null);
      setSavedAadhaar(null);
      setSavedPan(null);
      setSavedInsurance(null);
      setEditingDocId(undefined);
      setCurrentStep('landing');

      Alert.alert(
        'Document Deleted',
        'The document has been removed successfully.'
      );
    } catch (err: any) {
      console.log('[ImportantDocuments] Delete Document Error:', err);
      Alert.alert(
        'Delete Failed',
        err?.message || err || 'Failed to delete document. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to open details view for an existing document
  const handleDocumentRowPress = async (doc: any) => {
    setEditingDocId(doc.id);
    setReturnStep('landing');

    // 1. Immediately map whatever fields we have so UI opens without delay
    switch (doc.type) {
      case 'PASSPORT': {
        const mapped = mapDocToPassportFormData(doc);
        if (mapped) {
          if (savedPassport?.frontImageUri) {
            mapped.frontImageUri = savedPassport.frontImageUri;
          }
          setSavedPassport(mapped as any);
        }
        setCurrentStep('details-passport');
        break;
      }
      case 'VISA': {
        const mapped = mapDocToVisaFormData(doc, rawDocs);
        if (mapped) {
          if (savedVisa?.frontImageUri) {
            mapped.frontImageUri = savedVisa.frontImageUri;
          }
          setSavedVisa(mapped as any);
        }
        setCurrentStep('details-visa');
        break;
      }
      case 'DRIVING_LICENCE': {
        const mapped = mapDocToDLFormData(doc);
        if (mapped) setSavedDL(mapped as any);
        setCurrentStep('details-dl');
        break;
      }
      case 'AADHAAR': {
        const mapped = mapDocToAadhaarFormData(doc);
        if (mapped) setSavedAadhaar(mapped as any);
        setCurrentStep('details-aadhaar');
        break;
      }
      case 'PAN': {
        const mapped = mapDocToPanFormData(doc);
        if (mapped) setSavedPan(mapped as any);
        setCurrentStep('details-pan');
        break;
      }
      case 'INSURANCE': {
        const mapped = mapDocToInsuranceFormData(doc);
        if (mapped) setSavedInsurance(mapped as any);
        setCurrentStep('details-insurance');
        break;
      }
      default: {
        const mapped = mapDocToPassportFormData(doc);
        if (mapped) setSavedPassport(mapped as any);
        setCurrentStep('details-passport');
        break;
      }
    }

    // 2. Fetch full document details from backend (GET ?section=documents&documentId=:docId)
    // to populate missing fields: nameOnDocument, issuedOn, issuedAt, expiresOn, remindMemberIds, autoRenewalTask, etc.
    try {
      let targetMemberId = resolvedMemberId;
      if (!targetMemberId || targetMemberId === 'me') {
        const storedMemberId = await getMyMemberId();
        if (storedMemberId) {
          targetMemberId = storedMemberId;
        }
      }
      if (targetMemberId && doc.id) {
        console.log(
          `[ImportantDocuments] Fetching full details for doc ${doc.id} (memberId: ${targetMemberId})...`
        );
        const res = await lifeProfileServices.getDocumentDetail(
          targetMemberId,
          doc.id
        );
        console.log(
          '[ImportantDocuments] Full document response:',
          JSON.stringify(res, null, 2)
        );
        const detailedDoc = extractDocumentDetail(res);
        if (detailedDoc) {
          const mergedDoc = { ...doc, ...detailedDoc };
          switch (doc.type) {
            case 'PASSPORT': {
              const fullMapped = mapDocToPassportFormData(mergedDoc);
              if (fullMapped) {
                if (savedPassport?.frontImageUri) {
                  fullMapped.frontImageUri = savedPassport.frontImageUri;
                }
                setSavedPassport(fullMapped as any);
              }
              break;
            }
            case 'VISA': {
              const fullMapped = mapDocToVisaFormData(mergedDoc, rawDocs);
              if (fullMapped) {
                if (savedVisa?.frontImageUri) {
                  fullMapped.frontImageUri = savedVisa.frontImageUri;
                }
                setSavedVisa(fullMapped as any);
              }
              break;
            }
            case 'DRIVING_LICENCE': {
              const fullMapped = mapDocToDLFormData(mergedDoc);
              if (fullMapped) setSavedDL(fullMapped as any);
              break;
            }
            case 'AADHAAR': {
              const fullMapped = mapDocToAadhaarFormData(mergedDoc);
              if (fullMapped) setSavedAadhaar(fullMapped as any);
              break;
            }
            case 'PAN': {
              const fullMapped = mapDocToPanFormData(mergedDoc);
              if (fullMapped) setSavedPan(fullMapped as any);
              break;
            }
            case 'INSURANCE': {
              const fullMapped = mapDocToInsuranceFormData(mergedDoc);
              if (fullMapped) setSavedInsurance(fullMapped as any);
              break;
            }
            default: {
              const fullMapped = mapDocToPassportFormData(mergedDoc);
              if (fullMapped) setSavedPassport(fullMapped as any);
              break;
            }
          }
        }
      }
    } catch (detailErr) {
      console.log(
        '[ImportantDocuments] Error fetching full document detail:',
        detailErr
      );
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'PASSPORT':
        return {
          icon: <Ionicons name="airplane-outline" size={17} color="#38BDF8" />,
          bg: 'rgba(56, 189, 248, 0.1)',
          border: 'rgba(56, 189, 248, 0.3)',
        };
      case 'VISA':
        return {
          icon: <Ionicons name="card-outline" size={17} color="#818CF8" />,
          bg: 'rgba(129, 140, 248, 0.1)',
          border: 'rgba(129, 140, 248, 0.3)',
        };
      case 'DRIVING_LICENCE':
        return {
          icon: <Feather name="truck" size={17} color="#F59E0B" />,
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'rgba(245, 158, 11, 0.3)',
        };
      case 'AADHAAR':
        return {
          icon: <Feather name="shield" size={17} color="#34D399" />,
          bg: 'rgba(52, 211, 153, 0.1)',
          border: 'rgba(52, 211, 153, 0.3)',
        };
      case 'PAN':
        return {
          icon: <Feather name="file-text" size={17} color="#F43F5E" />,
          bg: 'rgba(244, 63, 94, 0.1)',
          border: 'rgba(244, 63, 94, 0.3)',
        };
      case 'INSURANCE':
        return {
          icon: <Feather name="heart" size={17} color="#EC4899" />,
          bg: 'rgba(236, 72, 153, 0.1)',
          border: 'rgba(236, 72, 153, 0.3)',
        };
      default:
        return {
          icon: <Feather name="file" size={17} color="#F0913A" />,
          bg: 'rgba(240, 145, 58, 0.1)',
          border: 'rgba(240, 145, 58, 0.3)',
        };
    }
  };

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case 'PASSPORT':
        return 'Passport';
      case 'VISA':
        return 'Visa';
      case 'DRIVING_LICENCE':
        return 'Driving licence';
      case 'AADHAAR':
        return 'Aadhaar';
      case 'PAN':
        return 'PAN';
      case 'INSURANCE':
        return 'Insurance';
      default:
        return 'Document';
    }
  };

  const getDocumentSubtitle = (doc: any) => {
    const last4Str = doc.last4 ? `•••• •••• ${doc.last4}` : '';
    const expiryStr = doc.expiresOn ? `Expires ${doc.expiresOn}` : '';

    if (doc.type === 'VISA') {
      const parts = [doc.country ? `${doc.country} visa` : 'Visa', last4Str, expiryStr].filter(Boolean);
      return parts.join(' · ');
    }
    if (doc.type === 'INSURANCE') {
      const parts = [doc.insurer || 'Insurance', doc.insuranceType || 'Health', expiryStr].filter(Boolean);
      return parts.join(' · ');
    }
    const parts = [last4Str, expiryStr].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : (doc.label || 'Saved');
  };

  // 1. Add Passport Screen
  if (currentStep === 'add-passport') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedPassport || (currentDoc ? mapDocToPassportFormData(currentDoc) : undefined);

    return (
      <AddPassportScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-passport') {
            setCurrentStep('details-passport');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSaveSuccess={(data, docId) => handleSaveDocument('PASSPORT', data, docId)}
      />
    );
  }

  // 2. Add Visa Screen
  if (currentStep === 'add-visa') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedVisa || (currentDoc ? mapDocToVisaFormData(currentDoc, rawDocs) : undefined);

    return (
      <AddVisaScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-visa') {
            setCurrentStep('details-visa');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSave={(data, docId) => handleSaveDocument('VISA', data, docId)}
      />
    );
  }

  // 3. Add Driving Licence Screen
  if (currentStep === 'add-driving-licence') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedDL || (currentDoc ? mapDocToDLFormData(currentDoc) : undefined);

    return (
      <AddDrivingLicenceScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-dl') {
            setCurrentStep('details-dl');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSave={(data, docId) => handleSaveDocument('DRIVING_LICENCE', data, docId)}
      />
    );
  }

  // 4. Add Aadhaar Screen
  if (currentStep === 'add-aadhaar') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedAadhaar || (currentDoc ? mapDocToAadhaarFormData(currentDoc) : undefined);

    return (
      <AddAadhaarScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-aadhaar') {
            setCurrentStep('details-aadhaar');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSave={(data, docId) => handleSaveDocument('AADHAAR', data, docId)}
      />
    );
  }

  // 5. Add PAN Screen
  if (currentStep === 'add-pan') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedPan || (currentDoc ? mapDocToPanFormData(currentDoc) : undefined);

    return (
      <AddPanScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-pan') {
            setCurrentStep('details-pan');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSave={(data, docId) => handleSaveDocument('PAN', data, docId)}
      />
    );
  }

  // 6. Add Insurance Screen
  if (currentStep === 'add-insurance') {
    const currentDoc = editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null;
    const initialFormData = savedInsurance || (currentDoc ? mapDocToInsuranceFormData(currentDoc) : undefined);

    return (
      <AddInsuranceScreen
        userName={userName}
        memberId={resolvedMemberId}
        documentId={editingDocId}
        isSaving={isSaving}
        initialData={(initialFormData || undefined) as any}
        onClose={() => {
          if (returnStep === 'details-insurance') {
            setCurrentStep('details-insurance');
          } else {
            setEditingDocId(undefined);
            setCurrentStep('landing');
          }
        }}
        onSave={(data, docId) => handleSaveDocument('INSURANCE', data, docId)}
      />
    );
  }

  // 7. Driving Licence Detail Screen
  if (currentStep === 'details-dl') {
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'DRIVING_LICENCE');
    const displayDLData = savedDL || (currentDoc ? mapDocToDLFormData(currentDoc) : null);

    const resolvedAssignees = (() => {
      const ids =
        displayDLData?.remindMemberIds ||
        currentDoc?.remindMemberIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const familyList: any[] =
          familyState?.myFamilyData?.family?.members ||
          familyState?.family?.members ||
          [];
        const names = ids
          .map((id: string) => {
            const found = familyList.find(
              (m: any) => (m.memberId || m.id) === id
            );
            return found ? (found.fullName || found.name) : null;
          })
          .filter(Boolean);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      const raw = displayDLData?.assignees;
      if (raw && !raw.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) {
        return raw;
      }
      return userName;
    })();

    return (
      <DrivingLicenceDetailScreen
        userName={userName}
        licenceNumber={displayDLData?.licenceNumber || '•••• •••• ----'}
        expiryDate={
          displayDLData?.validTill ||
          (currentDoc?.expiresOn ? formatDisplayDateFromIso(currentDoc.expiresOn) : '—')
        }
        rawExpiryDate={currentDoc?.expiresOn}
        issuingRTO={displayDLData?.issuingRTO || currentDoc?.issuedAt || 'Gurugram'}
        reminders={displayDLData?.reminders || ['6 months', '1 month']}
        remindAssignees={resolvedAssignees}
        autoRenewalEnabled={displayDLData?.autoRenewal ?? true}
        isDeleting={isDeleting}
        onBack={() => setCurrentStep('landing')}
        onRemindAssignPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayDLData) setSavedDL(displayDLData as any);
          setReturnStep('details-dl');
          setCurrentStep('add-driving-licence');
        }}
        onEditPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayDLData) setSavedDL(displayDLData as any);
          setReturnStep('details-dl');
          setCurrentStep('add-driving-licence');
        }}
        onRenewPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayDLData) setSavedDL(displayDLData as any);
          setReturnStep('details-dl');
          setCurrentStep('add-driving-licence');
        }}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
      />
    );
  }

  // 8. Passport Final Summary View
  if (currentStep === 'details-passport') {
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'PASSPORT');

    const displayDocData = savedPassport || (currentDoc ? mapDocToPassportFormData(currentDoc) : null);
    const docLast4 = displayDocData?.passportNumber
      ? (displayDocData.passportNumber.length >= 4 ? displayDocData.passportNumber.slice(-4) : displayDocData.passportNumber)
      : (currentDoc?.last4 || (currentDoc?.number ? currentDoc.number.slice(-4) : ''));
    const maskedNumber = docLast4 ? `•••• •••• ${docLast4}` : '•••• •••• ----';

    const displayIssued = displayDocData?.issueDate
      ? `${displayDocData.issueDate}${displayDocData.placeOfIssue ? ` · ${displayDocData.placeOfIssue}` : ''}`
      : (currentDoc?.issuedOn
          ? `${formatDisplayDateFromIso(currentDoc.issuedOn)}${currentDoc.issuedAt ? ` · ${currentDoc.issuedAt}` : ''}`
          : '—');

    const displayExpiry = displayDocData?.expiryDate || (currentDoc?.expiresOn ? formatDisplayDateFromIso(currentDoc.expiresOn) : '—');
    const displayOwnerName =
      displayDocData?.fullName || currentDoc?.nameOnDocument || userName;
    const docOwnerFirstName = displayOwnerName
      ? displayOwnerName.split(' ')[0].charAt(0).toUpperCase() +
        displayOwnerName.split(' ')[0].slice(1).toLowerCase()
      : userName;
    const displayFileName = displayOwnerName
      ? `Passport_${displayOwnerName.replace(/\s+/g, '_')}.pdf`
      : `Passport_${userName}.pdf`;

    const displayFileUri =
      displayDocData?.frontImageUri ||
      displayDocData?.fileUrl ||
      currentDoc?.fileUrl ||
      (displayDocData as any)?.fileUri;

    const resolvedAssignees = (() => {
      const ids =
        displayDocData?.remindMemberIds ||
        currentDoc?.remindMemberIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const familyList: any[] =
          familyState?.myFamilyData?.family?.members ||
          familyState?.family?.members ||
          [];
        const names = ids
          .map((id: string) => {
            const found = familyList.find(
              (m: any) => (m.memberId || m.id) === id
            );
            return found ? (found.fullName || found.name) : null;
          })
          .filter(Boolean);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      const raw = displayDocData?.assignees;
      if (raw && !raw.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) {
        return raw;
      }
      return displayOwnerName;
    })();

    return (
      <DocumentDetailRemindersScreen
        documentTitle="Passport"
        userName={docOwnerFirstName}
        fileName={displayFileName}
        fileUri={displayFileUri}
        fileDetails={
          displayDocData?.scanId || currentDoc?.scanId
            ? '1 page · Added'
            : 'Added'
        }
        documentNumber={maskedNumber}
        issuedDate={displayIssued}
        expiryDate={displayExpiry}
        selectedReminders={displayDocData?.reminders}
        autoRenewalEnabled={displayDocData?.autoRenewal}
        remindAssignees={resolvedAssignees}
        buttonTitle="Edit"
        isDeleting={isDeleting}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => {
          if (currentDoc?.id) {
            setEditingDocId(currentDoc.id);
          }
          if (displayDocData) {
            setSavedPassport(displayDocData);
          }
          setReturnStep('details-passport');
          setCurrentStep('add-passport');
        }}
        onSave={(remindersData) => {
          if (onContinue) {
            onContinue({
              passport: displayDocData,
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
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'VISA');
    const displayVisaData = savedVisa || (currentDoc ? mapDocToVisaFormData(currentDoc, rawDocs) : null);

    const displayFileUri =
      displayVisaData?.frontImageUri ||
      displayVisaData?.fileUrl ||
      currentDoc?.fileUrl ||
      (displayVisaData as any)?.fileUri;

    const resolvedAssignees = (() => {
      const ids =
        displayVisaData?.remindMemberIds ||
        currentDoc?.remindMemberIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const familyList: any[] =
          familyState?.myFamilyData?.family?.members ||
          familyState?.family?.members ||
          [];
        const names = ids
          .map((id: string) => {
            const found = familyList.find(
              (m: any) => (m.memberId || m.id) === id
            );
            return found ? (found.fullName || found.name) : null;
          })
          .filter(Boolean);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      const raw = displayVisaData?.assignees;
      if (raw && !raw.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) {
        return raw;
      }
      return userName;
    })();

    const resolvedLinkedPassport = (() => {
      const linkedId = displayVisaData?.linkedPassportId || currentDoc?.linkedDocumentId;
      if (linkedId) {
        const linkedDoc = rawDocs.find((d: any) => d.id === linkedId);
        if (linkedDoc) {
          const num = linkedDoc.number || linkedDoc.passportNumber || linkedDoc.docNumber || '';
          const last4 = linkedDoc.last4 || (num && num.length >= 4 ? num.slice(-4) : num);
          if (last4) return `Passport ending ${last4}`;
        }
      }
      if (
        displayVisaData?.linkedPassport &&
        !displayVisaData.linkedPassport.includes('Passport ID:')
      ) {
        return displayVisaData.linkedPassport;
      }
      return linkedId ? 'Passport' : 'None';
    })();

    return (
      <VisaDetailScreen
        userName={userName}
        country={displayVisaData?.country || 'United States'}
        visaType={displayVisaData?.visaType || 'Tourist or business (B1/B2)'}
        visaNumber={displayVisaData?.visaNumber || 'H1234567'}
        linkedPassport={resolvedLinkedPassport}
        validFrom={displayVisaData?.validFrom || '—'}
        validUntil={displayVisaData?.validUntil || '—'}
        entries={displayVisaData?.entries || 'Multiple'}
        reminders={displayVisaData?.reminders || ['6 months', '1 month']}
        remindAssignees={resolvedAssignees}
        autoRenewalEnabled={displayVisaData?.autoRenewal ?? true}
        fileUri={displayFileUri}
        buttonTitle="Edit"
        isDeleting={isDeleting}
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayVisaData) setSavedVisa(displayVisaData);
          setReturnStep('details-visa');
          setCurrentStep('add-visa');
        }}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // 10. Aadhaar Detail Screen
  if (currentStep === 'details-aadhaar') {
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'AADHAAR');
    const displayAadhaarData = savedAadhaar || (currentDoc ? mapDocToAadhaarFormData(currentDoc) : null);

    return (
      <AadhaarDetailScreen
        userName={userName}
        aadhaarNumber={displayAadhaarData?.aadhaarNumber || '•••• •••• ----'}
        fullName={displayAadhaarData?.fullName || userName}
        isMasked={displayAadhaarData?.keepLastFourOnly ?? true}
        isDeleting={isDeleting}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayAadhaarData) setSavedAadhaar(displayAadhaarData);
          setReturnStep('details-aadhaar');
          setCurrentStep('add-aadhaar');
        }}
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // 11. PAN Detail Screen
  if (currentStep === 'details-pan') {
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'PAN');
    const displayPanData = savedPan || (currentDoc ? mapDocToPanFormData(currentDoc) : null);

    return (
      <PanDetailScreen
        userName={userName}
        panNumber={displayPanData?.panNumber || '—'}
        fullName={displayPanData?.fullName || userName}
        dob={displayPanData?.dob || '—'}
        buttonTitle="Edit"
        isDeleting={isDeleting}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayPanData) setSavedPan(displayPanData);
          setReturnStep('details-pan');
          setCurrentStep('add-pan');
        }}
      />
    );
  }

  // 12. Insurance Detail Screen
  if (currentStep === 'details-insurance') {
    const currentDoc =
      (editingDocId ? rawDocs.find((d: any) => d.id === editingDocId) : null) ||
      rawDocs.find((d: any) => d.type === 'INSURANCE');
    const displayInsuranceData = savedInsurance || (currentDoc ? mapDocToInsuranceFormData(currentDoc) : null);

    const familyList: any[] =
      familyState?.myFamilyData?.family?.members ||
      familyState?.family?.members ||
      [];

    const resolvedCoveredNames = (() => {
      const ids =
        displayInsuranceData?.coveredMemberIds ||
        currentDoc?.coveredMemberIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const names = ids
          .map((id: string) => {
            const found = familyList.find(
              (m: any) => (m.memberId || m.id) === id
            );
            return found ? (found.fullName || found.name) : null;
          })
          .filter(Boolean);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      return (displayInsuranceData as any)?.coveredNames || '';
    })();

    const resolvedRemindAssignees = (() => {
      const ids =
        displayInsuranceData?.remindMemberIds ||
        currentDoc?.remindMemberIds;
      if (Array.isArray(ids) && ids.length > 0) {
        const names = ids
          .map((id: string) => {
            const found = familyList.find(
              (m: any) => (m.memberId || m.id) === id
            );
            return found ? (found.fullName || found.name) : null;
          })
          .filter(Boolean);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      const raw = displayInsuranceData?.assignees;
      if (raw && !raw.match(/[0-9a-f]{8}-[0-9a-f]{4}/i)) {
        return raw;
      }
      return userName;
    })();

    return (
      <InsuranceDetailScreen
        type={displayInsuranceData?.type || 'Health'}
        insurer={displayInsuranceData?.insurer || 'Insurance Provider'}
        planName={displayInsuranceData?.planName || 'Insurance Plan'}
        policyNumber={displayInsuranceData?.policyNumber || '•••• ----'}
        sumInsured={displayInsuranceData?.sumInsured || '—'}
        premiumPerYear={displayInsuranceData?.premiumPerYear || '—'}
        renewalDate={displayInsuranceData?.renewalDate || '—'}
        saveInFamilyVault={displayInsuranceData?.saveInFamilyVault ?? true}
        coveredMemberIds={displayInsuranceData?.coveredMemberIds || currentDoc?.coveredMemberIds || []}
        coveredMemberNames={resolvedCoveredNames}
        reminders={displayInsuranceData?.reminders || ['1 month', '1 week']}
        remindAssignees={resolvedRemindAssignees}
        familyMembers={familyList}
        userName={userName}
        buttonTitle="Edit"
        isDeleting={isDeleting}
        onDeletePress={() =>
          handleDeleteDocument(currentDoc?.id || editingDocId)
        }
        onBack={() => setCurrentStep('landing')}
        onEditPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayInsuranceData) setSavedInsurance(displayInsuranceData);
          setReturnStep('details-insurance');
          setCurrentStep('add-insurance');
        }}
        onRemindAssignPress={() => {
          if (currentDoc?.id) setEditingDocId(currentDoc.id);
          if (displayInsuranceData) setSavedInsurance(displayInsuranceData);
          setReturnStep('details-insurance');
          setCurrentStep('add-insurance');
        }}
        onSave={() => setCurrentStep('landing')}
      />
    );
  }

  // Landing Screen: Shows populated list if hasDocuments, else empty state
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

      {hasDocuments ? (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentReminderBanner />

          <DocumentGroupCard sectionTitle={`Documents (${rawDocs.length} Added)`}>
            {rawDocs.map((doc: any, index: number) => {
              const isLast = index === rawDocs.length - 1;
              const docType = doc.type || 'OTHER';
              const docIcon = getDocumentIcon(docType);
              const docSubtitle = getDocumentSubtitle(doc);

              return (
                <DocumentItemRow
                  key={doc.id || `${docType}-${index}`}
                  id={doc.id}
                  title={doc.label || getDocumentTitle(docType)}
                  subtitle={docSubtitle}
                  badgeText={
                    doc.status === 'EXPIRING_SOON'
                      ? 'Soon'
                      : doc.status === 'EXPIRED'
                      ? 'Expired'
                      : null
                  }
                  icon={docIcon.icon}
                  iconBgColor={docIcon.bg}
                  iconBorderColor={docIcon.border}
                  showDivider={!isLast}
                  onPress={() => handleDocumentRowPress(doc)}
                />
              );
            })}
          </DocumentGroupCard>
        </ScrollView>
      ) : (
        /* Empty State Landing View */
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
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {/* + Add document button */}
        <CommonBtn
          title="+ Add document"
          onPress={() => {
            if (onAddDocument) {
              onAddDocument();
            }
            setEditingDocId(undefined);
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
          onPress={() => {
            setEditingDocId(undefined);
            setIsAddModalVisible(true);
          }}
          style={styles.scanButton}
        >
          <Feather name="camera" size={17} color="#F0913A" />
          <Text style={styles.scanButtonText}>Scan a document</Text>
        </TouchableOpacity>
      </View>

      {/* Add Document Selection Bottom Sheet */}
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
    fontFamily: 'Roboto-Bold',
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
    fontFamily: 'Roboto-SemiBold',
    marginLeft: 8,
  },
  listScrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
