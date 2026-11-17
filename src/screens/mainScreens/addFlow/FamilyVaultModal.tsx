import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  FamilyVaultScreen,
  DocumentsRenewalsScreen,
  InsuranceVaultScreen,
  WarrantiesBillsScreen,
  HomeAssetsScreen,
  ImportantContactsScreen,
  VaultItemDetailScreen,
} from '../familyVault';

export type VaultScreenType =
  | 'vault'
  | 'documents'
  | 'insurance'
  | 'warranties'
  | 'assets'
  | 'contacts'
  | 'detail';

export interface FamilyVaultModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFile?: (fileName: string) => void;
  initialScreen?: VaultScreenType;
}

export const FamilyVaultModal: React.FC<FamilyVaultModalProps> = ({
  visible,
  onClose,
  onSelectFile,
  initialScreen = 'vault',
}) => {
  const [currentScreen, setCurrentScreen] = useState<VaultScreenType>(initialScreen);
  const [history, setHistory] = useState<VaultScreenType[]>([initialScreen]);

  useEffect(() => {
    if (visible) {
      setCurrentScreen(initialScreen);
      setHistory([initialScreen]);
    }
  }, [visible, initialScreen]);

  const navigateTo = (screen: VaultScreenType) => {
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      setHistory(nextHistory);
      setCurrentScreen(nextHistory[nextHistory.length - 1]);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleBack}
    >
      <View style={styles.modalContainer}>
        {currentScreen === 'vault' && (
          <FamilyVaultScreen
            onBack={onClose}
            onViewAlert={() => navigateTo('detail')}
            onNavigateToCategory={(cat) => {
              if (cat === 'documents') navigateTo('documents');
              else if (cat === 'insurance') navigateTo('insurance');
              else if (cat === 'warranties') navigateTo('warranties');
              else if (cat === 'assets') navigateTo('assets');
              else if (cat === 'contacts') navigateTo('contacts');
              else navigateTo('documents');
            }}
            onSelectItem={(item) => {
              onSelectFile?.(item.title);
              navigateTo('detail');
            }}
            onAddToVault={() => navigateTo('documents')}
          />
        )}

        {currentScreen === 'documents' && (
          <DocumentsRenewalsScreen
            onBack={handleBack}
            onRenew={() => navigateTo('detail')}
            onSelectDocument={(doc) => {
              onSelectFile?.(doc.title);
              navigateTo('detail');
            }}
            onAddDocument={() => {}}
          />
        )}

        {currentScreen === 'insurance' && (
          <InsuranceVaultScreen
            onBack={handleBack}
            onSelectPolicy={() => navigateTo('detail')}
            onRenewPolicy={() => navigateTo('detail')}
            onAddPolicy={() => {}}
            onAddHomeInsurance={() => {}}
          />
        )}

        {currentScreen === 'warranties' && (
          <WarrantiesBillsScreen
            onBack={handleBack}
            onSelectBill={() => navigateTo('detail')}
            onSelectWarranty={() => navigateTo('detail')}
            onAddBillOrWarranty={() => {}}
          />
        )}

        {currentScreen === 'assets' && (
          <HomeAssetsScreen
            onBack={handleBack}
            onSelectAsset={() => navigateTo('detail')}
            onAddAsset={() => {}}
          />
        )}

        {currentScreen === 'contacts' && (
          <ImportantContactsScreen
            onBack={handleBack}
            onAddContact={() => {}}
            onCallContact={() => {}}
            onSelectContact={() => {}}
          />
        )}

        {currentScreen === 'detail' && (
          <VaultItemDetailScreen
            onBack={handleBack}
            onShare={() => {}}
            onRenewNow={() => {}}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
});

export default FamilyVaultModal;
