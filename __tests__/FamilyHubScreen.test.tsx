import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux/store';
import { setMyFamilyData } from '../src/redux/features/family/familySlice';
import { FamilyHubModal } from '../src/screens/mainScreens/familyPulse/FamilyHubModal';
import { FamilyHubSkeleton } from '../src/components/SkeletonLoader';

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

describe('FAM-01 · Family Hub Modal (Dynamic GET /api/v1/family/my-family API)', () => {
  const MOCK_API_FAMILY = {
    id: 'fam-3a7b1c2e',
    name: 'The Sharma Family',
    familyCode: 'HSQ-4821',
    memberCount: 5,
    myRole: 'FAMILY_OWNER',
    myMemberId: 'mem-priya',
    pendingRequestCount: 1,
    members: [
      {
        memberId: 'mem-priya',
        fullName: 'Priya Sharma',
        isYou: true,
        hasAccount: true,
        role: 'FAMILY_OWNER',
        familyRole: 'MOTHER',
        avatarColor: '#5C3A21',
      },
      {
        memberId: 'mem-rohan',
        fullName: 'Rohan Sharma',
        isYou: false,
        hasAccount: true,
        role: 'FAMILY_ADMIN',
        familyRole: 'FATHER',
        avatarColor: '#1F3A66',
      },
      {
        memberId: 'mem-anaya',
        fullName: 'Anaya Sharma',
        isYou: false,
        hasAccount: true,
        role: 'ADULT_MEMBER',
        familyRole: 'DAUGHTER',
        avatarColor: '#6E2042',
      },
      {
        memberId: 'mem-aarav',
        fullName: 'Aarav Sharma',
        isYou: false,
        hasAccount: false,
        age: 9,
        role: 'DEPENDENT_CHILD_PROFILE',
        familyRole: 'SON',
        avatarColor: '#5A4E1B',
      },
      {
        memberId: 'mem-dadi',
        fullName: 'Dadi',
        isYou: false,
        hasAccount: false,
        age: 68,
        role: 'ADULT_MEMBER',
        familyRole: 'GRANDMOTHER',
        avatarColor: '#24422E',
      },
    ],
  };

  beforeEach(() => {
    jest.useFakeTimers();
    store.dispatch(
      setMyFamilyData({
        inFamily: true,
        family: MOCK_API_FAMILY,
        pendingRequest: null,
      } as any)
    );
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders dynamic family card: avatar initial, name, member count, owner label, and family code', async () => {
    const renderer = await renderWithProvider(
      <FamilyHubModal visible={true} onClose={jest.fn()} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    // Family Card
    expect(texts).toContain('T'); // "The Sharma Family" initial
    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain('5 members · Owner: you');
    expect(texts).toContain('HSQ-4821');
  });

  it('renders dynamic horizontal members avatars: first names, smart initials, and location statuses', async () => {
    const renderer = await renderWithProvider(
      <FamilyHubModal visible={true} onClose={jest.fn()} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    // Dynamic Member First Names
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Dadi');

    // Dynamic Smart Initials
    expect(texts).toContain('P');
    expect(texts).toContain('R');
    expect(texts).toContain('A');
    expect(texts).toContain('Aa');
    expect(texts).toContain('D');

    // Location / Status subtitles
    expect(texts).toContain('You');
    expect(texts).toContain('Office');
    expect(texts).toContain('School');
    expect(texts).toContain('Home');

    // "+ Add" button
    expect(texts).toContain('Add');
  });

  it('copies family code to clipboard with alert feedback when family ID badge is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const renderer = await renderWithProvider(
      <FamilyHubModal visible={true} onClose={jest.fn()} />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const copyBadge = buttons.find((b) =>
      b.props.accessibilityLabel === 'Copy Family ID HSQ-4821'
    );
    expect(copyBadge).toBeDefined();

    await ReactTestRenderer.act(async () => {
      copyBadge?.props.onPress();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Copied',
      'Family ID HSQ-4821 copied to clipboard'
    );
    alertSpy.mockRestore();
  });

  it('triggers onOpenMembers when member avatar or Members grid card is tapped', async () => {
    const onOpenMembers = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyHubModal
        visible={true}
        onClose={jest.fn()}
        onOpenMembers={onOpenMembers}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Tap Priya avatar item
    const priyaBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Priya, You'
    );
    expect(priyaBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      priyaBtn?.props.onPress();
    });
    expect(onOpenMembers).toHaveBeenCalledTimes(1);

    // Tap Members 2x2 grid tile
    const membersGridTile = buttons.find(
      (b) => b.props.accessibilityLabel === 'Members, 1 join request to review'
    );
    expect(membersGridTile).toBeDefined();

    await ReactTestRenderer.act(async () => {
      membersGridTile?.props.onPress();
    });
    expect(onOpenMembers).toHaveBeenCalledTimes(2);
  });

  it('triggers onInviteMember when + Add button or header invite button is tapped', async () => {
    const onInviteMember = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyHubModal
        visible={true}
        onClose={jest.fn()}
        onInviteMember={onInviteMember}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // + Add member item in avatars row
    const addBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Add family member'
    );
    expect(addBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      addBtn?.props.onPress();
    });
    expect(onInviteMember).toHaveBeenCalledTimes(1);

    // Header invite button
    const headerInviteBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Invite member to The Sharma Family'
    );
    expect(headerInviteBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      headerInviteBtn?.props.onPress();
    });
    expect(onInviteMember).toHaveBeenCalledTimes(2);
  });
});
