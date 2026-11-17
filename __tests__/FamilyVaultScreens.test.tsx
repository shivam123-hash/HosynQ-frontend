import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  FamilyVaultScreen,
  DocumentsRenewalsScreen,
  InsuranceVaultScreen,
  WarrantiesBillsScreen,
  HomeAssetsScreen,
  ImportantContactsScreen,
  VaultItemDetailScreen,
} from '../src/screens/mainScreens/familyVault';
import { FamilyVaultModal } from '../src/screens/mainScreens/addFlow/FamilyVaultModal';

const renderWithSafeArea = (ui: React.ReactElement) => {
  return ReactTestRenderer.create(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {ui}
    </SafeAreaProvider>
  );
};

const getAllTexts = (renderer: ReactTestRenderer.ReactTestRenderer): string[] => {
  return renderer.root
    .findAllByType(Text)
    .map((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? '')
    );
};

describe('Family Vault Screens (VLT-01 to VLT-07)', () => {
  it('renders FamilyVaultScreen (VLT-01) with alert banner, 6 categories and recently added items', () => {
    const onViewAlert = jest.fn();
    const onNavigateToCategory = jest.fn();
    const onAddToVault = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <FamilyVaultScreen
          onViewAlert={onViewAlert}
          onNavigateToCategory={onNavigateToCategory}
          onAddToVault={onAddToVault}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Family Vault');
    expect(texts).toContain('Car insurance renews in 19 days');
    expect(texts).toContain('Documents and renewals');
    expect(texts).toContain('Insurance');
    expect(texts).toContain('Warranties and bills');
    expect(texts).toContain('Home assets');
    expect(texts).toContain('Important contacts');
    expect(texts).toContain('Scans and uploads');
    expect(texts).toContain('RECENTLY ADDED');
    expect(texts).toContain('St. Mary’s circular');
    expect(texts).toContain('Electricity bill · October');
    expect(texts).toContain('Add to Vault');

    // Tap on category
    const docsBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Documents and renewals');
    expect(docsBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      docsBtn?.props.onPress();
    });
    expect(onNavigateToCategory).toHaveBeenCalledWith('documents');
  });

  it('renders DocumentsRenewalsScreen (VLT-02) with member chips, renewing soon and all documents', () => {
    const onRenew = jest.fn();
    const onAddDocument = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <DocumentsRenewalsScreen onRenew={onRenew} onAddDocument={onAddDocument} />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Documents and renewals');
    expect(texts).toContain('All');
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('RENEWING SOON');
    expect(texts).toContain('Rohan’s passport');
    expect(texts).toContain('Renew');
    expect(texts).toContain('Dadi’s senior citizen card');
    expect(texts).toContain('ALL DOCUMENTS');
    expect(texts).toContain('Aadhaar cards');
    expect(texts).toContain('PAN cards');
    expect(texts).toContain('Passports');
    expect(texts).toContain('Birth certificates');
    expect(texts).toContain('Property papers');
    expect(texts).toContain('Add document');
  });

  it('renders InsuranceVaultScreen (VLT-03) with motor, health, life and empty home cards', () => {
    const onRenewPolicy = jest.fn();
    const onAddHomeInsurance = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <InsuranceVaultScreen
          onRenewPolicy={onRenewPolicy}
          onAddHomeInsurance={onAddHomeInsurance}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Insurance');
    expect(texts).toContain('MOTOR');
    expect(texts).toContain('HDFC ERGO · Hyundai Creta');
    expect(texts).toContain('Renews in 19 days');
    expect(texts).toContain('Renew now');
    expect(texts).toContain('HEALTH');
    expect(texts).toContain('Star Health Family Floater');
    expect(texts).toContain('LIFE');
    expect(texts).toContain('LIC Jeevan Anand · Rohan');
    expect(texts).toContain('HOME');
    expect(texts).toContain('No home insurance yet');
    expect(texts).toContain('Add home insurance');
    expect(texts).toContain('Add policy');
  });

  it('renders WarrantiesBillsScreen (VLT-04) with bills and warranties sections', () => {
    const onPayBill = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <WarrantiesBillsScreen onPayBill={onPayBill} />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Warranties and bills');
    expect(texts).toContain('BILLS');
    expect(texts).toContain('Electricity · BSES');
    expect(texts).toContain('Due');
    expect(texts).toContain('Pay');
    expect(texts).toContain('Internet · Airtel');
    expect(texts).toContain('Water');
    expect(texts).toContain('Paid');
    expect(texts).toContain('WARRANTIES');
    expect(texts).toContain('Samsung TV');
    expect(texts).toContain('Ends soon');
    expect(texts).toContain('LG refrigerator');
    expect(texts).toContain('Kent RO purifier');
    expect(texts).toContain('Add bill or warranty');
  });

  it('renders HomeAssetsScreen (VLT-05) with assets and AI prompt banner', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(<HomeAssetsScreen />);
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Home assets');
    expect(texts).toContain('Flat · Sector 45, Gurugram');
    expect(texts).toContain('Hyundai Creta');
    expect(texts).toContain('PUC due');
    expect(texts).toContain('Honda Activa');
    expect(texts).toContain('Inverter · Luminous');
    expect(texts).toContain(
      'Add a photo of the RC or bill and HosynQ fills in the dates for you.'
    );
    expect(texts).toContain('Add asset');
  });

  it('renders ImportantContactsScreen (VLT-06) with search, contacts and emergency numbers', () => {
    const onCallContact = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <ImportantContactsScreen onCallContact={onCallContact} />
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
    expect(texts).toContain('Sunil');
    expect(texts).toContain('Society security');
    expect(texts).toContain('EMERGENCY');
    expect(texts).toContain('Ambulance');
    expect(texts).toContain('108');
    expect(texts).toContain('Police');
    expect(texts).toContain('112');
  });

  it('renders VaultItemDetailScreen (VLT-07) with document, alert row and action buttons', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(<VaultItemDetailScreen />);
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Car insurance');
    expect(texts).toContain('HDFC_ERGO_policy_2025.pdf');
    expect(texts).toContain('Insurer');
    expect(texts).toContain('HDFC ERGO Motor');
    expect(texts).toContain('Vehicle');
    expect(texts).toContain('Hyundai Creta · DL 3C AB 1234');
    expect(texts).toContain('Policy number');
    expect(texts).toContain('•••• •••• 7732');
    expect(texts).toContain('Premium');
    expect(texts).toContain('₹14,250 a year');
    expect(texts).toContain('Valid till');
    expect(texts).toContain('Wed, 18 Nov 2026 · 19 days left');
    expect(texts).toContain('Policy holder');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Renewal reminders');
    expect(texts).toContain('Who can see this');
    expect(texts).toContain('Share');
    expect(texts).toContain('Renew now');
  });

  it('navigates within FamilyVaultModal from main vault to subscreen and back', () => {
    const onClose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <FamilyVaultModal visible={true} onClose={onClose} />
      );
    });

    // Verify main screen is shown
    expect(getAllTexts(renderer!)).toContain('Family Vault');

    // Tap on Insurance category
    const insuranceBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Insurance');
    expect(insuranceBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      insuranceBtn?.props.onPress();
    });

    // Now in InsuranceVaultScreen
    expect(getAllTexts(renderer!)).toContain('HDFC ERGO · Hyundai Creta');

    // Tap Back
    const backBtn = renderer!.root
      .findAllByType(TouchableOpacity)
      .find((t) => t.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeTruthy();

    ReactTestRenderer.act(() => {
      backBtn?.props.onPress();
    });

    // Should return to main screen
    expect(getAllTexts(renderer!)).toContain('Family Vault');
  });
});
