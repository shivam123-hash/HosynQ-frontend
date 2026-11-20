import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MyLifeProfileScreen from '../src/screens/completeProfileScreens/MyLifeProfileScreen';
import LifeProfileUserCard from '../src/screens/completeProfileScreens/components/LifeProfileUserCard';
import LifeProfileProgressCard from '../src/screens/completeProfileScreens/components/LifeProfileProgressCard';
import LifeProfileSectionItem from '../src/screens/completeProfileScreens/components/LifeProfileSectionItem';

const mockApiResponse = {
  success: true,
  canViewFullDocuments: true,
  member: {
    memberId: '08c0733c-0b12-4145-b457-dae1597ae494',
    familyId: '2afd0480-04d1-4555-aae0-c10e072e0c7d',
    userId: '8611280d-e7be-4011-8b1c-81af7b73bbcc',
    hasAccount: true,
    fullName: 'Rupesh Sharma',
    role: 'FAMILY_OWNER',
    avatarUrl: null,
    avatarColor: 'teal',
  },
  progress: {
    completionPercentage: 6,
    filledFields: 3,
    totalFields: 28,
    completedStepsCount: 0,
    totalSteps: 5,
    nextRecommendedStep: 'personal',
    promptKey: 'PROFILE_INCOMPLETE',
    steps: {
      personal: {
        isComplete: false,
        stepNumber: 1,
        filledFields: 3,
        totalFields: 10,
        notApplicable: [],
      },
      documents: {
        isComplete: false,
        stepNumber: 2,
        filledFields: 0,
        totalFields: 3,
        notApplicable: [],
      },
      health: {
        isComplete: false,
        stepNumber: 3,
        filledFields: 0,
        totalFields: 13,
        notApplicable: [],
      },
      vaccination: {
        isComplete: false,
        stepNumber: 4,
        filledFields: 0,
        totalFields: 1,
        notApplicable: ['childGrowth'],
      },
      interests: {
        isComplete: false,
        stepNumber: 5,
        filledFields: 0,
        totalFields: 1,
        notApplicable: [],
      },
    },
  },
  data: {
    personal: {
      familyRole: 'Father',
      gender: 'Male',
      birthDate: null,
      occupationStatus: null,
    },
    documents: [],
    health: {},
    vaccination: { vaccines: [] },
    interests: { interests: [] },
  },
};

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('MyLifeProfileScreen dynamic API data binding', () => {
  it('correctly maps member, progress and section badges from API response', async () => {
    const store = configureStore({
      reducer: {
        lifeProfile: () => ({
          full: mockApiResponse,
          summary: null,
          loading: false,
        }),
        auth: () => ({ user: null }),
        family: () => ({ myMemberId: '08c0733c-0b12-4145-b457-dae1597ae494' }),
        baseProfile: () => ({}),
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={safeAreaMetrics}>
            <MyLifeProfileScreen />
          </SafeAreaProvider>
        </Provider>
      );
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 50));
    });

    // 1. Verify User Card (Rupesh Sharma, Tagline: Father, Teal Avatar)
    const userCard = renderer!.root.findByType(LifeProfileUserCard);
    expect(userCard.props.name).toBe('Rupesh Sharma');
    expect(userCard.props.tagline).toBe('Father');
    expect(userCard.props.avatarColor).toBe('#0D9488'); // teal hex

    // 2. Verify Progress Card (6%, 0 of 5, Add your personal information next)
    const progressCard = renderer!.root.findByType(LifeProfileProgressCard);
    expect(progressCard.props.completionPercentage).toBe(6);
    expect(progressCard.props.completedSectionsCount).toBe(0);
    expect(progressCard.props.totalSectionsCount).toBe(5);
    expect(progressCard.props.nextStepHint).toBe('Add your personal information next');

    // 3. Verify Section Items & Badges (Personal has 3/10 < 5 -> Pending)
    const sectionItems = renderer!.root.findAllByType(LifeProfileSectionItem);
    expect(sectionItems.length).toBe(5);

    const personalItem = sectionItems.find((item) => item.props.id === 'personal');
    expect(personalItem?.props.badgeText).toBe('Pending');
    expect(personalItem?.props.badgeType).toBe('pending');
    expect(personalItem?.props.subtitle).toBe('3 out of 10 fields filled');

    const documentsItem = sectionItems.find((item) => item.props.id === 'documents');
    expect(documentsItem?.props.badgeText).toBe('Pending');
    expect(documentsItem?.props.badgeType).toBe('pending');

    const healthItem = sectionItems.find((item) => item.props.id === 'health');
    expect(healthItem?.props.badgeText).toBe('Pending');

    const vaccinationItem = sectionItems.find((item) => item.props.id === 'vaccination');
    expect(vaccinationItem?.props.badgeText).toBe('Pending');

    const interestsItem = sectionItems.find((item) => item.props.id === 'interests');
    expect(interestsItem?.props.badgeText).toBe('Pending');
  });
});

