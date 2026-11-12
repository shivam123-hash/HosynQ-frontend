import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ChatsScreen,
  ChatConversationModal,
  ShareItemModal,
  QuickMessagesModal,
  SmartReactionsModal,
  ImageViewerModal,
  JustUsModal,
  EmptyChatScreen,
} from '../src/screens/mainScreens/chatScreen';

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

describe('Chat Flow & Screens (CHT-01 through CHT-11)', () => {
  it('renders ChatsScreen (CHT-01) with threads, search, private pill, and shared items', async () => {
    const onProfilePress = jest.fn();
    const onNotificationsPress = jest.fn();

    const renderer = await renderWithProvider(
      <ChatsScreen
        onProfilePress={onProfilePress}
        onNotificationsPress={onNotificationsPress}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    // Verify Title & Threads
    expect(texts).toContain('Chats');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Just Us');
    expect(texts).toContain('Private');

    // Verify Subtitles
    expect(texts).toContain('Anaya: Can someone pick me up after badminton?');
    expect(texts).toContain('Rohan: Booked the table for Saturday');

    // Verify Shared Section
    expect(texts).toContain('Shared in Family chat');
    expect(texts).toContain('Diwali shopping');
    expect(texts).toContain('Aarav’s PTM');
  });

  it('renders ChatConversationModal (CHT-02) in populated state with message bubbles and image', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ChatConversationModal
        visible={true}
        onClose={onClose}
        title="Family chat"
        memberCountText="5 members"
        isEmpty={false}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Family chat');
    expect(texts).toContain('5 members');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Diyas for tonight. Anaya, help me light them at 7?');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('I’ll be at the PTM by 2:55');
    expect(texts).toContain('Thanks! I’ll meet you at the gate.');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Can someone pick me up after badminton? Done by 7:30');
    expect(texts).toContain('I’ll ask Papa. He leaves office at 7.');
  });

  it('renders ChatConversationModal (CHT-04) with rich shared cards for lists, events and tasks', async () => {
    const onClose = jest.fn();

    const sampleMessages: any[] = [
      {
        id: 'c-1',
        senderId: 'dadi',
        senderName: 'Dadi',
        senderInitial: 'D',
        senderColor: '#253F2D',
        nameColor: '#9BD4A8',
        timeText: '1:15 PM',
        isYou: false,
        status: 'delivered',
        sharedItem: {
          type: 'list',
          title: 'Diwali shopping',
          subtitle: '6 of 14 done · 8 left',
          actionLabel: 'Open list',
        },
      },
      {
        id: 'c-2',
        senderId: 'you',
        senderName: 'You',
        senderInitial: 'P',
        senderColor: '#4A2E1A',
        nameColor: '#FFFFFF',
        timeText: '1:20 PM',
        isYou: true,
        status: 'delivered',
        sharedItem: {
          type: 'event',
          title: 'Aarav’s PTM',
          subtitle: 'Fri, 6 Nov · 3:00 PM · St. Mary’s School',
          actionLabel: 'Add to my calendar',
        },
      },
      {
        id: 'c-3',
        senderId: 'rohan',
        senderName: 'Rohan',
        senderInitial: 'R',
        senderColor: '#1F3A66',
        nameColor: '#8DB8F5',
        timeText: '1:32 PM',
        isYou: false,
        status: 'delivered',
        sharedItem: {
          type: 'task',
          title: 'Pay school bus fee',
          subtitle: 'Assigned to Rohan · Due Wed, 28 Oct',
          isOverdue: true,
          actionLabel: 'Mark done',
        },
      },
    ];

    const renderer = await renderWithProvider(
      <ChatConversationModal
        visible={true}
        onClose={onClose}
        initialMessages={sampleMessages}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    // Verify Cards
    expect(texts).toContain('LIST');
    expect(texts).toContain('Diwali shopping');
    expect(texts).toContain('Open list');

    expect(texts).toContain('EVENT');
    expect(texts).toContain('Aarav’s PTM');
    expect(texts).toContain('Add to my calendar');

    expect(texts).toContain('TASK');
    expect(texts).toContain('Overdue');
    expect(texts).toContain('Pay school bus fee');
    expect(texts).toContain('Mark done');
  });

  it('renders ChatConversationModal (CHT-08) in empty state with concentric circles and starters', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ChatConversationModal
        visible={true}
        onClose={onClose}
        isEmpty={true}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Say hello to your family');
    expect(texts).toContain('Good morning, everyone!');
    expect(texts).toContain('What’s for dinner?');
    expect(texts).toContain('Who’s home tonight?');
  });

  it('renders EmptyChatScreen (CHT-08 · Empty chat) standalone screen with exact UI elements and callbacks', async () => {
    const onBack = jest.fn();
    const onOptionsPress = jest.fn();
    const onSendMessage = jest.fn();
    const onPlusPress = jest.fn();
    const onCameraPress = jest.fn();
    const onMicPress = jest.fn();

    const renderer = await renderWithProvider(
      <EmptyChatScreen
        onBack={onBack}
        onOptionsPress={onOptionsPress}
        onSendMessage={onSendMessage}
        onPlusPress={onPlusPress}
        onCameraPress={onCameraPress}
        onMicPress={onMicPress}
        title="Family chat"
        memberCountText="5 members"
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    // Verify Header
    expect(texts).toContain('Family chat');
    expect(texts).toContain('5 members');

    // Verify Title & Subtitle & Chips
    expect(texts).toContain('Say hello to your family');
    expect(texts).toContain('Good morning, everyone!');
    expect(texts).toContain('What’s for dinner?');
    expect(texts).toContain('Who’s home tonight?');

    // Test tapping a chip sends the message
    const chipButtons = renderer.root.findAllByType(TouchableOpacity).filter((btn) => {
      const btnTexts = btn.findAllByType(Text).map((t) => t.props.children).flat();
      return btnTexts.includes('Good morning, everyone!');
    });
    expect(chipButtons.length).toBeGreaterThan(0);
    await ReactTestRenderer.act(async () => {
      chipButtons[0].props.onPress();
    });
    expect(onSendMessage).toHaveBeenCalledWith('Good morning, everyone!');

    // Test back button
    const backBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (btn) => btn.props.accessibilityLabel === 'Back'
    );
    expect(backBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(onBack).toHaveBeenCalled();

    // Test plus button
    const plusBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (btn) => btn.props.accessibilityLabel === 'Share options'
    );
    expect(plusBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      plusBtn?.props.onPress();
    });
    expect(onPlusPress).toHaveBeenCalled();

    // Test camera button
    const cameraBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (btn) => btn.props.accessibilityLabel === 'Camera'
    );
    expect(cameraBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      cameraBtn?.props.onPress();
    });
    expect(onCameraPress).toHaveBeenCalled();

    // Test mic button
    const micBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (btn) => btn.props.accessibilityLabel === 'Voice message'
    );
    expect(micBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      micBtn?.props.onPress();
    });
    expect(onMicPress).toHaveBeenCalled();
  });

  it('renders ChatConversationModal (CHT-09) with offline banner and retry link', async () => {
    const onClose = jest.fn();

    const sampleFailedMessages: any[] = [
      {
        id: 'fail-1',
        senderId: 'you',
        senderName: 'You',
        senderInitial: 'P',
        senderColor: '#4A2E1A',
        nameColor: '#FFFFFF',
        text: 'I’ll be home by 8:30. Keep mine warm please.',
        timeText: '8:10 PM',
        isYou: true,
        status: 'failed',
      },
    ];

    const renderer = await renderWithProvider(
      <ChatConversationModal
        visible={true}
        onClose={onClose}
        isOffline={true}
        initialMessages={sampleFailedMessages}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('No internet. Messages will send when you’re back online.');
    expect(texts).toContain('I’ll be home by 8:30. Keep mine warm please.');
    expect(texts).toContain('Not sent. ');
    expect(texts).toContain('Tap to retry');
  });

  it('renders ShareItemModal (CHT-03) and handles sharing items', async () => {
    const onClose = jest.fn();
    const onShareItem = jest.fn();

    const renderer = await renderWithProvider(
      <ShareItemModal
        visible={true}
        onClose={onClose}
        onShareItem={onShareItem}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Share in Family chat');
    expect(texts).toContain('Tasks');
    expect(texts).toContain('Events');
    expect(texts).toContain('Lists');
    expect(texts).toContain('Aarav’s PTM');
    expect(texts).toContain('Share 1 event');

    const shareBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => {
        const textNodes = btn.findAllByType(Text);
        return textNodes.some((t) => t.props.children === 'Share 1 event');
      });

    expect(shareBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      shareBtn?.props.onPress();
    });

    expect(onShareItem).toHaveBeenCalled();
  });

  it('renders QuickMessagesModal (CHT-05) and handles selection', async () => {
    const onClose = jest.fn();
    const onSelectQuickMessage = jest.fn();

    const renderer = await renderWithProvider(
      <QuickMessagesModal
        visible={true}
        onClose={onClose}
        onSelectQuickMessage={onSelectQuickMessage}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Quick messages');
    expect(texts).toContain('On my way');
    expect(texts).toContain('Running 10 minutes late');
    expect(texts).toContain('Reached safely');
    expect(texts).toContain('Can someone pick me up?');
    expect(texts).toContain('Call me when you’re free');
    expect(texts).toContain('Dinner’s ready');
    expect(texts).toContain('Edit quick messages');

    // Click "On my way"
    const onMyWayBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((btn) => {
        const textNodes = btn.findAllByType(Text);
        return textNodes.some((t) => t.props.children === 'On my way');
      });

    expect(onMyWayBtn).toBeTruthy();
    await ReactTestRenderer.act(async () => {
      onMyWayBtn?.props.onPress();
    });

    expect(onSelectQuickMessage).toHaveBeenCalledWith('On my way');
  });

  it('renders SmartReactionsModal (CHT-06) with emoji bar, quick replies, and AI conversions', async () => {
    const onClose = jest.fn();
    const onSelectReaction = jest.fn();
    const onSelectQuickReply = jest.fn();
    const onTurnIntoTask = jest.fn();
    const onTurnIntoReminder = jest.fn();
    const onReply = jest.fn();

    const sampleMessage: any = {
      id: 'sm-1',
      senderName: 'Anaya',
      text: 'Can someone pick me up after badminton? Done by 7:30',
      timeText: '2:40 PM',
      isYou: false,
    };

    const renderer = await renderWithProvider(
      <SmartReactionsModal
        visible={true}
        message={sampleMessage}
        onClose={onClose}
        onSelectReaction={onSelectReaction}
        onSelectQuickReply={onSelectQuickReply}
        onTurnIntoTask={onTurnIntoTask}
        onTurnIntoReminder={onTurnIntoReminder}
        onReply={onReply}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Smart reactions');
    expect(texts).toContain('QUICK REPLIES');
    expect(texts).toContain('I’ll get you at 7:30');
    expect(texts).toContain('Papa will pick you up');
    expect(texts).toContain('Take an auto, share ETA');
    expect(texts).toContain('TURN INTO');
    expect(texts).toContain('Task: Pick up Anaya at 7:30 PM');
    expect(texts).toContain('Reminder: Leave office at 7:05 PM');
    expect(texts).toContain('Reply');
    expect(texts).toContain('Copy');
  });

  it('renders ImageViewerModal (CHT-07) with caption and action buttons', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ImageViewerModal
        visible={true}
        onClose={onClose}
        senderName="Dadi"
        timestamp="Today, 1:15 PM"
        caption="Diyas for tonight. Anaya, help me light them at 7?"
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Dadi');
    expect(texts).toContain('Today, 1:15 PM');
    expect(texts).toContain('Diyas for tonight. Anaya, help me light them at 7?');
    expect(texts).toContain('Save to Vault');
    expect(texts).toContain('Share');
    expect(texts).toContain('Reply');
    expect(texts).toContain('Save to phone');
  });

  it('renders JustUsModal (CHT-10) in available private conversation mode', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <JustUsModal
        visible={true}
        onClose={onClose}
        isAvailable={true}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Just Us');
    expect(texts).toContain('You and Rohan · Private');
    expect(texts).toContain('Private and encrypted. Children can’t see this chat, and it never appears in Pulse.');
    expect(texts).toContain('Anniversary is on the 21st. Should we plan something?');
    expect(texts).toContain('Yes! Lonavala for the weekend?');
    expect(texts).toContain('Booked the table for Saturday. Don’t tell the kids!');
    expect(texts).toContain('Perfect. I’ll ask Dadi to babysit.');
  });

  it('renders JustUsModal (CHT-11) in unavailable decision mode', async () => {
    const onClose = jest.fn();
    const onInvitePartner = jest.fn();
    const onHideJustUs = jest.fn();

    const renderer = await renderWithProvider(
      <JustUsModal
        visible={true}
        onClose={onClose}
        isAvailable={false}
        onInvitePartner={onInvitePartner}
        onHideJustUs={onHideJustUs}
      />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Just Us');
    expect(texts).toContain('Needs decision: what single parents, or families without a couple, see here.');
    expect(texts).toContain('Just Us is for couples');
    expect(texts).toContain('Invite your partner');
    expect(texts).toContain('Hide Just Us');
  });
});
