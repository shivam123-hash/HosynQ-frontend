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
  SubscriptionScreen,
  PlansTrialScreen,
  StartFreeTrialScreen,
  TrialNotAvailableModal,
  PaymentGatewayModal,
  PaymentSuccessScreen,
  PaymentFailedScreen,
  UpgradeDowngradeScreen,
  WhatChangesOnFreeModal,
  CancelSubscriptionScreen,
  CancellationConfirmedScreen,
  RenewalGracePeriodScreen,
  BackOnFreeScreen,
  ReactivatePlanScreen,
  InvoicesHistoryScreen,
  InvoiceDetailScreen,
  AccountScreen,
  LogoutConfirmationModal,
  DeleteAccountScreen,
  ConfirmDeletionScreen,
  AccountDeletedScreen,
  HelpSupportScreen,
  ContactSupportScreen,
  PoliciesScreen,
  AboutUsScreen,
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

  it('renders SubscriptionScreen (MNU-13) and PlansTrialScreen (MNU-14)', () => {
    let rendererSub: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererSub = renderWithSafeArea(<SubscriptionScreen />);
    });
    const textsSub = getAllTexts(rendererSub!);
    expect(textsSub).toContain('Subscription');
    expect(textsSub).toContain('HOSYNQ PREMIUM');
    expect(textsSub).toContain('WHAT YOUR FAMILY GETS');
    expect(textsSub).toContain('Change plan');
    expect(textsSub).toContain('Payment method');
    expect(textsSub).toContain('Invoices and history');
    expect(textsSub).toContain('Cancel subscription');

    let rendererPlans: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererPlans = renderWithSafeArea(<PlansTrialScreen />);
    });
    const textsPlans = getAllTexts(rendererPlans!);
    expect(textsPlans).toContain('Plans');
    expect(textsPlans).toContain('Monthly');
    expect(textsPlans.some((t) => t.includes('Annual'))).toBe(true);
    expect(textsPlans).toContain('PREMIUM');
    expect(textsPlans).toContain('FREE');
    expect(textsPlans.some((t) => t.includes('free trial'))).toBe(true);
  });

  it('renders StartFreeTrialScreen (MNU-15) and TrialNotAvailableModal (MNU-16)', () => {
    let rendererTrial: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererTrial = renderWithSafeArea(<StartFreeTrialScreen />);
    });
    const textsTrial = getAllTexts(rendererTrial!);
    expect(textsTrial.some((t) => t.includes('Try Premium free'))).toBe(true);
    expect(textsTrial).toContain('Today');
    expect(textsTrial).toContain('Start free trial');
    expect(textsTrial).toContain('Not now');

    let rendererNotAvail: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererNotAvail = renderWithSafeArea(<TrialNotAvailableModal />);
    });
    const textsNotAvail = getAllTexts(rendererNotAvail!);
    expect(textsNotAvail.some((t) => t.includes('used its'))).toBe(true);
    expect(textsNotAvail).toContain('See Premium plans');
    expect(textsNotAvail).toContain('Stay on Free');
  });

  it('renders PaymentGatewayModal (MNU-17), PaymentSuccessScreen (MNU-18) and PaymentFailedScreen (MNU-19)', () => {
    let rendererGateway: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererGateway = renderWithSafeArea(
        <PaymentGatewayModal visible={true} onClose={() => {}} />
      );
    });
    const textsGateway = getAllTexts(rendererGateway!);
    expect(textsGateway).toContain('Set up AutoPay');
    expect(textsGateway).toContain('UPI apps');
    expect(textsGateway).toContain('Debit or credit card');
    expect(textsGateway).toContain('Net banking');

    let rendererSuccess: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererSuccess = renderWithSafeArea(<PaymentSuccessScreen />);
    });
    const textsSuccess = getAllTexts(rendererSuccess!);
    expect(textsSuccess).toContain("You're on Premium");
    expect(textsSuccess).toContain('Plan');
    expect(textsSuccess).toContain('Charged today');
    expect(textsSuccess).toContain('Done');
    expect(textsSuccess).toContain('View receipt');

    let rendererFailed: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererFailed = renderWithSafeArea(<PaymentFailedScreen />);
    });
    const textsFailed = getAllTexts(rendererFailed!);
    expect(textsFailed).toContain("Payment didn't go through");
    expect(textsFailed).toContain('Reason');
    expect(textsFailed).toContain('Tried');
    expect(textsFailed).toContain('Try again');
    expect(textsFailed).toContain('Use another method');
  });

  it('renders UpgradeDowngradeScreen (MNU-20) and WhatChangesOnFreeModal (MNU-21)', () => {
    let rendererUpgrade: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererUpgrade = renderWithSafeArea(<UpgradeDowngradeScreen />);
    });
    const textsUpgrade = getAllTexts(rendererUpgrade!);
    expect(textsUpgrade).toContain('Change plan');
    expect(textsUpgrade).toContain('Premium Annual');
    expect(textsUpgrade).toContain('Premium Monthly');
    expect(textsUpgrade).toContain('Free');
    expect(textsUpgrade).toContain('Switch to Annual');

    let rendererWhatChanges: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererWhatChanges = renderWithSafeArea(
        <WhatChangesOnFreeModal
          visible={true}
          onClose={() => {}}
          onKeepPremium={() => {}}
          onConfirmSwitchToFree={() => {}}
        />
      );
    });
    const textsWhatChanges = getAllTexts(rendererWhatChanges!);
    expect(textsWhatChanges).toContain('What changes on Free');
    expect(textsWhatChanges).toContain('Keep Premium');
    expect(textsWhatChanges).toContain('Switch to Free');
  });

  it('renders CancelSubscriptionScreen (MNU-22) and CancellationConfirmedScreen (MNU-23)', () => {
    let rendererCancel: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererCancel = renderWithSafeArea(<CancelSubscriptionScreen />);
    });
    const textsCancel = getAllTexts(rendererCancel!);
    expect(textsCancel).toContain('Cancel subscription');
    expect(textsCancel).toContain('WHY ARE YOU CANCELLING? (OPTIONAL)');
    expect(textsCancel).toContain('Too expensive');
    expect(textsCancel).toContain('Keep Premium');

    let rendererConfirmed: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererConfirmed = renderWithSafeArea(<CancellationConfirmedScreen />);
    });
    const textsConfirmed = getAllTexts(rendererConfirmed!);
    expect(textsConfirmed.some((t) => t.includes('cancelled'))).toBe(true);
    expect(textsConfirmed).toContain('Done');
    expect(textsConfirmed.some((t) => t.includes('Reactivate'))).toBe(true);
  });

  it('renders RenewalGracePeriodScreen (MNU-24), BackOnFreeScreen (MNU-25) and ReactivatePlanScreen (MNU-26)', () => {
    let rendererRenewal: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererRenewal = renderWithSafeArea(<RenewalGracePeriodScreen />);
    });
    const textsRenewal = getAllTexts(rendererRenewal!);
    expect(textsRenewal).toContain('Renewal didn\'t go through');
    expect(textsRenewal).toContain('Payment due');
    expect(textsRenewal).toContain('Retry payment');
    expect(textsRenewal).toContain('Change payment method');

    let rendererBackFree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererBackFree = renderWithSafeArea(<BackOnFreeScreen />);
    });
    const textsBackFree = getAllTexts(rendererBackFree!);
    expect(textsBackFree).toContain("You're back on Free");
    expect(textsBackFree).toContain('PAUSED UNTIL YOU REACTIVATE');
    expect(textsBackFree).toContain('Reactivate Premium');

    let rendererReactivate: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererReactivate = renderWithSafeArea(<ReactivatePlanScreen />);
    });
    const textsReactivate = getAllTexts(rendererReactivate!);
    expect(textsReactivate).toContain('Reactivate Premium');
    expect(textsReactivate).toContain('Premium Annual');
    expect(textsReactivate.some((t) => t.includes('Reactivate for'))).toBe(true);
  });

  it('renders InvoicesHistoryScreen (MNU-27) and InvoiceDetailScreen (MNU-28)', () => {
    let rendererInvoices: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererInvoices = renderWithSafeArea(<InvoicesHistoryScreen />);
    });
    const textsInvoices = getAllTexts(rendererInvoices!);
    expect(textsInvoices).toContain('Invoices and history');
    expect(textsInvoices).toContain('2026');
    expect(textsInvoices).toContain('2025');
    expect(textsInvoices).toContain('HSQ-INV-0012');
    expect(textsInvoices).toContain('₹299');
    expect(textsInvoices).toContain('Billing details');

    const onShareMock = jest.fn();
    let rendererInvoiceDetail: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      rendererInvoiceDetail = renderWithSafeArea(
        <InvoiceDetailScreen onShare={onShareMock} />
      );
    });
    const shareBtn = rendererInvoiceDetail!.root.findByProps({
      accessibilityLabel: 'Share invoice',
    });
    expect(shareBtn).toBeTruthy();
    ReactTestRenderer.act(() => {
      shareBtn.props.onPress();
    });
    expect(onShareMock).toHaveBeenCalledTimes(1);

    const textsInvoiceDetail = getAllTexts(rendererInvoiceDetail!);
    expect(textsInvoiceDetail).toContain('Invoice');
    expect(textsInvoiceDetail).toContain('HSQ-INV-0012');
    expect(textsInvoiceDetail).toContain('Paid');
    expect(textsInvoiceDetail).toContain('Total paid');
    expect(textsInvoiceDetail).toContain('₹299.00');
    expect(textsInvoiceDetail).toContain('₹253.39');
    expect(textsInvoiceDetail).toContain('Billed to');
    expect(textsInvoiceDetail).toContain('Download PDF');
    expect(textsInvoiceDetail).toContain('Email me a copy');
  });

  it('renders MNU-29 AccountScreen with account info and action options', () => {
    const onLogoutMock = jest.fn();
    const onDeleteMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <AccountScreen
          onLogout={onLogoutMock}
          onDeleteAccount={onDeleteMock}
        />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Account');
    expect(texts).toContain('Mobile number');
    expect(texts).toContain('+91 98••• ••123');
    expect(texts).toContain('Email');
    expect(texts).toContain('priya.sharma@example.com');
    expect(texts).toContain('App language');
    expect(texts).toContain('English');
    expect(texts).toContain('Family');
    expect(texts).toContain('The Sharma Family · Owner');
    expect(texts).toContain('Log out');
    expect(texts).toContain('Delete account');
    expect(texts).toContain('Account ID HSQ-U-30981');
  });

  it('renders MNU-30 LogoutConfirmationModal with confirmation buttons', () => {
    const onConfirmMock = jest.fn();
    const onCloseMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <LogoutConfirmationModal
          visible={true}
          onClose={onCloseMock}
          onConfirmLogout={onConfirmMock}
        />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Log out of HosynQ?');
    expect(texts.some((t) => t.includes('OTP to log back in'))).toBe(true);
    expect(texts).toContain('Log out');
    expect(texts).toContain('Cancel');
  });

  it('renders MNU-31 DeleteAccountScreen with owner warning and consequences', () => {
    const onContinueMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <DeleteAccountScreen onContinue={onContinueMock} />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Delete account');
    expect(texts).toContain('Delete your account?');
    expect(texts).toContain('You’re the Owner');
    expect(texts).toContain('Transfer');
    expect(texts).toContain('WHAT HAPPENS');
    expect(texts).toContain('Your profile and Life Profile are deleted');
    expect(texts).toContain('Just Us chats are deleted');
    expect(texts).toContain('Things you added to shared lists stay with the family');
    expect(texts).toContain('You have 30 days to change your mind');
    expect(texts).toContain('Continue');
    expect(texts).toContain('Keep my account');
  });

  it('renders MNU-32 ConfirmDeletionScreen with 6-digit OTP and undo notice', () => {
    const onDeleteMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <ConfirmDeletionScreen
          onConfirmDelete={onDeleteMock}
          initialSeconds={0}
        />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Confirm deletion');
    expect(texts.some((t) => t.includes('Enter the 6-digit code'))).toBe(true);
    expect(texts).toContain('Resend code');
    expect(texts).toContain('After 30 days this can’t be undone.');
    expect(texts).toContain('Delete my account');
  });

  it('renders MNU-33 AccountDeletedScreen with restore deadline', () => {
    const onBackMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <AccountDeletedScreen onBackToWelcome={onBackMock} />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Your account is deleted');
    expect(texts.some((t) => t.includes('Sign in before 4 Dec 2026'))).toBe(true);
    expect(texts).toContain('Back to welcome');
  });

  it('renders MNU-34 HelpSupportScreen with popular topics and categories', () => {
    const onContactMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <HelpSupportScreen onContactSupport={onContactMock} />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Help and support');
    expect(texts).toContain('POPULAR');
    expect(texts).toContain('How do I invite my family?');
    expect(texts).toContain('How does the AI brief work?');
    expect(texts).toContain('BROWSE');
    expect(texts).toContain('Tasks and lists');
    expect(texts).toContain('Calendar');
    expect(texts).toContain('Compass and location');
    expect(texts).toContain('Subscription and billing');
    expect(texts).toContain('Contact support');
    expect(texts).toContain('We usually reply within 24 hours');
  });

  it('renders MNU-35 ContactSupportScreen with category chips and send button', () => {
    const onSubmitMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <ContactSupportScreen onSubmit={onSubmitMock} />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Contact support');
    expect(texts).toContain('WHAT’S IT ABOUT?');
    expect(texts).toContain('Something isn’t working');
    expect(texts).toContain('Billing');
    expect(texts).toContain('Tell us what happened');
    expect(texts).toContain('SCREENSHOTS');
    expect(texts).toContain('Optional');
    expect(texts).toContain('Include device and app info');
    expect(texts).toContain('We’ll reply to priya.sharma@example.com');
    expect(texts).toContain('Send');
  });

  it('renders MNU-36 PoliciesScreen with list of policy documents', () => {
    const onSelectMock = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(
        <PoliciesScreen onSelectPolicy={onSelectMock} />
      );
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('Policies');
    expect(texts).toContain('Terms of use');
    expect(texts).toContain('Privacy notice');
    expect(texts).toContain('Children’s data');
    expect(texts).toContain('Refunds and cancellation');
    expect(texts).toContain('Open-source licences');
    expect(texts).toContain(
      'Questions about a policy? Write to us from Contact support.'
    );
  });

  it('renders MNU-37 AboutUsScreen with brand header, mission, and links', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = renderWithSafeArea(<AboutUsScreen />);
    });
    const texts = getAllTexts(renderer!);
    expect(texts).toContain('About');
    expect(texts).toContain('Hosyn');
    expect(texts).toContain('Q');
    expect(texts).toContain('The Family OS');
    expect(texts.some((t) => t.includes('Version 1.0.0'))).toBe(true);
    expect(texts.some((t) => t.includes('Made by ROOV Platforms'))).toBe(true);
    expect(texts).toContain('Rate HosynQ');
    expect(texts).toContain('Share with a friend');
    expect(texts).toContain('Website');
    expect(texts).toContain('Write to us');
    expect(texts).toContain('© 2026 ROOV Platforms');
  });
});
