import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  MemberProfileScreen,
  SensitiveDataConsentModal,
  PersonalInfoSectionScreen,
  EducationSectionScreen,
  ImportantDocumentsSectionScreen,
  HealthProfileSectionScreen,
  VaccinationSectionScreen,
  UploadCertificateModal,
  InterestsActivitiesSectionScreen,
  ProfileCompleteScreen,
} from '../src/screens/mainScreens/memberProfile';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

describe('MemberProfileScreens (LPR-01 through LPR-10)', () => {
  it('LPR-01 · MemberProfileScreen renders profile header, progress card and sections', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <MemberProfileScreen />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Aarav’s profile');
    expect(texts).toContain('Aarav Sharma');
    expect(texts).toContain('Son · 9 years · Class 4, St. Mary’s');
    expect(texts).toContain('LIFE PROFILE');
    expect(texts).toContain('60%');
    expect(texts).toContain('Complete your profile');
    expect(texts).toContain('4 of 6 sections done');
    expect(texts).toContain('Add health details');
    expect(texts).toContain('A · Personal information');
    expect(texts).toContain('B · Education');
    expect(texts).toContain('C · Important documents');
    expect(texts).toContain('D · Health profile');
    expect(texts).toContain('E · Vaccination');
    expect(texts).toContain('F · Interests and activities');
  });

  it('LPR-02 · SensitiveDataConsentModal renders consent heading and points', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <SensitiveDataConsentModal
            visible={true}
            memberName="Aarav"
            onClose={jest.fn()}
            onAgree={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children).flat();
    expect(texts.some((t) => typeof t === 'string' && t.includes('Before you add health and'))).toBe(true);
    expect(texts.some((t) => typeof t === 'string' && t.includes('Encrypted. Only people you choose can see it.'))).toBe(true);
    expect(texts).toContain('Agree and continue');
    expect(texts).toContain('Not now');
  });

  it('LPR-03 · PersonalInfoSectionScreen renders section fields', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <PersonalInfoSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Personal information');
    expect(texts).toContain('Aarav · Section A');
    expect(texts).toContain('Full name');
    expect(texts).toContain('Aarav Sharma');
    expect(texts).toContain('Aaru');
    expect(texts).toContain('Save');
  });

  it('LPR-04 · EducationSectionScreen renders education details and toggles', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <EducationSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Education');
    expect(texts).toContain('Aarav · Section B');
    expect(texts).toContain('School');
    expect(texts).toContain('St. Mary’s School, Sector 46');
    expect(texts).toContain('Add school holidays to Calendar');
    expect(texts).toContain('Remind me about fee due dates');
    expect(texts).toContain('Save');
  });

  it('LPR-05 · ImportantDocumentsSectionScreen renders passport and documents', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <ImportantDocumentsSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Important documents');
    expect(texts).toContain('Aarav · Section C');
    expect(texts).toContain('HosynQ reminds you before these expire.');
    expect(texts).toContain('Passport');
    expect(texts).toContain('Renew soon');
    expect(texts).toContain('Aadhaar');
    expect(texts).toContain('+ Add document');
  });

  it('LPR-06 · HealthProfileSectionScreen renders health details and banner', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <HealthProfileSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Health profile');
    expect(texts).toContain('Aarav · Section D');
    expect(texts).toContain('Only Priya and Rohan can see this.');
    expect(texts).toContain('Allergies');
    expect(texts).toContain('Peanuts, dust');
    expect(texts).toContain('Mild asthma');
    expect(texts).toContain('Save');
  });

  it('LPR-07 · VaccinationSectionScreen renders vaccine list and reminders', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <VaccinationSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Vaccination');
    expect(texts).toContain('Aarav · Section E');
    expect(texts).toContain('Vaccines');
    expect(texts).toContain('Growth');
    expect(texts).toContain('Flu shot due 15 Nov');
    expect(texts).toContain('Typhoid booster');
    expect(texts).toContain('+ Add vaccine record');
  });

  it('LPR-08 · UploadCertificateModal renders upload methods and vault toggle', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <UploadCertificateModal
            visible={true}
            vaccineName="Typhoid booster"
            vaccineDate="12 Sep 2026"
            onClose={jest.fn()}
            onSaveCertificate={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Add a certificate');
    expect(texts).toContain('For Typhoid booster · 12 Sep 2026');
    expect(texts).toContain('Scan');
    expect(texts).toContain('Photo');
    expect(texts).toContain('PDF');
    expect(texts).toContain('Typhoid_certificate.pdf');
    expect(texts).toContain('Also save in Family Vault');
    expect(texts).toContain('Save certificate');
  });

  it('LPR-09 · InterestsActivitiesSectionScreen renders pills, activities and good to know', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <InterestsActivitiesSectionScreen memberName="Aarav" />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Interests and activities');
    expect(texts).toContain('Aarav · Section F');
    expect(texts).toContain('INTERESTS');
    expect(texts).toContain('Cricket');
    expect(texts).toContain('Chess');
    expect(texts).toContain('Chess class');
    expect(texts).toContain('In Calendar');
    expect(texts).toContain('+ Add activity');
    expect(texts).toContain('GOOD TO KNOW');
    expect(texts).toContain('Favourite food');
    expect(texts).toContain('Rajma chawal');
    expect(texts).toContain('Save');
  });

  it('LPR-10 · ProfileCompleteScreen renders complete visual and next steps', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <ProfileCompleteScreen
            memberName="Aarav"
            nextMemberName="Anaya"
            onDone={jest.fn()}
            onSetupNextMember={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });

    const texts = renderer!.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Aarav’s profile is complete');
    expect(texts).toContain('WHAT HAPPENS NEXT');
    expect(texts).toContain('Flu shot');
    expect(texts).toContain('Passport renewal');
    expect(texts).toContain('Term 2 school fee');
    expect(texts).toContain('Done');
    expect(texts).toContain('Set up Anaya’s profile');
  });
});
