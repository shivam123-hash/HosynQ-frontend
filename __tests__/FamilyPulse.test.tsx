import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  FamilyHubModal,
  FamilyPulseModal,
  TodayMoodModal,
  AppreciationWallModal,
  WriteAppreciationModal,
  FamilyPollsModal,
  CreatePollModal,
  PollResultsModal,
  MilestonesModal,
  AddMilestoneModal,
  ReactionPackModal,
} from '../src/screens/mainScreens/familyPulse';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderWithProvider = async (element: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        {element}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('Family Hub and Pulse Screens (FAM-01, PUL-01 through PUL-11)', () => {
  it('renders FamilyHubModal (FAM-01) with family ID, members, 2x2 grid, and mood selector', async () => {
    const onClose = jest.fn();
    const onOpenVault = jest.fn();
    const onOpenPulse = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyHubModal
        visible={true}
        onClose={onClose}
        onOpenVault={onOpenVault}
        onOpenPulse={onOpenPulse}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    // Verify Family Card & ID
    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain('HSQ-4821');

    // Verify Member Names
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Dadi');

    // Verify 2x2 Feature Grid
    expect(texts).toContain('Family Pulse');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Compass');
    expect(texts).toContain('Members');

    // Verify Family Vault
    expect(texts).toContain('Family Vault');

    // Verify How are you today?
    expect(texts).toContain('How are you today?');
    expect(texts).toContain('Great');
    expect(texts).toContain('Good');
    expect(texts).toContain('Okay');
    expect(texts).toContain('Tired');
    expect(texts).toContain('Stressed');
  });

  it('renders FamilyPulseModal (PUL-01) in populated state with mood card, actions, and previews', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyPulseModal visible={true} onClose={onClose} isEmpty={false} />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    // Verify Header
    expect(texts).toContain('Family Pulse');
    expect(texts).toContain('The Sharma Family');

    // Verify TODAY'S MOOD card
    expect(texts).toContain('TODAY’S MOOD');
    expect(texts).toContain('3 of 5 checked in');

    // Verify Action Buttons
    expect(texts).toContain('Thank someone');
    expect(texts).toContain('New poll');
    expect(texts).toContain('Milestone');

    // Verify Sections
    expect(texts).toContain('Appreciation wall');
    expect(texts).toContain('Family poll');
    expect(texts).toContain('Milestones');
  });

  it('renders FamilyPulseModal (PUL-11) in empty state with waveform and 3 CTAs', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyPulseModal visible={true} onClose={onClose} isEmpty={true} />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('It’s quiet in here');
    expect(texts).toContain('Share today’s mood');
    expect(texts).toContain('Write an appreciation');
    expect(texts).toContain('Create a poll');
  });

  it('renders TodayMoodModal (PUL-02) and allows selecting a mood', async () => {
    const onClose = jest.fn();
    const onSelectMood = jest.fn();

    const renderer = await renderWithProvider(
      <TodayMoodModal
        visible={true}
        onClose={onClose}
        onSelectMood={onSelectMood}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('How are you today?');
    expect(texts).toContain('Great');
    expect(texts).toContain('Good');
    expect(texts).toContain('Okay');
    expect(texts).toContain('Tired');
    expect(texts).toContain('Stressed');
  });

  it('renders AppreciationWallModal (PUL-03) with filter chips and appreciation cards', async () => {
    const onClose = jest.fn();
    const onOpenWrite = jest.fn();

    const renderer = await renderWithProvider(
      <AppreciationWallModal
        visible={true}
        onClose={onClose}
        onOpenWrite={onOpenWrite}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Appreciation wall');
    expect(texts).toContain('All');
    expect(texts).toContain('For me');
    expect(texts).toContain('From me');
    expect(texts).toContain('Write an appreciation');
  });

  it('renders WriteAppreciationModal (PUL-04) with member picker, note input, and prompt chips', async () => {
    const onClose = jest.fn();
    const onPostAppreciation = jest.fn();

    const renderer = await renderWithProvider(
      <WriteAppreciationModal
        visible={true}
        onClose={onClose}
        onPostAppreciation={onPostAppreciation}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Write an appreciation');
    expect(texts).toContain('WHO ARE YOU THANKING?');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Post appreciation');
  });

  it('renders FamilyPollsModal (PUL-05) with Active and Closed tabs', async () => {
    const onClose = jest.fn();
    const onOpenCreatePoll = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyPollsModal
        visible={true}
        onClose={onClose}
        onOpenCreatePoll={onOpenCreatePoll}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Family polls');
    expect(texts).toContain('Active · 2');
    expect(texts).toContain('Closed');
    expect(texts).toContain('Sunday plan: where shall we go?');
    expect(texts).toContain('Picnic at Lodhi Garden');
    expect(texts).toContain('Create poll');
  });

  it('renders CreatePollModal (PUL-06) and handles question/options input', async () => {
    const onClose = jest.fn();
    const onSubmitPoll = jest.fn();

    const renderer = await renderWithProvider(
      <CreatePollModal
        visible={true}
        onClose={onClose}
        onSubmitPoll={onSubmitPoll}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('New poll');
    expect(texts).toContain('Question');
    expect(texts).toContain('OPTIONS');
    expect(texts).toContain('Allow more than one choice');
    expect(texts).toContain('Post poll');

    // Test submit button
    const postBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => {
        const textNodes = btn.findAllByType(Text);
        return textNodes.some((t) => t.props.children === 'Post poll');
      });

    expect(postBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      postBtn?.props.onPress();
    });

    expect(onSubmitPoll).toHaveBeenCalled();
  });

  it('renders PollResultsModal (PUL-07) with winner highlight and Add to calendar button', async () => {
    const onClose = jest.fn();
    const onAddToCalendar = jest.fn();
    const onShareInChat = jest.fn();

    const renderer = await renderWithProvider(
      <PollResultsModal
        visible={true}
        onClose={onClose}
        onAddToCalendar={onAddToCalendar}
        onShareInChat={onShareInChat}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Poll results');
    expect(texts).toContain('MOST VOTES');
    expect(texts).toContain('Picnic at Lodhi Garden');
    expect(texts).toContain('Add to calendar');
    expect(texts).toContain('Share in Family chat');
  });

  it('renders MilestonesModal (PUL-08) with timeline and Add milestone button', async () => {
    const onClose = jest.fn();
    const onOpenAddMilestone = jest.fn();

    const renderer = await renderWithProvider(
      <MilestonesModal
        visible={true}
        onClose={onClose}
        onOpenAddMilestone={onOpenAddMilestone}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Milestones');
    expect(texts).toContain('OCTOBER 2026');
    expect(texts).toContain('Reached the badminton semi-final');
    expect(texts).toContain('Add milestone');
  });

  it('renders AddMilestoneModal (PUL-09) and handles Save milestone action', async () => {
    const onClose = jest.fn();
    const onSaveMilestone = jest.fn();

    const renderer = await renderWithProvider(
      <AddMilestoneModal
        visible={true}
        onClose={onClose}
        onSaveMilestone={onSaveMilestone}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('New milestone');
    expect(texts).toContain('WHOSE MILESTONE?');
    expect(texts).toContain('What happened?');
    expect(texts).toContain('Save milestone');

    const saveBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => {
        const textNodes = btn.findAllByType(Text);
        return textNodes.some((t) => t.props.children === 'Save milestone');
      });

    expect(saveBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      saveBtn?.props.onPress();
    });

    expect(onSaveMilestone).toHaveBeenCalled();
  });

  it('renders ReactionPackModal (PUL-10) with 6 reaction cards and reactor avatars', async () => {
    const onClose = jest.fn();
    const onSelectReaction = jest.fn();

    const renderer = await renderWithProvider(
      <ReactionPackModal
        visible={true}
        onClose={onClose}
        onSelectReaction={onSelectReaction}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Love it');
    expect(texts).toContain('So proud');
    expect(texts).toContain('Well done');
    expect(texts).toContain('Haha');
    expect(texts).toContain('Treat time');
    expect(texts).toContain('Shabash!');
    expect(texts).toContain('Remove my reaction');
  });
});
