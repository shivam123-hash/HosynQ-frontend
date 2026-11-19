import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MembersModal } from '../src/screens/mainScreens/familyPulse/MembersModal';
import { FamilyHubModal } from '../src/screens/mainScreens/familyPulse/FamilyHubModal';
import { JoinRequestsModal } from '../src/screens/mainScreens/familyPulse/JoinRequestsModal';
import { JoinRequestsScreen } from '../src/screens/mainScreens/familyPulse/JoinRequestsScreen';
import { InviteAdultModal } from '../src/screens/mainScreens/familyPulse/InviteAdultModal';
import { InviteAdultScreen } from '../src/screens/mainScreens/familyPulse/InviteAdultScreen';
import { InvitationSentModal } from '../src/screens/mainScreens/familyPulse/InvitationSentModal';
import { InvitationSentScreen } from '../src/screens/mainScreens/familyPulse/InvitationSentScreen';
import { AddChildModal } from '../src/screens/mainScreens/familyPulse/AddChildModal';
import { AddChildScreen } from '../src/screens/mainScreens/familyPulse/AddChildScreen';
import { ChangeRoleModal } from '../src/screens/mainScreens/familyPulse/ChangeRoleModal';
import { ChangeRoleScreen } from '../src/screens/mainScreens/familyPulse/ChangeRoleScreen';
import { FamilyActionConfirmationModal } from '../src/screens/mainScreens/familyPulse/FamilyActionConfirmationModal';
import { FamilyActionConfirmationScreen } from '../src/screens/mainScreens/familyPulse/FamilyActionConfirmationScreen';
import { TransferOwnershipModal } from '../src/screens/mainScreens/familyPulse/TransferOwnershipModal';
import { TransferOwnershipScreen } from '../src/screens/mainScreens/familyPulse/TransferOwnershipScreen';
import { DeleteFamilyModal } from '../src/screens/mainScreens/familyPulse/DeleteFamilyModal';
import { DeleteFamilyScreen } from '../src/screens/mainScreens/familyPulse/DeleteFamilyScreen';
import { StaffModal } from '../src/screens/mainScreens/familyPulse/StaffModal';
import { StaffScreen } from '../src/screens/mainScreens/familyPulse/StaffScreen';

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

describe('MEM-01 · Members Screen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders Members screen header, family card, join banner, member list and action buttons matching Figma design', async () => {
    const onClose = jest.fn();
    const onInviteSomeone = jest.fn();
    const onAddChildProfile = jest.fn();
    const onSelectMember = jest.fn();
    const onReviewJoinRequests = jest.fn();

    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={onClose}
        onInviteSomeone={onInviteSomeone}
        onAddChildProfile={onAddChildProfile}
        onSelectMember={onSelectMember}
        onReviewJoinRequests={onReviewJoinRequests}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    // Header & Family ID
    expect(texts).toContain('Members');
    expect(texts).toContain('The Sharma Family');
    expect(texts).toContain('Family ID HSQ-4821');

    // Join Request Banner
    expect(texts).toContain('1 person is waiting to join');

    // Section Header
    expect(texts).toContain('MEMBERS · 5');

    // Members Names
    expect(texts).toContain('Priya (you)');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');

    // Members Roles / Relations
    expect(texts).toContain('Mother');
    expect(texts).toContain('Father');
    expect(texts).toContain('Grandmother');
    expect(texts).toContain('Daughter · 15');
    expect(texts).toContain('Son · 9');

    // Badges
    expect(texts).toContain('Owner');
    expect(texts).toContain('Admin');
    expect(texts).toContain('Adult');
    expect(texts.filter((t) => t === 'Child').length).toBe(2);

    // Bottom Pinned Buttons
    expect(texts).toContain('Invite someone');
    expect(texts).toContain('Add a child profile');
  });

  it('triggers interactive callbacks for back, add, join banner, member selection and bottom buttons', async () => {
    const onClose = jest.fn();
    const onInviteSomeone = jest.fn();
    const onAddChildProfile = jest.fn();
    const onSelectMember = jest.fn();
    const onReviewJoinRequests = jest.fn();

    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={onClose}
        onInviteSomeone={onInviteSomeone}
        onAddChildProfile={onAddChildProfile}
        onSelectMember={onSelectMember}
        onReviewJoinRequests={onReviewJoinRequests}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // 1. Back button
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();

    // 2. Add member header button
    const addMemberHeaderBtn = buttons.find((b) => b.props.accessibilityLabel === 'Add member');
    expect(addMemberHeaderBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      addMemberHeaderBtn?.props.onPress();
    });
    expect(onInviteSomeone).toHaveBeenCalled();

    // 3. Copy family ID button
    const copyBtn = buttons.find((b) => b.props.accessibilityLabel === 'Copy Family ID HSQ-4821');
    expect(copyBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      copyBtn?.props.onPress();
    });
    const toast = renderer.root.findAllByType(Text).find((t) =>
      typeof t.props.children === 'string' && t.props.children.includes('copied to clipboard')
    );
    expect(toast).toBeDefined();

    // 4. Join request banner
    const joinBanner = buttons.find((b) => b.props.accessibilityLabel === '1 person is waiting to join');
    expect(joinBanner).toBeDefined();
    await ReactTestRenderer.act(async () => {
      joinBanner?.props.onPress();
    });
    expect(onReviewJoinRequests).toHaveBeenCalled();

    // 5. Select a member row
    const rohanRow = buttons.find((b) =>
      typeof b.props.accessibilityLabel === 'string' && b.props.accessibilityLabel.includes('Rohan')
    );
    expect(rohanRow).toBeDefined();
    await ReactTestRenderer.act(async () => {
      rohanRow?.props.onPress();
    });
    expect(onSelectMember).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rohan', name: 'Rohan', role: 'Admin' })
    );

    // 6. Invite someone bottom button
    const inviteBottomBtn = buttons.find((b) => b.props.accessibilityLabel === 'Invite someone');
    expect(inviteBottomBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      inviteBottomBtn?.props.onPress();
    });
    expect(onInviteSomeone).toHaveBeenCalledTimes(2);

    // 7. Add child profile bottom button
    const addChildBtn = buttons.find((b) => b.props.accessibilityLabel === 'Add a child profile');
    expect(addChildBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      addChildBtn?.props.onPress();
    });
    expect(onAddChildProfile).toHaveBeenCalled();
  });

  it('opens AddChildModal internally when tapping Add a child profile without external callback', async () => {
    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={jest.fn()}
      />
    );

    const addChildBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (b) => b.props.accessibilityLabel === 'Add a child profile'
    );
    expect(addChildBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      addChildBtn?.props.onPress();
    });

    const addChildModal = renderer.root.findAllByType(AddChildModal).find(
      (m) => m.props.visible === true
    );
    expect(addChildModal).toBeDefined();
  });

  it('opens Leave Family confirmation dialog when tapping Leave family', async () => {
    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={jest.fn()}
      />
    );

    const leaveBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (b) => b.props.accessibilityLabel === 'Leave family'
    );
    expect(leaveBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      leaveBtn?.props.onPress();
    });

    const actionModal = renderer.root.findAllByType(FamilyActionConfirmationModal).find(
      (m) => m.props.visible === true && m.props.type === 'leave_family'
    );
    expect(actionModal).toBeDefined();
  });

  it('opens DeleteFamilyModal when tapping Delete family', async () => {
    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={jest.fn()}
      />
    );

    const deleteBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (b) => b.props.accessibilityLabel === 'Delete family'
    );
    expect(deleteBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      deleteBtn?.props.onPress();
    });

    const deleteModal = renderer.root.findAllByType(DeleteFamilyModal).find(
      (m) => m.props.visible === true
    );
    expect(deleteModal).toBeDefined();
  });

  it('opens StaffModal when tapping Staff section', async () => {
    const renderer = await renderWithProvider(
      <MembersModal
        visible={true}
        onClose={jest.fn()}
      />
    );

    const staffBtn = renderer.root.findAllByType(TouchableOpacity).find(
      (b) => b.props.accessibilityLabel === 'Staff, Drivers and house help'
    );
    expect(staffBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      staffBtn?.props.onPress();
    });

    const staffModal = renderer.root.findAllByType(StaffModal).find(
      (m) => m.props.visible === true
    );
    expect(staffModal).toBeDefined();
  });

  it('can be opened from FamilyHubModal when tapping Members card', async () => {
    const onOpenMembers = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyHubModal
        visible={true}
        onClose={jest.fn()}
        onOpenMembers={onOpenMembers}
      />
    );

    const membersCard = renderer.root.findAllByType(TouchableOpacity).find(
      (b) => b.props.accessibilityLabel === 'Members, 1 join request to review'
    );
    expect(membersCard).toBeDefined();

    await ReactTestRenderer.act(async () => {
      membersCard?.props.onPress();
    });
    expect(onOpenMembers).toHaveBeenCalled();
  });
});

describe('MEM-02 · Join Requests Screen', () => {
  it('renders Join requests header, descriptions, Meera Sharma card, unknown number card, role chips and action buttons', async () => {
    const onClose = jest.fn();
    const onApprove = jest.fn();
    const onDecline = jest.fn();

    const renderer = await renderWithProvider(
      <JoinRequestsModal
        visible={true}
        onClose={onClose}
        onApprove={onApprove}
        onDecline={onDecline}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    expect(texts).toContain('Join requests');
    expect(texts).toContain('These people asked to join using your family ID HSQ-4821.');

    // Card 1: Meera Sharma
    expect(texts).toContain('Meera Sharma');
    expect(texts).toContain('+91 98··· ··210 · 2 hours ago');
    expect(
      texts.some(
        (t) =>
          typeof t === 'string' &&
          (t.includes("Hi! I'm Rohan's sister.") || t === "“Hi! I'm Rohan's sister.”")
      )
    ).toBe(true);

    // Card 2: Unknown number
    expect(texts).toContain('Unknown number');
    expect(texts).toContain('+91 70··· ··881 · Yesterday');
    expect(
      texts.some(
        (t) =>
          typeof t === 'string' &&
          t.includes("We don't recognise this number. Check with your family before approving.")
      )
    ).toBe(true);

    // Role selection and actions
    expect(texts.filter((t) => t === 'Adult').length).toBe(2);
    expect(texts.filter((t) => t === 'Admin').length).toBe(2);
    expect(texts.filter((t) => t === 'Decline').length).toBe(2);
    expect(texts.filter((t) => t === 'Approve').length).toBe(2);

    // Footer notice
    expect(texts).toContain('Only the Owner and Admins can approve requests.');
  });

  it('handles role switching, back button, approve and decline actions', async () => {
    const onClose = jest.fn();
    const onApprove = jest.fn();
    const onDecline = jest.fn();

    const renderer = await renderWithProvider(
      <JoinRequestsModal
        visible={true}
        onClose={onClose}
        onApprove={onApprove}
        onDecline={onDecline}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Back button
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();

    // Switch role to Admin for Meera
    const adminChip = buttons.find(
      (b) => b.props.accessibilityLabel === 'Join as Admin for Meera Sharma'
    );
    expect(adminChip).toBeDefined();
    await ReactTestRenderer.act(async () => {
      adminChip?.props.onPress();
    });

    // Approve Meera
    const approveBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Approve Meera Sharma'
    );
    expect(approveBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      approveBtn?.props.onPress();
    });
    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Meera Sharma', role: 'Admin' })
    );

    // Decline Unknown number
    const declineBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Decline Unknown number'
    );
    expect(declineBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      declineBtn?.props.onPress();
    });
    expect(onDecline).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Unknown number' })
    );
  });

  it('renders JoinRequestsScreen directly and triggers back navigation', async () => {
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();
    const mockCanGoBack = jest.fn().mockReturnValue(true);

    const renderer = await renderWithProvider(
      <JoinRequestsScreen
        navigation={
          {
            navigate: mockNavigate,
            goBack: mockGoBack,
            canGoBack: mockCanGoBack,
          } as any
        }
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Join requests');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    expect(backBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});




describe('MEM-07 · Family Action Confirmation Modal (Reusable Modal)', () => {
  it('renders Variant 1: Remove Dadi from the family with coral button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="remove_member"
        memberName="Dadi"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');
    expect(texts).toContain(
      'Dadi will lose access to shared tasks, calendar, chat and Family Vault. Things she added will stay.'
    );
    expect(texts).toContain('Remove Dadi');
    expect(texts).toContain('Cancel');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const confirmBtn = buttons.find((b) => b.props.accessibilityLabel === 'Remove Dadi');
    expect(confirmBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      confirmBtn?.props.onPress();
    });
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Variant 2: Leave The Sharma Family with coral button and stay link', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="leave_family"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Leave The Sharma Family?');
    expect(texts).toContain(
      'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.'
    );
    expect(texts).toContain('Leave family');
    expect(texts).toContain('Stay');
  });

  it('renders Variant 3: Make someone else Owner first with orange transfer button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="transfer_owner_required"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Make someone else Owner first');
    expect(texts).toContain(
      'You’re the Owner of The Sharma Family. Transfer ownership to another adult before you leave.'
    );
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain('Cancel');
  });

  it('renders FamilyActionConfirmationScreen directly and switches variants', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyActionConfirmationScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const leaveTab = buttons.find((b) => {
      const child = b.props.children;
      return Array.isArray(child)
        ? child.some((c) => c?.props?.children === 'Leave Family')
        : child?.props?.children === 'Leave Family';
    });
    expect(leaveTab).toBeDefined();

    await ReactTestRenderer.act(async () => {
      leaveTab?.props.onPress();
    });

    const updatedTexts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(updatedTexts).toContain('Leave The Sharma Family?');
  });
});

describe('MEM-08 · Transfer Ownership Screen', () => {
  it('renders Transfer ownership header, candidate list, warning box and action button', async () => {
    const onClose = jest.fn();
    const onTransferComplete = jest.fn();








    const renderer = await renderWithProvider(
      <TransferOwnershipModal
        onClose={onClose}
        onTransferComplete={onTransferComplete}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain(
      'Pick an adult to become the new Owner. You’ll become an Admin.'
    );
    expect(texts).toContain('NEW OWNER');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('What changes');
    expect(texts).toContain('We’ll send an OTP to your phone to confirm.');
    expect(texts).toContain('Transfer to Rohan');
  });

  it('allows selecting Dadi and updating warning/button', async () => {
    const renderer = await renderWithProvider(
      <TransferOwnershipModal onClose={jest.fn()} />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const dadiBtn = buttons.find((b) => b.props.accessibilityLabel === 'Dadi, Adult');
    expect(dadiBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      dadiBtn?.props.onPress();
    });

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer to Dadi');
  });

  it('renders TransferOwnershipScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <TransferOwnershipScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-09 · Delete Family Screen', () => {
  it('renders Delete family header, owner badge, deletion items, and confirmation input', async () => {
    const onClose = jest.fn();
    const onDeleteFamily = jest.fn();

    const renderer = await renderWithProvider(
      <DeleteFamilyModal
        familyName="The Sharma Family"
        onClose={onClose}
        onDeleteFamily={onDeleteFamily}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Owner only');
    expect(texts).toContain('Delete The Sharma Family?');
    expect(texts).toContain('WHAT GETS DELETED');
    expect(texts).toContain('All tasks, events and lists');
    expect(texts).toContain('Family chat and Just Us');
    expect(texts).toContain('Everything in Family Vault');
    expect(texts).toContain('Children’s Life Profiles');
    expect(texts).toContain('Type DELETE to confirm');
    expect(texts).toContain('Download your family’s data first');
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Cancel');
  });

  it('renders DeleteFamilyScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <DeleteFamilyScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-10 · Staff Screen', () => {
  it('renders Staff header, proposed notice, staff list, permissions toggles, and add staff button', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <StaffModal onClose={onClose} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Staff');
    expect(texts).toContain('Proposed · Reserved for later, not in V1.');
    expect(texts).toContain('Give drivers and house help only what they need to see.');
    expect(texts).toContain('Ramesh');
    expect(texts).toContain('Driver');
    expect(texts).toContain('Sunita');
    expect(texts).toContain('House help');
    expect(texts).toContain('WHAT RAMESH CAN SEE');
    expect(texts).toContain('Pickups and drop-offs');
    expect(texts).toContain('Family calendar');
    expect(texts).toContain('Live location');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Add staff');
  });

  it('renders StaffScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <StaffScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});



describe('MEM-03 · Invite an Adult Screen', () => {
  it('renders Invite an adult header, segmented tabs, phone input, name input, role selection and share link card', async () => {
    const onClose = jest.fn();
    const onSendInvite = jest.fn();
    const onShareInviteLink = jest.fn();

    const renderer = await renderWithProvider(
      <InviteAdultModal
        visible={true}
        onClose={onClose}
        onSendInvite={onSendInvite}
        onShareInviteLink={onShareInviteLink}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    expect(texts).toContain('Invite an adult');
    expect(texts).toContain('Mobile number');
    expect(texts).toContain('Email');
    expect(texts).toContain('Their name (optional)');
    expect(texts).toContain('ROLE');
    expect(texts).toContain('Adult');
    expect(texts).toContain('Admin');
    expect(texts).toContain(
      'Adults use everything. Admins can also manage members and approve requests.'
    );
    expect(texts).toContain('Share an invite link instead');
    expect(texts).toContain('Anyone with the link can ask to join');
    expect(texts).toContain('Send invite');
  });

  it('handles tab switching, role selection, share invite link and send invite', async () => {
    const onClose = jest.fn();
    const onSendInvite = jest.fn();
    const onShareInviteLink = jest.fn();

    const renderer = await renderWithProvider(
      <InviteAdultModal
        visible={true}
        onClose={onClose}
        onSendInvite={onSendInvite}
        onShareInviteLink={onShareInviteLink}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Close button
    const closeBtn = buttons.find((b) => b.props.accessibilityLabel === 'Close');
    expect(closeBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      closeBtn?.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();

    // Switch to Email tab
    const emailTab = buttons.find((b) => b.props.accessibilityLabel === 'Email');
    expect(emailTab).toBeDefined();
    await ReactTestRenderer.act(async () => {
      emailTab?.props.onPress();
    });

    // Switch to Mobile number tab
    const mobileTab = buttons.find((b) => b.props.accessibilityLabel === 'Mobile number');
    expect(mobileTab).toBeDefined();
    await ReactTestRenderer.act(async () => {
      mobileTab?.props.onPress();
    });

    // Select Admin role
    const adminRoleBtn = buttons.find((b) => b.props.accessibilityLabel === 'Role Admin');
    expect(adminRoleBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      adminRoleBtn?.props.onPress();
    });

    // Share link card
    const shareLinkBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Share an invite link instead'
    );
    expect(shareLinkBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      shareLinkBtn?.props.onPress();
    });
    expect(onShareInviteLink).toHaveBeenCalled();

    // Send invite button
    const sendBtn = buttons.find((b) => b.props.accessibilityLabel === 'Send invite');
    expect(sendBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      sendBtn?.props.onPress();
    });
    expect(onSendInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'mobile',
        contact: '98765 43210',
        name: 'Meera',
        role: 'Admin',
      })
    );
  });

  it('renders InviteAdultScreen directly and triggers back navigation', async () => {
    const mockNavigate = jest.fn();
    const mockGoBack = jest.fn();
    const mockCanGoBack = jest.fn().mockReturnValue(true);

    const renderer = await renderWithProvider(
      <InviteAdultScreen
        navigation={
          {
            navigate: mockNavigate,
            goBack: mockGoBack,
            canGoBack: mockCanGoBack,
          } as any
        }
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Invite an adult');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const closeBtn = buttons.find((b) => b.props.accessibilityLabel === 'Close');
    expect(closeBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      closeBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});




describe('MEM-07 · Family Action Confirmation Modal (Reusable Modal)', () => {
  it('renders Variant 1: Remove Dadi from the family with coral button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="remove_member"
        memberName="Dadi"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');
    expect(texts).toContain(
      'Dadi will lose access to shared tasks, calendar, chat and Family Vault. Things she added will stay.'
    );
    expect(texts).toContain('Remove Dadi');
    expect(texts).toContain('Cancel');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const confirmBtn = buttons.find((b) => b.props.accessibilityLabel === 'Remove Dadi');
    expect(confirmBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      confirmBtn?.props.onPress();
    });
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Variant 2: Leave The Sharma Family with coral button and stay link', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="leave_family"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Leave The Sharma Family?');
    expect(texts).toContain(
      'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.'
    );
    expect(texts).toContain('Leave family');
    expect(texts).toContain('Stay');
  });

  it('renders Variant 3: Make someone else Owner first with orange transfer button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="transfer_owner_required"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Make someone else Owner first');
    expect(texts).toContain(
      'You’re the Owner of The Sharma Family. Transfer ownership to another adult before you leave.'
    );
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain('Cancel');
  });

  it('renders FamilyActionConfirmationScreen directly and switches variants', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyActionConfirmationScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const leaveTab = buttons.find((b) => {
      const child = b.props.children;
      return Array.isArray(child)
        ? child.some((c) => c?.props?.children === 'Leave Family')
        : child?.props?.children === 'Leave Family';
    });
    expect(leaveTab).toBeDefined();

    await ReactTestRenderer.act(async () => {
      leaveTab?.props.onPress();
    });

    const updatedTexts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(updatedTexts).toContain('Leave The Sharma Family?');
  });
});

describe('MEM-08 · Transfer Ownership Screen', () => {
  it('renders Transfer ownership header, candidate list, warning box and action button', async () => {
    const onClose = jest.fn();
    const onTransferComplete = jest.fn();








    const renderer = await renderWithProvider(
      <TransferOwnershipModal
        onClose={onClose}
        onTransferComplete={onTransferComplete}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain(
      'Pick an adult to become the new Owner. You’ll become an Admin.'
    );
    expect(texts).toContain('NEW OWNER');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('What changes');
    expect(texts).toContain('We’ll send an OTP to your phone to confirm.');
    expect(texts).toContain('Transfer to Rohan');
  });

  it('allows selecting Dadi and updating warning/button', async () => {
    const renderer = await renderWithProvider(
      <TransferOwnershipModal onClose={jest.fn()} />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const dadiBtn = buttons.find((b) => b.props.accessibilityLabel === 'Dadi, Adult');
    expect(dadiBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      dadiBtn?.props.onPress();
    });

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer to Dadi');
  });

  it('renders TransferOwnershipScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <TransferOwnershipScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-09 · Delete Family Screen', () => {
  it('renders Delete family header, owner badge, deletion items, and confirmation input', async () => {
    const onClose = jest.fn();
    const onDeleteFamily = jest.fn();

    const renderer = await renderWithProvider(
      <DeleteFamilyModal
        familyName="The Sharma Family"
        onClose={onClose}
        onDeleteFamily={onDeleteFamily}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Owner only');
    expect(texts).toContain('Delete The Sharma Family?');
    expect(texts).toContain('WHAT GETS DELETED');
    expect(texts).toContain('All tasks, events and lists');
    expect(texts).toContain('Family chat and Just Us');
    expect(texts).toContain('Everything in Family Vault');
    expect(texts).toContain('Children’s Life Profiles');
    expect(texts).toContain('Type DELETE to confirm');
    expect(texts).toContain('Download your family’s data first');
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Cancel');
  });

  it('renders DeleteFamilyScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <DeleteFamilyScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-10 · Staff Screen', () => {
  it('renders Staff header, proposed notice, staff list, permissions toggles, and add staff button', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <StaffModal onClose={onClose} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Staff');
    expect(texts).toContain('Proposed · Reserved for later, not in V1.');
    expect(texts).toContain('Give drivers and house help only what they need to see.');
    expect(texts).toContain('Ramesh');
    expect(texts).toContain('Driver');
    expect(texts).toContain('Sunita');
    expect(texts).toContain('House help');
    expect(texts).toContain('WHAT RAMESH CAN SEE');
    expect(texts).toContain('Pickups and drop-offs');
    expect(texts).toContain('Family calendar');
    expect(texts).toContain('Live location');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Add staff');
  });

  it('renders StaffScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <StaffScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});



describe('MEM-04 · Invitation Sent Screen', () => {
  it('renders Invite sent to Meera header, description, member card, and action buttons', async () => {
    const onClose = jest.fn();
    const onShareLink = jest.fn();
    const onInviteAnother = jest.fn();

    const renderer = await renderWithProvider(
      <InvitationSentModal
        visible={true}
        onClose={onClose}
        inviteeName="Meera"
        inviteePhone="+91 98765 43210"
        onShareLink={onShareLink}
        onInviteAnother={onInviteAnother}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    expect(texts).toContain('Invite sent to Meera');
    expect(
      texts.some(
        (t) =>
          typeof t === 'string' &&
          t.includes('We texted +91 98765 43210. The invite works')
      )
    ).toBe(true);
    expect(texts).toContain('Meera');
    expect(texts).toContain('Adult · Invited just now');
    expect(texts).toContain('Waiting');
    expect(texts).toContain('Done');
    expect(texts).toContain('Share invite link');
    expect(texts).toContain('Invite someone else');
  });

  it('triggers action callbacks for Done, Share invite link, and Invite someone else', async () => {
    const onClose = jest.fn();
    const onShareLink = jest.fn();
    const onInviteAnother = jest.fn();

    const renderer = await renderWithProvider(
      <InvitationSentModal
        visible={true}
        onClose={onClose}
        onShareLink={onShareLink}
        onInviteAnother={onInviteAnother}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Done button
    const doneBtn = buttons.find((b) => b.props.accessibilityLabel === 'Done');
    expect(doneBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      doneBtn?.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();

    // Share link button
    const shareBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Share invite link'
    );
    expect(shareBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      shareBtn?.props.onPress();
    });
    expect(onShareLink).toHaveBeenCalled();

    // Invite someone else button
    const inviteAnotherBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Invite someone else'
    );
    expect(inviteAnotherBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      inviteAnotherBtn?.props.onPress();
    });
    expect(onInviteAnother).toHaveBeenCalled();
  });

  it('renders InvitationSentScreen directly and navigates back on done', async () => {
    const mockNavigate = jest.fn();
    const renderer = await renderWithProvider(
      <InvitationSentScreen navigation={{ navigate: mockNavigate } as any} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Invite sent to Meera');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const doneBtn = buttons.find((b) => b.props.accessibilityLabel === 'Done');
    await ReactTestRenderer.act(async () => {
      doneBtn?.props.onPress();
    });
    expect(mockNavigate).toHaveBeenCalledWith('Members');
  });
});

describe('MEM-05 · Add Child Screen', () => {
  it('renders Add a child header, avatar picker, name, dob, relationship chips, notice and toggle', async () => {
    const onClose = jest.fn();
    const onAddChild = jest.fn();

    const renderer = await renderWithProvider(
      <AddChildModal
        visible={true}
        onClose={onClose}
        onAddChild={onAddChild}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);

    expect(texts).toContain('Add a child');
    expect(texts).toContain('Add a photo or pick a colour');
    expect(texts).toContain('Name');
    expect(texts).toContain('Date of birth');
    expect(texts).toContain('Myra is 4 years old.');
    expect(texts).toContain('RELATIONSHIP');
    expect(texts).toContain('Daughter');
    expect(texts).toContain('Son');
    expect(texts).toContain('Grandchild');
    expect(texts).toContain('Other');
    expect(
      texts.some(
        (t) =>
          typeof t === 'string' &&
          t.includes("Children don't need a phone. Parents manage their profile")
      )
    ).toBe(true);
    expect(texts).toContain('Can sign in on their own phone');
    expect(texts).toContain('Needs decision for V1');
    expect(texts).toContain('Add child');
  });

  it('handles color selection, relationship switching, close and submit', async () => {
    const onClose = jest.fn();
    const onAddChild = jest.fn();

    const renderer = await renderWithProvider(
      <AddChildModal
        visible={true}
        onClose={onClose}
        onAddChild={onAddChild}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Close button
    const closeBtn = buttons.find((b) => b.props.accessibilityLabel === 'Close');
    expect(closeBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      closeBtn?.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();

    // Select Son relationship
    const sonBtn = buttons.find((b) => b.props.accessibilityLabel === 'Relationship Son');
    expect(sonBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      sonBtn?.props.onPress();
    });

    // Submit Add child
    const addBtn = buttons.find((b) => b.props.accessibilityLabel === 'Add child');
    expect(addBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      addBtn?.props.onPress();
    });

    expect(onAddChild).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Myra',
        relationship: 'Son',
      })
    );
  });

  it('only highlights Name input with active orange border when focused/typing', async () => {
    const renderer = await renderWithProvider(
      <AddChildModal visible={true} onClose={jest.fn()} />
    );

    const inputs = renderer.root.findAllByType(TextInput);
    const nameInput = inputs.find((i) => i.props.accessibilityLabel === 'Name');
    expect(nameInput).toBeDefined();

    // Trigger onFocus
    await ReactTestRenderer.act(async () => {
      nameInput?.props.onFocus();
    });

    // Trigger onBlur
    await ReactTestRenderer.act(async () => {
      nameInput?.props.onBlur();
    });
  });

  it('renders AddChildScreen directly and handles back navigation', async () => {
    const mockGoBack = jest.fn();
    const mockCanGoBack = jest.fn().mockReturnValue(true);

    const renderer = await renderWithProvider(
      <AddChildScreen
        navigation={
          {
            goBack: mockGoBack,
            canGoBack: mockCanGoBack,
          } as any
        }
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Add a child');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const closeBtn = buttons.find((b) => b.props.accessibilityLabel === 'Close');
    await ReactTestRenderer.act(async () => {
      closeBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});




describe('MEM-07 · Family Action Confirmation Modal (Reusable Modal)', () => {
  it('renders Variant 1: Remove Dadi from the family with coral button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="remove_member"
        memberName="Dadi"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');
    expect(texts).toContain(
      'Dadi will lose access to shared tasks, calendar, chat and Family Vault. Things she added will stay.'
    );
    expect(texts).toContain('Remove Dadi');
    expect(texts).toContain('Cancel');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const confirmBtn = buttons.find((b) => b.props.accessibilityLabel === 'Remove Dadi');
    expect(confirmBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      confirmBtn?.props.onPress();
    });
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Variant 2: Leave The Sharma Family with coral button and stay link', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="leave_family"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Leave The Sharma Family?');
    expect(texts).toContain(
      'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.'
    );
    expect(texts).toContain('Leave family');
    expect(texts).toContain('Stay');
  });

  it('renders Variant 3: Make someone else Owner first with orange transfer button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="transfer_owner_required"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Make someone else Owner first');
    expect(texts).toContain(
      'You’re the Owner of The Sharma Family. Transfer ownership to another adult before you leave.'
    );
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain('Cancel');
  });

  it('renders FamilyActionConfirmationScreen directly and switches variants', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyActionConfirmationScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const leaveTab = buttons.find((b) => {
      const child = b.props.children;
      return Array.isArray(child)
        ? child.some((c) => c?.props?.children === 'Leave Family')
        : child?.props?.children === 'Leave Family';
    });
    expect(leaveTab).toBeDefined();

    await ReactTestRenderer.act(async () => {
      leaveTab?.props.onPress();
    });

    const updatedTexts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(updatedTexts).toContain('Leave The Sharma Family?');
  });
});

describe('MEM-08 · Transfer Ownership Screen', () => {
  it('renders Transfer ownership header, candidate list, warning box and action button', async () => {
    const onClose = jest.fn();
    const onTransferComplete = jest.fn();








    const renderer = await renderWithProvider(
      <TransferOwnershipModal
        onClose={onClose}
        onTransferComplete={onTransferComplete}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain(
      'Pick an adult to become the new Owner. You’ll become an Admin.'
    );
    expect(texts).toContain('NEW OWNER');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('What changes');
    expect(texts).toContain('We’ll send an OTP to your phone to confirm.');
    expect(texts).toContain('Transfer to Rohan');
  });

  it('allows selecting Dadi and updating warning/button', async () => {
    const renderer = await renderWithProvider(
      <TransferOwnershipModal onClose={jest.fn()} />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const dadiBtn = buttons.find((b) => b.props.accessibilityLabel === 'Dadi, Adult');
    expect(dadiBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      dadiBtn?.props.onPress();
    });

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer to Dadi');
  });

  it('renders TransferOwnershipScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <TransferOwnershipScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-09 · Delete Family Screen', () => {
  it('renders Delete family header, owner badge, deletion items, and confirmation input', async () => {
    const onClose = jest.fn();
    const onDeleteFamily = jest.fn();

    const renderer = await renderWithProvider(
      <DeleteFamilyModal
        familyName="The Sharma Family"
        onClose={onClose}
        onDeleteFamily={onDeleteFamily}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Owner only');
    expect(texts).toContain('Delete The Sharma Family?');
    expect(texts).toContain('WHAT GETS DELETED');
    expect(texts).toContain('All tasks, events and lists');
    expect(texts).toContain('Family chat and Just Us');
    expect(texts).toContain('Everything in Family Vault');
    expect(texts).toContain('Children’s Life Profiles');
    expect(texts).toContain('Type DELETE to confirm');
    expect(texts).toContain('Download your family’s data first');
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Cancel');
  });

  it('renders DeleteFamilyScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <DeleteFamilyScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-10 · Staff Screen', () => {
  it('renders Staff header, proposed notice, staff list, permissions toggles, and add staff button', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <StaffModal onClose={onClose} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Staff');
    expect(texts).toContain('Proposed · Reserved for later, not in V1.');
    expect(texts).toContain('Give drivers and house help only what they need to see.');
    expect(texts).toContain('Ramesh');
    expect(texts).toContain('Driver');
    expect(texts).toContain('Sunita');
    expect(texts).toContain('House help');
    expect(texts).toContain('WHAT RAMESH CAN SEE');
    expect(texts).toContain('Pickups and drop-offs');
    expect(texts).toContain('Family calendar');
    expect(texts).toContain('Live location');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Add staff');
  });

  it('renders StaffScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <StaffScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});



describe('MEM-06 · Change Role Modal & Screen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    ReactTestRenderer.act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders Change Rohan’s role bottom sheet with all 4 roles matching Figma design', async () => {
    const onClose = jest.fn();
    const onSaveRole = jest.fn();

    const renderer = await renderWithProvider(
      <ChangeRoleModal
        visible={true}
        member={{
          id: 'rohan',
          name: 'Rohan',
          relation: 'Father',
          role: 'Admin',
          initials: 'R',
          avatarBg: '#1F3A66',
        }}
        onClose={onClose}
        onSaveRole={onSaveRole}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Change Rohan’s role');
    expect(texts).toContain('Owner');
    expect(texts).toContain('Full control and billing. Use Transfer ownership instead.');
    expect(texts).toContain('Admin');
    expect(texts).toContain('Manage members and approve join requests');
    expect(texts).toContain('Adult');
    expect(texts).toContain('Use everything, but can’t manage members');
    expect(texts).toContain('Child');
    expect(texts).toContain('Only for children. Parents manage their profile.');
    expect(texts).toContain('Save role');
  });

  it('allows selecting Adult role and saving new role', async () => {
    const onClose = jest.fn();
    const onSaveRole = jest.fn();

    const renderer = await renderWithProvider(
      <ChangeRoleModal
        visible={true}
        member={{
          id: 'rohan',
          name: 'Rohan',
          relation: 'Father',
          role: 'Admin',
          initials: 'R',
          avatarBg: '#1F3A66',
        }}
        onClose={onClose}
        onSaveRole={onSaveRole}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);

    // Select Adult role
    const adultBtn = buttons.find((b) => b.props.accessibilityLabel === 'Adult role');
    expect(adultBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      adultBtn?.props.onPress();
    });

    // Save role
    const saveBtn = buttons.find((b) => b.props.accessibilityLabel === 'Save role');
    expect(saveBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      saveBtn?.props.onPress();
    });

    expect(onSaveRole).toHaveBeenCalledWith('rohan', 'Adult');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders ChangeRoleScreen directly and handles close/save', async () => {
    const mockGoBack = jest.fn();
    const mockCanGoBack = jest.fn().mockReturnValue(true);

    const renderer = await renderWithProvider(
      <ChangeRoleScreen
        navigation={
          {
            goBack: mockGoBack,
            canGoBack: mockCanGoBack,
          } as any
        }
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Change Rohan’s role');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const saveBtn = buttons.find((b) => b.props.accessibilityLabel === 'Save role');
    await ReactTestRenderer.act(async () => {
      saveBtn?.props.onPress();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-07 · Family Action Confirmation Modal (Reusable Modal)', () => {
  it('renders Variant 1: Remove Dadi from the family with coral button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="remove_member"
        memberName="Dadi"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');
    expect(texts).toContain(
      'Dadi will lose access to shared tasks, calendar, chat and Family Vault. Things she added will stay.'
    );
    expect(texts).toContain('Remove Dadi');
    expect(texts).toContain('Cancel');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const confirmBtn = buttons.find((b) => b.props.accessibilityLabel === 'Remove Dadi');
    expect(confirmBtn).toBeDefined();
    await ReactTestRenderer.act(async () => {
      confirmBtn?.props.onPress();
    });
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Variant 2: Leave The Sharma Family with coral button and stay link', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="leave_family"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Leave The Sharma Family?');
    expect(texts).toContain(
      'You’ll lose access to shared tasks, calendar, chat and Family Vault. Your own Life Profile goes with you.'
    );
    expect(texts).toContain('Leave family');
    expect(texts).toContain('Stay');
  });

  it('renders Variant 3: Make someone else Owner first with orange transfer button and cancel', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const renderer = await renderWithProvider(
      <FamilyActionConfirmationModal
        visible={true}
        type="transfer_owner_required"
        familyName="The Sharma Family"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Make someone else Owner first');
    expect(texts).toContain(
      'You’re the Owner of The Sharma Family. Transfer ownership to another adult before you leave.'
    );
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain('Cancel');
  });

  it('renders FamilyActionConfirmationScreen directly and switches variants', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <FamilyActionConfirmationScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Remove Dadi from the family?');

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const leaveTab = buttons.find((b) => {
      const child = b.props.children;
      return Array.isArray(child)
        ? child.some((c) => c?.props?.children === 'Leave Family')
        : child?.props?.children === 'Leave Family';
    });
    expect(leaveTab).toBeDefined();

    await ReactTestRenderer.act(async () => {
      leaveTab?.props.onPress();
    });

    const updatedTexts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(updatedTexts).toContain('Leave The Sharma Family?');
  });
});

describe('MEM-08 · Transfer Ownership Screen', () => {
  it('renders Transfer ownership header, candidate list, warning box and action button', async () => {
    const onClose = jest.fn();
    const onTransferComplete = jest.fn();

    const renderer = await renderWithProvider(
      <TransferOwnershipModal
        onClose={onClose}
        onTransferComplete={onTransferComplete}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer ownership');
    expect(texts).toContain(
      'Pick an adult to become the new Owner. You’ll become an Admin.'
    );
    expect(texts).toContain('NEW OWNER');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('What changes');
    expect(texts).toContain('We’ll send an OTP to your phone to confirm.');
    expect(texts).toContain('Transfer to Rohan');
  });

  it('allows selecting Dadi and updating warning/button', async () => {
    const renderer = await renderWithProvider(
      <TransferOwnershipModal onClose={jest.fn()} />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const dadiBtn = buttons.find((b) => b.props.accessibilityLabel === 'Dadi, Adult');
    expect(dadiBtn).toBeDefined();

    await ReactTestRenderer.act(async () => {
      dadiBtn?.props.onPress();
    });

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Transfer to Dadi');
  });

  it('renders TransferOwnershipScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <TransferOwnershipScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-09 · Delete Family Screen', () => {
  it('renders Delete family header, owner badge, deletion items, and confirmation input', async () => {
    const onClose = jest.fn();
    const onDeleteFamily = jest.fn();

    const renderer = await renderWithProvider(
      <DeleteFamilyModal
        familyName="The Sharma Family"
        onClose={onClose}
        onDeleteFamily={onDeleteFamily}
      />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Owner only');
    expect(texts).toContain('Delete The Sharma Family?');
    expect(texts).toContain('WHAT GETS DELETED');
    expect(texts).toContain('All tasks, events and lists');
    expect(texts).toContain('Family chat and Just Us');
    expect(texts).toContain('Everything in Family Vault');
    expect(texts).toContain('Children’s Life Profiles');
    expect(texts).toContain('Type DELETE to confirm');
    expect(texts).toContain('Download your family’s data first');
    expect(texts).toContain('Delete family');
    expect(texts).toContain('Cancel');
  });

  it('renders DeleteFamilyScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <DeleteFamilyScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});

describe('MEM-10 · Staff Screen', () => {
  it('renders Staff header, proposed notice, staff list, permissions toggles, and add staff button', async () => {
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <StaffModal onClose={onClose} />
    );

    const texts = renderer.root.findAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('Staff');
    expect(texts).toContain('Proposed · Reserved for later, not in V1.');
    expect(texts).toContain('Give drivers and house help only what they need to see.');
    expect(texts).toContain('Ramesh');
    expect(texts).toContain('Driver');
    expect(texts).toContain('Sunita');
    expect(texts).toContain('House help');
    expect(texts).toContain('WHAT RAMESH CAN SEE');
    expect(texts).toContain('Pickups and drop-offs');
    expect(texts).toContain('Family calendar');
    expect(texts).toContain('Live location');
    expect(texts).toContain('Family chat');
    expect(texts).toContain('Add staff');
  });

  it('renders StaffScreen directly and handles back', async () => {
    const mockGoBack = jest.fn();
    const renderer = await renderWithProvider(
      <StaffScreen
        navigation={{ goBack: mockGoBack, canGoBack: () => true } as any}
      />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const backBtn = buttons.find((b) => b.props.accessibilityLabel === 'Back');
    await ReactTestRenderer.act(async () => {
      backBtn?.props.onPress();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});




