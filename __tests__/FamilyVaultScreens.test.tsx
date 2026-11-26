import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Linking, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import vaultReducer from '../src/redux/features/vault/vaultSlice';
import {
  FamilyVaultScreen,
  DocumentsRenewalsScreen,
  InsuranceVaultScreen,
  WarrantiesBillsScreen,
  HomeAssetsScreen,
  ImportantContactsScreen,
  ScansUploadsScreen,
  VaultItemDetailScreen,
  AddEditVaultItemModal,
  canEditVaultItem,
  canDeleteVaultItem,
} from '../src/screens/mainScreens/familyVault';
import { FamilyVaultModal } from '../src/screens/mainScreens/addFlow/FamilyVaultModal';
import {
  VaultHomeSkeleton,
  VaultListSkeleton,
  VaultDetailSkeleton,
} from '../src/components/SkeletonLoader';
import {
  mockVaultAssetCar,
  mockVaultAssetHome,
  mockVaultBillElectric,
  mockVaultBillWaterPaid,
  mockVaultContacts,
  mockVaultHealthPolicy,
  mockVaultHomeResponse,
  mockVaultIdentityDoc,
  mockVaultLifePolicy,
  mockVaultLifeProfileDocs,
  mockVaultMotorPolicy,
  mockVaultReadOnlyPolicy,
  mockVaultWarrantyTv,
} from '../src/__test_fixtures__/vaultFixtures';

const createVaultTestStore = () =>
  configureStore({
    reducer: {
      vault: vaultReducer,
      family: (state = { basicFamilyData: null, myFamilyData: null }) => state,
    },
    preloadedState: {
      vault: {
        home: mockVaultHomeResponse,
        lifeProfileDocs: mockVaultLifeProfileDocs,
        items: [
          mockVaultMotorPolicy,
          mockVaultHealthPolicy,
          mockVaultLifePolicy,
          mockVaultBillElectric,
          mockVaultBillWaterPaid,
          mockVaultWarrantyTv,
          mockVaultAssetCar,
          mockVaultAssetHome,
          mockVaultIdentityDoc,
          ...mockVaultContacts,
        ],
        selectedItem: mockVaultMotorPolicy,
        lastScan: null,
        hasLoadedHome: true,
        hasLoadedLifeProfileDocs: true,
        hasLoadedItems: true,
        loadingHome: false,
        loadingLifeProfileDocs: false,
        loadingItems: false,
        loadingDetail: false,
        scanningDocument: false,
        submitting: false,
        error: null,
      },
    },
  });

const renderVaultUI = (ui: React.ReactElement) => {
  const store = createVaultTestStore();
  return ReactTestRenderer.create(
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        {ui}
      </SafeAreaProvider>
    </Provider>
  );
};

const getAllTexts = (renderer: ReactTestRenderer.ReactTestRenderer): string[] =>
  renderer.root
    .findAllByType(Text)
    .map((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? '')
    );

describe('Family Vault Screens (API-backed UI & Flows)', () => {
  it('renders FamilyVaultScreen with API alert banner, 6 categories, and recent items', () => {
    const onViewAlert = jest.fn();
    const onNavigateToCategory = jest.fn();
    const onAddToVault = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <FamilyVaultScreen
          onBack={jest.fn()}
          onViewAlert={onViewAlert}
          onNavigateToCategory={onNavigateToCategory}
          onAddToVault={onAddToVault}
          homeOverride={mockVaultHomeResponse}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Family Vault');
    expect(texts).toContain('Car insurance · Renews in 19 days');
    expect(texts).toContain('Insurance');
    expect(texts).toContain('Warranties & bills');
    expect(texts).toContain('Home assets');
    expect(texts).toContain('Important contacts');
    expect(texts).toContain('Scans and uploads');
    expect(texts).toContain('RECENTLY ADDED');
    expect(texts).toContain('Car insurance');
    expect(texts).toContain('Electricity · BSES');
    expect(texts).toContain('Add to Vault');

    const docsBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Documents & renewals');
    expect(docsBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      docsBtn?.props.onPress();
    });
    expect(onNavigateToCategory).toHaveBeenCalledWith('documents');
  });

  it('renders DocumentsRenewalsScreen with Life Profile docs and Identity vault docs', () => {
    const onSelectDoc = jest.fn();
    const onAddDocument = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <DocumentsRenewalsScreen
          onBack={jest.fn()}
          onSelectDoc={onSelectDoc}
          onAddDocument={onAddDocument}
          lifeProfileDocsOverride={mockVaultLifeProfileDocs}
          identityItemsOverride={[mockVaultIdentityDoc]}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Documents & renewals');
    expect(texts).toContain('All');
    expect(texts).toContain('RENEWING SOON');
    expect(texts).toContain('Rohan’s passport');
    expect(texts).toContain('Flat Sale Deed · Sector 45');
    expect(texts).toContain('ALL DOCUMENTS');
    expect(texts).toContain('Passports (1)');
    expect(texts).toContain('Aadhaar cards (1)');
    expect(texts).toContain('PAN cards (1)');
    expect(texts).toContain('Add document');
  });

  it('renders InsuranceVaultScreen with active policies, Renew now, and missing Home CTA', () => {
    const onRenewPolicy = jest.fn();
    const onAddPolicy = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <InsuranceVaultScreen
          onBack={jest.fn()}
          onRenewPolicy={onRenewPolicy}
          onAddPolicy={onAddPolicy}
          itemsOverride={[
            mockVaultMotorPolicy,
            mockVaultHealthPolicy,
            mockVaultLifePolicy,
          ]}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Insurance vault');
    expect(texts).toContain('MOTOR');
    expect(texts).toContain('Car insurance');
    expect(texts).toContain('Renews in 19 days');
    expect(texts).toContain('Renew now');
    expect(texts).toContain('HEALTH');
    expect(texts).toContain('Star Health Family Floater');
    expect(texts).toContain('LIFE');
    expect(texts).toContain('LIC Jeevan Anand · Rohan');
    expect(texts).toContain('No home insurance yet');
    expect(texts).toContain('Add home policy');
    expect(texts).toContain('Add policy');
  });

  it('renders WarrantiesBillsScreen with bills (Due/Pay/Paid) and warranties sections', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <WarrantiesBillsScreen
          onBack={jest.fn()}
          itemsOverride={[
            mockVaultBillElectric,
            mockVaultBillWaterPaid,
            mockVaultWarrantyTv,
          ]}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Warranties & bills');
    expect(texts).toContain('HOUSEHOLD BILLS');
    expect(texts).toContain('Electricity · BSES');
    expect(texts).toContain('Due');
    expect(texts).toContain('Pay');
    expect(texts).toContain('Water · DJB');
    expect(texts).toContain('Paid');
    expect(texts).toContain('WARRANTIES');
    expect(texts).toContain('Samsung TV Warranty');
    expect(texts).toContain('Ends soon');
    expect(texts).toContain('Add bill or warranty');
  });

  it('renders HomeAssetsScreen with assets, PUC badge, and scan tip card', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <HomeAssetsScreen
          onBack={jest.fn()}
          itemsOverride={[mockVaultAssetHome, mockVaultAssetCar]}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Home assets');
    expect(texts).toContain('Flat · Sector 45, Gurugram');
    expect(texts).toContain('Hyundai Creta');
    expect(texts).toContain('PUC due in 14 days');
    expect(texts).toContain('Add asset');
  });

  it('renders ImportantContactsScreen with filter chips, saved contacts, and emergency helplines', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <ImportantContactsScreen
          onBack={jest.fn()}
          itemsOverride={mockVaultContacts}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Important contacts');
    expect(texts).toContain('All');
    expect(texts).toContain('Doctors');
    expect(texts).toContain('School');
    expect(texts).toContain('Home help');
    expect(texts).toContain('Dr. Mehta');
    expect(texts).toContain('St. Mary’s School office');
    expect(texts).toContain('Ramesh');
    expect(texts).toContain('EMERGENCY');
    expect(texts).toContain('Ambulance');
    expect(texts).toContain('Police / Emergency');

    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    const callDocBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Call Dr. Mehta');
    expect(callDocBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      callDocBtn?.props.onPress();
    });
    expect(openUrlSpy).toHaveBeenCalledWith('tel:+919811122334');
    openUrlSpy.mockRestore();
  });

  it('renders ScansUploadsScreen with uploaded Vault files', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <ScansUploadsScreen
          onBack={jest.fn()}
          items={[mockVaultMotorPolicy, mockVaultWarrantyTv]}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Scans and uploads');
    expect(texts).toContain('Car insurance');
    expect(texts).toContain('Samsung TV Warranty');
    expect(texts).toContain('Scan or upload file');
  });

  it('renders VaultItemDetailScreen with document card, masked secret number, asset link, and action buttons', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <VaultItemDetailScreen
          item={mockVaultMotorPolicy}
          onBack={jest.fn()}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Car insurance');
    expect(texts).toContain('Car insurance.pdf');
    expect(texts).toContain('HDFC ERGO Motor');
    expect(texts).toContain('Hyundai Creta · DL 3C AB 1234');
    expect(texts).toContain('•••• •••• 7732');
    expect(texts).toContain('Rohan Sharma');
    expect(texts).toContain('Renewal reminders');
    expect(texts).toContain('Who can see this');
    expect(texts).toContain('Share');
    expect(texts).toContain('Edit');
    expect(texts).toContain('Renew now');

    const editBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Edit');
    expect(editBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      editBtn?.props.onPress();
    });
    const afterEditTexts = getAllTexts(renderer!);
    expect(afterEditTexts).toContain('Edit item');
    expect(afterEditTexts).toContain('Save changes');
  });

  it('renders live backend nested member, addedBy, numberLast4, daysLeft, and backFile cards accurately', () => {
    const backendStyledItem = {
      id: '11111111-1111-4111-8111-111111111222',
      category: 'IDENTITY',
      kind: 'AADHAAR',
      title: 'Adhar card',
      provider: 'Government',
      numberLast4: '5726',
      issuedOn: '2026-11-26',
      dueOn: '2027-05-01',
      daysLeft: 156,
      dueLabel: 'Renewal',
      hasFile: true,
      fileName: 'aadhaar_front.jpg',
      fileUrl: 'https://example.com/aadhaar_front.jpg',
      backFileName: 'aadhaar_back.jpg',
      backFileUrl: 'https://example.com/aadhaar_back.jpg',
      member: { id: 'member-1', fullName: 'Rupesh Sharma' },
      addedBy: { id: 'member-1', fullName: 'Rupesh Sharma' },
      visibility: 'EVERYONE' as const,
      canEdit: true,
      canDelete: true,
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <VaultItemDetailScreen item={backendStyledItem} onBack={jest.fn()} />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Adhar card');
    expect(texts).toContain('Rupesh Sharma');
    expect(texts).toContain('•••• •••• 5726');
    expect(texts).toContain('aadhaar_front.jpg');
    expect(texts).toContain('aadhaar_back.jpg');
  });

  it('renders AddEditVaultItemModal and Vault skeleton loaders cleanly', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <>
          <VaultHomeSkeleton />
          <VaultListSkeleton />
          <VaultDetailSkeleton />
          <AddEditVaultItemModal
            visible={true}
            initialCategory="INSURANCE"
            initialKind="MOTOR"
            onClose={jest.fn()}
          />
        </>
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Add to Vault');
    expect(texts).toContain('Scan or attach document');
    expect(texts).toContain('Front file');
    expect(texts).toContain('Back file');
    expect(texts).toContain('Auto-read details from file (OCR)');
    expect(texts).toContain('Save to Vault');
  });

  it('navigates within FamilyVaultModal from main vault to insurance subscreen and back', () => {
    const onClose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <FamilyVaultModal visible={true} onClose={onClose} />
      );
    });

    expect(getAllTexts(renderer!)).toContain('Family Vault');

    const insuranceBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Insurance');
    expect(insuranceBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      insuranceBtn?.props.onPress();
    });

    expect(getAllTexts(renderer!)).toContain('Insurance vault');
    expect(getAllTexts(renderer!)).toContain('Car insurance');

    const backBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      backBtn?.props.onPress();
    });

    expect(getAllTexts(renderer!)).toContain('Family Vault');
  });

  it('hides edit, delete, and renew controls for members without permission', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderVaultUI(
        <VaultItemDetailScreen
          item={mockVaultReadOnlyPolicy}
          onBack={jest.fn()}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Share');
    expect(texts).not.toContain('Renew now');

    const moreBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'More options');
    expect(moreBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      moreBtn?.props.onPress();
    });

    const menuTexts = getAllTexts(renderer!);
    expect(menuTexts).toContain('Share Document');
    expect(menuTexts).not.toContain('Edit Details');
    expect(menuTexts).not.toContain('Remove from Vault');

    const nonAdminState = {
      myMemberId: 'member-2',
      family: { myRole: 'ADULT_MEMBER', myMemberId: 'member-2' },
    };
    const adminState = {
      myMemberId: 'member-2',
      family: { myRole: 'FAMILY_ADMIN', myMemberId: 'member-2' },
    };
    const otherItem = {
      id: '11111111-1111-4111-8111-111111111188',
      addedByMemberId: 'member-1',
    };
    const ownItem = {
      id: '11111111-1111-4111-8111-111111111189',
      addedByMemberId: 'member-2',
    };

    expect(canEditVaultItem(otherItem, nonAdminState)).toBe(false);
    expect(canDeleteVaultItem(otherItem, nonAdminState)).toBe(false);
    expect(canEditVaultItem(ownItem, nonAdminState)).toBe(true);
    expect(canDeleteVaultItem(ownItem, nonAdminState)).toBe(true);
    expect(canEditVaultItem(otherItem, adminState)).toBe(true);
    expect(canDeleteVaultItem(otherItem, adminState)).toBe(true);
  });
});
