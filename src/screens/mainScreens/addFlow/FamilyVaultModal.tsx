import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
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
} from '../familyVault';
import { VaultCategory, VaultItemApi } from '../../../services/vaultServices';

export type VaultScreenType =
  | 'vault'
  | 'documents'
  | 'insurance'
  | 'warranties'
  | 'assets'
  | 'contacts'
  | 'scans'
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
  const [currentScreen, setCurrentScreen] =
    useState<VaultScreenType>(initialScreen);
  const [history, setHistory] = useState<VaultScreenType[]>([initialScreen]);
  const [selectedItem, setSelectedItem] = useState<VaultItemApi | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addInitialCategory, setAddInitialCategory] =
    useState<VaultCategory>('INSURANCE');
  const [addInitialKind, setAddInitialKind] = useState<string | undefined>(
    undefined
  );
  const [editItem, setEditItem] = useState<VaultItemApi | null>(null);
  const [renewMode, setRenewMode] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentScreen(initialScreen);
      setHistory([initialScreen]);
      setSelectedItem(null);
      setAddModalVisible(false);
    }
  }, [visible, initialScreen]);

  const navigateTo = (screen: VaultScreenType) => {
    setHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const openDetail = (item?: VaultItemApi | null) => {
    if (item) {
      setSelectedItem(item);
      onSelectFile?.(item.title);
    }
    navigateTo('detail');
  };

  const openAddModal = (
    category: VaultCategory,
    kind?: string,
    itemToEdit: VaultItemApi | null = null,
    isRenew = false
  ) => {
    setAddInitialCategory(category);
    setAddInitialKind(kind);
    setEditItem(itemToEdit);
    setRenewMode(isRenew);
    setAddModalVisible(true);
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
            onViewAlert={(item) => {
              if (item) openDetail(item);
            }}
            onNavigateToCategory={(cat) => {
              navigateTo(cat);
            }}
            onSelectItem={(item) => openDetail(item)}
            onAddToVault={() => openAddModal('INSURANCE', 'MOTOR')}
          />
        )}

        {currentScreen === 'documents' && (
          <DocumentsRenewalsScreen
            onBack={handleBack}
            onSelectDoc={(doc) => openDetail(doc)}
            onAddDocument={() => openAddModal('IDENTITY', 'PASSPORT')}
          />
        )}

        {currentScreen === 'insurance' && (
          <InsuranceVaultScreen
            onBack={handleBack}
            onSelectPolicy={(policy) => openDetail(policy)}
            onRenewPolicy={(policy) =>
              openAddModal('INSURANCE', policy.kind || 'MOTOR', policy, true)
            }
            onAddPolicy={(kind) => openAddModal('INSURANCE', kind || 'MOTOR')}
          />
        )}

        {currentScreen === 'warranties' && (
          <WarrantiesBillsScreen
            onBack={handleBack}
            onSelectItem={(item) => openDetail(item)}
            onAddItem={(cat) => openAddModal(cat || 'UTILITIES')}
          />
        )}

        {currentScreen === 'assets' && (
          <HomeAssetsScreen
            onBack={handleBack}
            onSelectAsset={(asset) => openDetail(asset)}
            onAddAsset={() => openAddModal('ASSET', 'VEHICLE')}
          />
        )}

        {currentScreen === 'contacts' && (
          <ImportantContactsScreen
            onBack={handleBack}
            onSelectContact={(contact) => openDetail(contact)}
            onAddContact={() => openAddModal('CONTACTS', 'DOCTOR')}
          />
        )}

        {currentScreen === 'scans' && (
          <ScansUploadsScreen
            onBack={handleBack}
            onSelectScan={(item) => openDetail(item)}
            onScanNew={() => openAddModal('IDENTITY', 'PASSPORT')}
          />
        )}

        {currentScreen === 'detail' && (
          <VaultItemDetailScreen
            item={selectedItem}
            onBack={handleBack}
            onSelectItem={(linked) => openDetail(linked)}
            onDeleted={() => {
              setSelectedItem(null);
            }}
          />
        )}

        <AddEditVaultItemModal
          visible={addModalVisible}
          initialCategory={addInitialCategory}
          initialKind={addInitialKind}
          itemToEdit={editItem}
          renewMode={renewMode}
          onClose={() => setAddModalVisible(false)}
          onSaved={(savedItem) => {
            if (currentScreen === 'detail') {
              setSelectedItem(savedItem);
            }
          }}
        />
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
