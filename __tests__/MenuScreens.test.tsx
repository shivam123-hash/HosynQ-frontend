import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  SideMenuModal,
  MyProfileScreen,
  NotificationPreferencesScreen,
  PrivacyConsentScreen,
  ConsentLedgerScreen,
  PrivacyNoticeScreen,
  DataRequestsScreen,
  RequestStatusScreen,
  SecurityScreen,
  DevicesSessionsScreen,
  SignOutDeviceModal,
  UnlockMethodScreen,
} from '../src/screens/mainScreens/menuScreens';

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

describe('Menu & Settings Screens (MNU-01 to MNU-12)', () => {
  it('renders SideMenuModal (MNU-01) and handles navigation callbacks', () => {
    const onSelectMyProfile = jest.fn();
    const onSelectNotifications = jest.fn();
    const onLogout = jest.fn();
    const onClose = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <SideMenuModal
          visible={true}
          onClose={onClose}
          userName="Priya Sharma"
          familyRole="Owner"
          familyName="The Sharma Family"
          onSelectMyProfile={onSelectMyProfile}
          onSelectNotifications={onSelectNotifications}
          onLogout={onLogout}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Priya Sharma');
    expect(texts.some((t) => t.includes('The Sharma Family'))).toBe(true);
    expect(texts).toContain('HosynQ Premium');
    expect(texts).toContain('Free trial · 9 days left');
    expect(texts).toContain('My profile');
    expect(texts).toContain('Notifications');
    expect(texts).toContain('Privacy and consent');
    expect(texts).toContain('Security');
    expect(texts).toContain('Log out');
  });

  it('renders MyProfileScreen (MNU-02) with user details and Life Profile entry', () => {
    const onBack = jest.fn();
    const onEdit = jest.fn();
    const onOpenLifeProfile = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <MyProfileScreen
          onBack={onBack}
          onEdit={onEdit}
          onOpenLifeProfile={onOpenLifeProfile}
          userName="Priya Sharma"
          role="Owner"
          familyName="The Sharma Family"
          phoneNumber="+91 98••• ••123 · Verified"
          email="priya.sharma@example.com"
          dateOfBirth="8 Aug 1988"
          relationship="Mother"
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('My profile');
    expect(texts).toContain('Priya Sharma');
    expect(texts).toContain('+91 98••• ••123 · Verified');
    expect(texts).toContain('priya.sharma@example.com');
    expect(texts).toContain('8 Aug 1988');
    expect(texts).toContain('Mother');
    expect(texts).toContain('My Life Profile');
  });

  it('renders NotificationPreferencesScreen (MNU-03) with push toggle and categories', () => {
    const onBack = jest.fn();
    const onQuietHours = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <NotificationPreferencesScreen
          onBack={onBack}
          onQuietHoursPress={onQuietHours}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Notifications');
    expect(texts).toContain('Push notifications');
    expect(texts).toContain('WHAT TO NOTIFY');
    expect(texts).toContain('Tasks');
    expect(texts).toContain('Events and reminders');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Quiet hours');
    expect(texts).toContain('10:00 PM to 7:00 AM');
  });

  it('renders PrivacyConsentScreen (MNU-04) with ledger, notice, requests, and phone permissions', () => {
    const onConsentLedger = jest.fn();
    const onPrivacyNotice = jest.fn();
    const onDataRequests = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <PrivacyConsentScreen
          onConsentLedger={onConsentLedger}
          onPrivacyNotice={onPrivacyNotice}
          onDataRequests={onDataRequests}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Privacy and consent');
    expect(texts).toContain('Consent ledger');
    expect(texts).toContain('Privacy notice');
    expect(texts).toContain('Data requests');
    expect(texts).toContain('Who can see what');
    expect(texts).toContain('PERMISSIONS ON THIS PHONE');
    expect(texts).toContain('Always');
    expect(texts).toContain('Allowed');
  });

  it('renders ConsentLedgerScreen (MNU-05) with consents and filters', () => {
    const onWithdraw = jest.fn();
    const onDownload = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <ConsentLedgerScreen
          onWithdrawConsent={onWithdraw}
          onDownloadLedger={onDownload}
        />
      );
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Consent ledger');
    expect(texts).toContain('Location sharing');
    expect(texts).toContain('Offers and updates');
    expect(texts).toContain('Download ledger');
  });

  it('renders PrivacyNoticeScreen (MNU-06) with language toggles', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(<PrivacyNoticeScreen />);
    });

    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Privacy notice');
    expect(texts).toContain('Version 1.2');
    expect(texts).toContain('Current');
    expect(texts).toContain('What changed in 1.2');
    expect(texts).toContain('What we collect');
  });

  it('renders DataRequestsScreen (MNU-07) and RequestStatusScreen (MNU-08)', () => {
    let rendererDataReq: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererDataReq = renderWithSafeArea(<DataRequestsScreen />);
    });
    const textsData = getAllTexts(rendererDataReq!);
    expect(textsData).toContain('Data requests');
    expect(textsData).toContain('Export my data');
    expect(textsData).toContain('YOUR REQUESTS');
    expect(textsData).toContain('In progress');
    expect(textsData).toContain('Done');

    let rendererStatus: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererStatus = renderWithSafeArea(
        <RequestStatusScreen
          requestId="DR-20261102-0042"
          requestTitle="Export my data"
          status="In progress"
        />
      );
    });
    const textsStatus = getAllTexts(rendererStatus!);
    expect(textsStatus).toContain('Request status');
    expect(textsStatus.some((t) => t.includes('DR-20261102-0042'))).toBe(true);
    expect(textsStatus).toContain('Request received');
    expect(textsStatus).toContain('Identity checked');
    expect(textsStatus).toContain('Preparing your file');
    expect(textsStatus).toContain('Ready to download');
    expect(textsStatus).toContain('Cancel request');
  });

  it('renders SecurityScreen (MNU-09) and UnlockMethodScreen (MNU-12)', () => {
    let rendererSec: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererSec = renderWithSafeArea(<SecurityScreen />);
    });
    const textsSec = getAllTexts(rendererSec!);
    expect(textsSec).toContain('Security');
    expect(textsSec).toContain('Your account is well protected.');
    expect(textsSec).toContain('App lock');
    expect(textsSec).toContain('Fingerprint');
    expect(textsSec).toContain('Devices and sessions');
    expect(textsSec).toContain('Two-step check');

    let rendererUnlock: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererUnlock = renderWithSafeArea(<UnlockMethodScreen />);
    });
    const textsUnlock = getAllTexts(rendererUnlock!);
    expect(textsUnlock).toContain('Unlock method');
    expect(textsUnlock).toContain('Fingerprint');
    expect(textsUnlock).toContain('Face unlock');
    expect(textsUnlock).toContain('Passkey');
    expect(textsUnlock).toContain('Pattern or PIN');
    expect(textsUnlock).toContain('Save');
  });

  it('renders DevicesSessionsScreen (MNU-10) and SignOutDeviceModal (MNU-11)', () => {
    let rendererDev: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererDev = renderWithSafeArea(<DevicesSessionsScreen />);
    });
    const textsDev = getAllTexts(rendererDev!);
    expect(textsDev).toContain('Devices and sessions');
    expect(textsDev).toContain('THIS DEVICE');
    expect(textsDev).toContain('This phone');
    expect(textsDev).toContain('OTHER DEVICES');
    expect(textsDev.some((t) => t.includes('iPad Air'))).toBe(true);
    expect(textsDev.some((t) => t.includes('Chrome on Windows'))).toBe(true);

    let rendererModal: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererModal = renderWithSafeArea(
        <SignOutDeviceModal
          visible={true}
          deviceName="iPad Air"
          onClose={() => {}}
          onConfirmSignOut={() => {}}
        />
      );
    });
    const textsModal = getAllTexts(rendererModal!);
    expect(textsModal).toContain('Sign out of iPad Air?');
    expect(textsModal).toContain('Sign out');
    expect(textsModal).toContain('Cancel');
  });
});
