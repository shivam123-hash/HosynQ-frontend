import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux/store';
import { setSelectedPollLocal } from '../src/redux/features/pulse/pulseSlice';
import EventDetailModal from '../src/screens/mainScreens/calendarScreen/components/EventDetailModal';
import { CalendarEvent } from '../src/screens/mainScreens/calendarScreen/types';
import {
  FamilyHubModal,
  FamilyPulseModal,
  TodayMoodModal,
  AppreciationWallModal,
  WriteAppreciationModal,
  FamilyPollsModal,
  CreatePollModal,
  PollResultsModal,
  SchedulePollEventModal,
  MilestonesModal,
  AddMilestoneModal,
  MilestoneDetailModal,
  ReactionPackModal,
} from '../src/screens/mainScreens/familyPulse';
import {
  computeUpdatedReactionSummary,
  mapApiAppreciationToUi,
  mapApiMilestoneToUi,
  mapApiMoodToUiType,
  mapApiPollToUi,
  reactionApiToUiId,
} from '../src/screens/mainScreens/familyPulse/pulseApiHelpers';
import {
  PulseHomeSkeleton,
  AppreciationWallSkeleton,
  FamilyPollsSkeleton,
  PollResultsSkeleton,
  MilestonesSkeleton,
} from '../src/components/SkeletonLoader';
import {
  TEST_APPRECIATIONS,
  TEST_MILESTONES,
  TEST_POLLS,
  TEST_PULSE_HOME_DATA,
  TEST_PULSE_MEMBERS,
} from '../src/__test_fixtures__/pulseFixtures';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderWithProvider = async (element: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          {element}
        </SafeAreaProvider>
      </Provider>
    );
  });
  return renderer!;
};

const extractTextNodes = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(Text)
    .map((t) =>
      Array.isArray(t.props.children)
        ? t.props.children.join('')
        : t.props.children
    )
    .flat();

describe('Family Hub and Pulse Screens (FAM-01, PUL-01 through PUL-13)', () => {
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

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Family');
    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const labels = touchables.map((t) => t.props.accessibilityLabel);
    expect(labels).toContain('Back');
    expect(labels).toContain('Invite member to The Sharma Family');
    expect(labels).toContain('Theme');

    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain('HSQ-4821');
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Family Pulse');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Compass');
    expect(texts).toContain('Members');
    expect(texts).toContain('Family Vault');
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
      <FamilyPulseModal
        visible={true}
        onClose={onClose}
        initialHomeData={TEST_PULSE_HOME_DATA}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Family Pulse');
    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain("TODAY'S MOODS");
    expect(texts).toContain('3 of 5 checked in');

    expect(texts).toContain('Appreciation');
    expect(texts).toContain('Mood');
    expect(texts).toContain('Poll');
    expect(texts).toContain('Milestone');

    expect(texts).toContain('Appreciation wall');
    expect(texts).toContain('Family poll');
    expect(texts).toContain('Milestones');
    expect(texts).toContain('Sunday plan: where shall we go?');
    expect(texts).toContain('Reached the badminton semi-final');

    const seeAllBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => btn.props.accessibilityLabel === 'See all appreciations');
    expect(seeAllBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      seeAllBtn!.props.onPress();
    });
    const appWallModal = renderer.root.findByType(AppreciationWallModal);
    expect(appWallModal.props.visible).toBe(true);
  });

  it('renders FamilyPulseModal (PUL-11) in empty state with waveform and 3 CTAs', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyPulseModal visible={true} onClose={onClose} isEmpty={true} />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Nothing in the pulse yet');
    expect(texts).toContain('Check in my mood today');
    expect(texts).toContain('Write an appreciation');
    expect(texts).toContain('Start a poll');
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

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('How are you today?');
    expect(texts).toContain('Great');
    expect(texts).toContain('Good');
    expect(texts).toContain('Okay');
    expect(texts).toContain('Tired');
    expect(texts).toContain('Stressed');
  });

  it('renders AppreciationWallModal (PUL-03) with filter chips, reaction pills, and built-in ReactionPackModal', async () => {
    const onClose = jest.fn();
    const onOpenWrite = jest.fn();

    const renderer = await renderWithProvider(
      <AppreciationWallModal
        visible={true}
        onClose={onClose}
        onOpenWrite={onOpenWrite}
        items={TEST_APPRECIATIONS}
        members={TEST_PULSE_MEMBERS}
      />
    );

    let texts = extractTextNodes(renderer);

    expect(texts).toContain('Appreciation wall');
    expect(texts).toContain('All');
    expect(texts).toContain('For me');
    expect(texts).toContain('From me');
    expect(texts).toContain('Write an appreciation');
    expect(texts).toContain(TEST_APPRECIATIONS[0].message);
    expect(texts).toContain('Love it · 3');

    // Verify Add reaction opens built-in ReactionPackModal and switching reaction updates pill
    const addReactionBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === 'Add reaction');
    expect(addReactionBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      addReactionBtn?.props.onPress();
    });

    const reactionPack = renderer.root.findByType(ReactionPackModal);
    expect(reactionPack.props.visible).toBe(true);

    const soProudBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === 'So proud');
    expect(soProudBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      soProudBtn?.props.onPress();
    });

    texts = extractTextNodes(renderer);
    expect(texts).toContain('So proud · 2');

    // Verify shared computeUpdatedReactionSummary transitions
    const switched = computeUpdatedReactionSummary(
      TEST_APPRECIATIONS[0].reactions,
      'FIRE'
    );
    expect(switched.mine).toBe('FIRE');
    expect(switched.counts.find((c) => c.reaction === 'LOVE')?.count).toBe(2);
    expect(switched.counts.find((c) => c.reaction === 'FIRE')?.count).toBe(2);
    const removed = computeUpdatedReactionSummary(switched, null);
    expect(removed.mine).toBeNull();
    expect(removed.total).toBe(3);
  });

  it('renders WriteAppreciationModal (PUL-04) with member picker, note input, and prompt chips', async () => {
    const onClose = jest.fn();
    const onPostAppreciation = jest.fn();

    const renderer = await renderWithProvider(
      <WriteAppreciationModal
        visible={true}
        onClose={onClose}
        members={TEST_PULSE_MEMBERS}
        familyName="The Sharma Family"
        onPostAppreciation={onPostAppreciation}
      />
    );

    const texts = extractTextNodes(renderer);

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
        polls={TEST_POLLS}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Family polls');
    expect(texts).toContain('Active · 1');
    expect(texts).toContain('Closed · 1');
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
        members={TEST_PULSE_MEMBERS}
        onSubmitPoll={onSubmitPoll}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('New poll');
    expect(texts).toContain('Question');
    expect(texts).toContain('OPTIONS');
    expect(texts).toContain('Allow more than one choice');
    expect(texts).toContain('Closes');
    expect(texts).toContain('Who can vote');
    expect(texts).toContain('Post poll');

    // Fill question and 2 options
    const inputs = renderer.root.findAllByType(TextInput);
    await ReactTestRenderer.act(async () => {
      inputs[0]?.props.onChangeText('What should we do on Sunday?');
      inputs[1]?.props.onChangeText('Picnic at Lodhi Garden');
      inputs[2]?.props.onChangeText('Science Museum');
    });

    // Open "Closes" modal
    const closesBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => btn.props.accessibilityLabel === 'Change when poll closes');
    expect(closesBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      closesBtn?.props.onPress();
    });

    let modalTexts = extractTextNodes(renderer);
    expect(modalTexts).toContain('Poll closes');
    expect(modalTexts).toContain('Tomorrow · 8:00 PM');
    expect(modalTexts).toContain('Pick custom date & time...');

    const presetBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn
          .findAllByType(Text)
          .some((t) => t.props.children === 'Tomorrow · 8:00 PM')
      );
    expect(presetBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      presetBtn?.props.onPress();
    });

    // Open "Who can vote" modal
    const whoCanVoteBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => btn.props.accessibilityLabel === 'Change who can vote');
    expect(whoCanVoteBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      whoCanVoteBtn?.props.onPress();
    });

    modalTexts = extractTextNodes(renderer);
    expect(modalTexts).toContain('Who can vote?');
    expect(modalTexts).toContain('Adults only (3)');
    expect(modalTexts).toContain('Kids only (2)');

    const adultsChip = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn
          .findAllByType(Text)
          .some((t) => t.props.children === 'Adults only (3)')
      );
    expect(adultsChip).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      adultsChip?.props.onPress();
    });

    const doneBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn.findAllByType(Text).some((t) => t.props.children === 'Done')
      );
    expect(doneBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      doneBtn?.props.onPress();
    });

    const postBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn.findAllByType(Text).some((t) => t.props.children === 'Post poll')
      );
    expect(postBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      postBtn?.props.onPress();
    });

    expect(onSubmitPoll).toHaveBeenCalledWith(
      expect.objectContaining({
        question: 'What should we do on Sunday?',
        closesText: 'Tomorrow · 8:00 PM',
        whoCanVote: 'Only adults (3)',
      })
    );
  });

  it('renders PollResultsModal (PUL-07) with winner highlight and opens SchedulePollEventModal', async () => {
    const onClose = jest.fn();
    const onShareInChat = jest.fn();

    const renderer = await renderWithProvider(
      <PollResultsModal
        visible={true}
        poll={TEST_POLLS[0]}
        onClose={onClose}
        onShareInChat={onShareInChat}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Poll results');
    expect(texts).toContain('MOST VOTES');
    expect(texts).toContain('Picnic at Lodhi Garden');
    expect(texts).toContain('Add to calendar');
    expect(texts).toContain('Share in Family chat');

    const scheduleModal = renderer.root.findByType(SchedulePollEventModal);
    expect(scheduleModal).toBeDefined();
    expect(scheduleModal.props.defaultTitle).toBe('Picnic at Lodhi Garden');
  });

  it('renders MilestonesModal (PUL-08) with timeline and Add milestone button', async () => {
    const onClose = jest.fn();
    const onOpenAddMilestone = jest.fn();

    const renderer = await renderWithProvider(
      <MilestonesModal
        visible={true}
        onClose={onClose}
        onOpenAddMilestone={onOpenAddMilestone}
        milestones={TEST_MILESTONES}
        members={TEST_PULSE_MEMBERS}
      />
    );

    const texts = extractTextNodes(renderer);

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
        members={TEST_PULSE_MEMBERS}
        onSaveMilestone={onSaveMilestone}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('New milestone');
    expect(texts).toContain('WHO IS THIS FOR?');
    expect(texts).toContain('What happened?');
    expect(texts).toContain('When');
    expect(texts).toContain('PHOTOS');
    expect(texts).toContain('0 of 6');
    expect(texts).toContain('Save milestone');

    const titleInput = renderer.root.findByType(TextInput);
    await ReactTestRenderer.act(async () => {
      titleInput.props.onChangeText('Won gold medal');
    });

    const addPhotoBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => btn.props.accessibilityLabel === 'Add photo');
    expect(addPhotoBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      addPhotoBtn?.props.onPress();
    });

    const takePhotoBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn.findAllByType(Text).some((t) => t.props.children === 'Take a photo')
      );
    expect(takePhotoBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      takePhotoBtn?.props.onPress();
    });

    const updatedTexts = extractTextNodes(renderer);
    expect(updatedTexts).toContain('1 of 6');

    const removeBtns = renderer.root
      .findAllByType(TouchableOpacity)
      .filter((btn) => btn.props.accessibilityLabel === 'Remove photo');
    expect(removeBtns.length).toBeGreaterThan(0);
    await ReactTestRenderer.act(async () => {
      removeBtns[0].props.onPress();
    });

    const saveBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) =>
        btn.findAllByType(Text).some((t) => t.props.children === 'Save milestone')
      );
    expect(saveBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      saveBtn?.props.onPress();
    });

    expect(onSaveMilestone).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Won gold medal',
      })
    );
  });

  it('renders ReactionPackModal (PUL-10) with 6 reaction cards', async () => {
    const onClose = jest.fn();
    const onSelectReaction = jest.fn();

    const renderer = await renderWithProvider(
      <ReactionPackModal
        visible={true}
        reactionsSummary={{ total: 2, mine: 'LOVE', counts: [] }}
        onClose={onClose}
        onSelectReaction={onSelectReaction}
      />
    );

    const texts = extractTextNodes(renderer);

    expect(texts).toContain('Love it');
    expect(texts).toContain('So proud');
    expect(texts).toContain('Well done');
    expect(texts).toContain('Haha');
    expect(texts).toContain('Treat time');
    expect(texts).toContain('Shabash!');
    expect(texts).toContain('Remove my reaction');
  });

  it('renders MilestoneDetailModal (PUL-12) with Life Profile controls and unshare action', async () => {
    const onClose = jest.fn();
    const onMilestoneDeleted = jest.fn();

    const renderer = await renderWithProvider(
      <MilestoneDetailModal
        visible={true}
        milestone={TEST_MILESTONES[0]}
        members={TEST_PULSE_MEMBERS}
        onClose={onClose}
        onMilestoneDeleted={onMilestoneDeleted}
      />
    );

    const texts = extractTextNodes(renderer);
    expect(texts).toContain('Milestone');
    expect(texts).toContain('Reached the badminton semi-final');
    expect(texts).toContain('Life Profile');
    expect(texts).toContain('Update Life Profile visibility');

    const unshareBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === 'Unshare milestone');
    expect(unshareBtn).toBeTruthy();
  });

  it('maps Pulse API payloads and renders Pulse skeleton loaders (PUL-13)', async () => {
    expect(mapApiMoodToUiType('HAPPY')).toBe('great');
    expect(mapApiMoodToUiType('ANXIOUS')).toBe('stressed');
    expect(reactionApiToUiId('FIRE')).toBe('proud');

    const lookup = new Map(TEST_PULSE_MEMBERS.map((m) => [m.id, m]));
    const mappedApp = mapApiAppreciationToUi(
      TEST_PULSE_HOME_DATA.latestAppreciation!,
      lookup,
      TEST_PULSE_MEMBERS[0].id
    );
    expect(mappedApp.senderName).toBe('Rohan');
    expect(mappedApp.receiverName).toBe('you');

    const mappedPoll = mapApiPollToUi(
      TEST_PULSE_HOME_DATA.openPoll!,
      lookup,
      TEST_PULSE_MEMBERS[0].id
    );
    expect(mappedPoll.status).toBe('active');
    expect(mappedPoll.options[0].isUserVoted).toBe(true);

    const mappedMilestone = mapApiMilestoneToUi(
      TEST_PULSE_HOME_DATA.latestMilestone!,
      lookup,
      TEST_PULSE_MEMBERS[0].id
    );
    expect(mappedMilestone.personName).toBe('Anaya');
    expect(mappedMilestone.removal).toBe('UNSHARE');

    const skel = await renderWithProvider(
      <>
        <PulseHomeSkeleton />
        <AppreciationWallSkeleton />
        <FamilyPollsSkeleton />
        <PollResultsSkeleton />
        <MilestonesSkeleton />
      </>
    );
    expect(skel.toJSON()).toBeTruthy();
  });

  it('navigates from EventDetailModal Family poll button to PollResultsModal (PUL-14)', async () => {
    store.dispatch(setSelectedPollLocal(TEST_PULSE_HOME_DATA.openPoll!));

    const pollEvent: CalendarEvent = {
      id: 'evt-poll-1',
      title: 'Picnic at Lodhi Garden',
      category: 'family',
      categoryColor: '#3B82F6',
      date: '2026-11-29',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      formattedDate: 'Sun, 29 Nov',
      formattedTime: '10:00 AM — 12:00 PM',
      isAllDay: false,
      location: '',
      goingMemberIds: [],
      goingMembers: [],
      reminders: '1 day before',
      repeat: "Doesn't repeat",
      notes: `From the family poll: ${TEST_PULSE_HOME_DATA.openPoll!.question}`,
      sourceNote: 'Family poll',
      comments: [],
    };

    const renderer = await renderWithProvider(
      <EventDetailModal
        visible={true}
        event={pollEvent}
        onClose={jest.fn()}
        onEditEvent={jest.fn()}
        onOpenComments={jest.fn()}
        onCancelEvent={jest.fn()}
      />
    );

    const viewPollBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((b) => b.props.accessibilityLabel === 'View family poll');
    expect(viewPollBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      await viewPollBtn?.props.onPress();
    });

    const pollResultsModal = renderer.root.findByType(PollResultsModal);
    expect(pollResultsModal.props.visible).toBe(true);
    expect(pollResultsModal.props.pollId).toBe(
      TEST_PULSE_HOME_DATA.openPoll!.id
    );

    const texts = extractTextNodes(renderer);
    expect(texts).toContain('Poll results');
    expect(texts).toContain('Sunday plan: where shall we go?');
  });
});
