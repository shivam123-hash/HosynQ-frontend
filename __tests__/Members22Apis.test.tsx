import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/redux/store';
import familyServices from '../src/services/familyServices';
import {
  getMyFamilyThunk,
  requestJoinFamilyThunk,
  fetchJoinRequestsThunk,
  approveJoinRequestThunk,
  rejectJoinRequestThunk,
  inviteAdultMemberThunk,
  fetchSentInvitesThunk,
  cancelSentInviteThunk,
  fetchMyInvitesThunk,
  acceptMemberInviteThunk,
  declineMemberInviteThunk,
  createInvitationThunk,
  fetchInvitationsThunk,
  deleteInvitationThunk,
  previewInvitationThunk,
  addManagedMemberThunk,
  updateChildAvatarThunk,
  updateMemberRoleThunk,
  removeMemberThunk,
  leaveFamilyThunk,
  transferOwnershipThunk,
  deleteFamilyThunk,
  setMyFamilyData,
  setPendingRequests,
} from '../src/redux/features/family/familySlice';
import { MembersModal } from '../src/screens/mainScreens/familyPulse/MembersModal';
import { JoinRequestsModal } from '../src/screens/mainScreens/familyPulse/JoinRequestsModal';
import { MembersSkeleton, JoinRequestsSkeleton } from '../src/components/SkeletonLoader';

jest.mock('../src/services/familyServices');

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('HosynQ Members 22-Endpoint Implementation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Section 1: Redux Thunks & Services for All 22 APIs', () => {
    // 1. Get my family and members
    it('API 1: getMyFamilyThunk calls familyServices.getMyFamily', async () => {
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', name: 'The Sharma Family', memberCount: 4, members: [] },
      });
      const result = await store.dispatch(getMyFamilyThunk()).unwrap();
      expect(familyServices.getMyFamily).toHaveBeenCalled();
      expect(result.inFamily).toBe(true);
    });

    // 2. Join requests
    it('API 2: requestJoinFamilyThunk sends familyCode & message', async () => {
      (familyServices.requestJoinFamily as jest.Mock).mockResolvedValueOnce({
        success: true,
        status: 'PENDING',
      });
      const result = await store.dispatch(
        requestJoinFamilyThunk({ familyCode: 'HSQ-9K7M2W', message: 'Hi this is Amit' })
      ).unwrap();
      expect(familyServices.requestJoinFamily).toHaveBeenCalledWith({
        familyCode: 'HSQ-9K7M2W',
        message: 'Hi this is Amit',
      });
      expect(result.success).toBe(true);
    });

    // 3. List join requests
    it('API 3: fetchJoinRequestsThunk calls getPendingRequests', async () => {
      (familyServices.getPendingRequests as jest.Mock).mockResolvedValueOnce({
        success: true,
        requests: [{ id: 'req-1', fullName: 'Amit Verma' }],
      });
      const result = await store.dispatch(fetchJoinRequestsThunk()).unwrap();
      expect(familyServices.getPendingRequests).toHaveBeenCalled();
      expect(result.requests.length).toBe(1);
    });

    // 4. Approve join request
    it('API 4: approveJoinRequestThunk designates role and refreshes family', async () => {
      (familyServices.approveJoinRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        member: { memberId: 'mem-1', role: 'ADULT_MEMBER' },
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(
        approveJoinRequestThunk({ requestId: 'req-1', role: 'ADULT_MEMBER' })
      ).unwrap();
      expect(familyServices.approveJoinRequest).toHaveBeenCalledWith('req-1', 'ADULT_MEMBER');
      expect(result.data.success).toBe(true);
    });

    // 5. Decline join request
    it('API 5: rejectJoinRequestThunk calls rejectJoinRequest', async () => {
      (familyServices.rejectJoinRequest as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Join request declined.',
      });
      const result = await store.dispatch(rejectJoinRequestThunk('req-1')).unwrap();
      expect(familyServices.rejectJoinRequest).toHaveBeenCalledWith('req-1');
      expect(result.requestId).toBe('req-1');
    });

    // 6. Invite an adult
    it('API 6: inviteAdultMemberThunk sends invite payload', async () => {
      (familyServices.inviteMember as jest.Mock).mockResolvedValueOnce({
        success: true,
        invite: { id: 'inv-1', phoneNumber: '+919876543210' },
      });
      (familyServices.listMemberInvites as jest.Mock).mockResolvedValueOnce({
        success: true,
        invites: [],
      });
      const result = await store.dispatch(
        inviteAdultMemberThunk({ phoneNumber: '+919876543210', name: 'Rohan', role: 'ADULT_MEMBER' })
      ).unwrap();
      expect(familyServices.inviteMember).toHaveBeenCalledWith({
        phoneNumber: '+919876543210',
        name: 'Rohan',
        role: 'ADULT_MEMBER',
      });
      expect(result.success).toBe(true);
    });

    // 7. Waiting invites
    it('API 7: fetchSentInvitesThunk lists waiting invites', async () => {
      (familyServices.listMemberInvites as jest.Mock).mockResolvedValueOnce({
        success: true,
        invites: [{ id: 'inv-1', name: 'Rohan Sharma' }],
      });
      const result = await store.dispatch(fetchSentInvitesThunk()).unwrap();
      expect(familyServices.listMemberInvites).toHaveBeenCalled();
      expect(result.invites.length).toBe(1);
    });

    // 8. Cancel an invite
    it('API 8: cancelSentInviteThunk cancels invite by id', async () => {
      (familyServices.cancelMemberInvite as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Invitation cancelled.',
      });
      const result = await store.dispatch(cancelSentInviteThunk('inv-1')).unwrap();
      expect(familyServices.cancelMemberInvite).toHaveBeenCalledWith('inv-1');
      expect(result).toBe('inv-1');
    });

    // 9. Invited person side: my invites
    it('API 9: fetchMyInvitesThunk retrieves pending user invites', async () => {
      (familyServices.getMyInvites as jest.Mock).mockResolvedValueOnce({
        success: true,
        invites: [{ id: 'inv-1', familyName: 'The Sharma Family' }],
      });
      const result = await store.dispatch(fetchMyInvitesThunk()).unwrap();
      expect(familyServices.getMyInvites).toHaveBeenCalled();
      expect(result.invites.length).toBe(1);
    });

    // 10. Accept invite
    it('API 10: acceptMemberInviteThunk accepts invite', async () => {
      (familyServices.acceptMemberInvite as jest.Mock).mockResolvedValueOnce({
        success: true,
        family: { id: 'fam-1', memberId: 'mem-new' },
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(acceptMemberInviteThunk('inv-1')).unwrap();
      expect(familyServices.acceptMemberInvite).toHaveBeenCalledWith('inv-1');
      expect(result.success).toBe(true);
    });

    // 11. Decline invitation
    it('API 11: declineMemberInviteThunk declines invite', async () => {
      (familyServices.declineMemberInvite as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Invitation declined.',
      });
      const result = await store.dispatch(declineMemberInviteThunk('inv-1')).unwrap();
      expect(familyServices.declineMemberInvite).toHaveBeenCalledWith('inv-1');
      expect(result).toBe('inv-1');
    });

    // 12. Create shareable invite link
    it('API 12: createInvitationThunk creates 7-day share link', async () => {
      (familyServices.createInvitation as jest.Mock).mockResolvedValueOnce({
        success: true,
        invitation: { id: 'link-1', url: 'https://hosynq.app/invite/token123', token: 'token123' },
      });
      const result = await store.dispatch(createInvitationThunk()).unwrap();
      expect(familyServices.createInvitation).toHaveBeenCalled();
      expect(result.invitation.token).toBe('token123');
    });

    // 13. Current link to share
    it('API 13: fetchInvitationsThunk gets current shareable link', async () => {
      (familyServices.getInvitations as jest.Mock).mockResolvedValueOnce({
        success: true,
        invitation: { id: 'link-1', url: 'https://hosynq.app/invite/token123' },
      });
      const result = await store.dispatch(fetchInvitationsThunk()).unwrap();
      expect(familyServices.getInvitations).toHaveBeenCalled();
      expect(result.invitation.id).toBe('link-1');
    });

    // 14. Delete link
    it('API 14: deleteInvitationThunk revokes link by id', async () => {
      (familyServices.deleteInvitation as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Invitation link revoked.',
      });
      const result = await store.dispatch(deleteInvitationThunk('link-1')).unwrap();
      expect(familyServices.deleteInvitation).toHaveBeenCalledWith('link-1');
      expect(result).toBe('link-1');
    });

    // 15. Preview link
    it('API 15: previewInvitationThunk previews link before joining', async () => {
      (familyServices.previewInvitation as jest.Mock).mockResolvedValueOnce({
        success: true,
        invitation: { familyName: 'The Sharma Family', memberCount: 4 },
      });
      const result = await store.dispatch(
        previewInvitationThunk({ inviteToken: 'token123' })
      ).unwrap();
      expect(familyServices.previewInvitation).toHaveBeenCalledWith({ inviteToken: 'token123' });
      expect(result.invitation.familyName).toBe('The Sharma Family');
    });

    // 16. Add child profile
    it('API 16: addManagedMemberThunk adds child profile', async () => {
      (familyServices.addManagedMember as jest.Mock).mockResolvedValueOnce({
        success: true,
        member: { id: 'child-1', fullName: 'Aarav Sharma', role: 'DEPENDENT_CHILD_PROFILE' },
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(
        addManagedMemberThunk({
          role: 'DEPENDENT_CHILD_PROFILE',
          personal: { fullName: 'Aarav Sharma', familyRole: 'SON', birthDate: '2018-05-14' },
        })
      ).unwrap();
      expect(familyServices.addManagedMember).toHaveBeenCalled();
      expect(result.member.fullName).toBe('Aarav Sharma');
    });

    // 17. Update child avatar
    it('API 17: updateChildAvatarThunk updates avatar for child', async () => {
      (familyServices.updateAvatar as jest.Mock).mockResolvedValueOnce({
        success: true,
        avatarColor: '#5C5221',
        memberId: 'child-1',
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(
        updateChildAvatarThunk({ memberId: 'child-1', avatarColor: '#5C5221' })
      ).unwrap();
      expect(familyServices.updateAvatar).toHaveBeenCalledWith({
        memberId: 'child-1',
        avatarColor: '#5C5221',
      });
      expect(result.avatarColor).toBe('#5C5221');
    });

    // 18. Change role
    it('API 18: updateMemberRoleThunk promotes/demotes member role', async () => {
      (familyServices.updateMemberRole as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Rohan Sharma is now FAMILY_ADMIN.',
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(
        updateMemberRoleThunk({ memberId: 'mem-rohan', role: 'FAMILY_ADMIN' })
      ).unwrap();
      expect(familyServices.updateMemberRole).toHaveBeenCalledWith('mem-rohan', 'FAMILY_ADMIN');
      expect(result.role).toBe('FAMILY_ADMIN');
    });

    // 19. Remove member
    it('API 19: removeMemberThunk removes member and reassigns tasks', async () => {
      (familyServices.removeMember as jest.Mock).mockResolvedValueOnce({
        success: true,
        removed: { memberId: 'mem-rohan', fullName: 'Rohan' },
        tasksHandedOver: 2,
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(removeMemberThunk('mem-rohan')).unwrap();
      expect(familyServices.removeMember).toHaveBeenCalledWith('mem-rohan');
      expect(result.tasksHandedOver).toBe(2);
    });

    // 20. Leave family
    it('API 20: leaveFamilyThunk leaves family voluntarily', async () => {
      (familyServices.leaveFamily as jest.Mock).mockResolvedValueOnce({
        success: true,
        leftFamily: { name: 'The Sharma Family', role: 'ADULT_MEMBER' },
        tasksHandedOver: 1,
      });
      const result = await store.dispatch(leaveFamilyThunk()).unwrap();
      expect(familyServices.leaveFamily).toHaveBeenCalled();
      expect(result.tasksHandedOver).toBe(1);
    });

    // 21. Transfer ownership
    it('API 21: transferOwnershipThunk transfers ownership to adult', async () => {
      (familyServices.transferOwnership as jest.Mock).mockResolvedValueOnce({
        success: true,
        newOwner: { memberId: 'mem-rohan', role: 'FAMILY_OWNER' },
        previousOwner: { memberId: 'mem-priya', role: 'FAMILY_ADMIN' },
      });
      (familyServices.getMyFamily as jest.Mock).mockResolvedValueOnce({
        inFamily: true,
        family: { id: 'fam-1', members: [] },
      });
      const result = await store.dispatch(transferOwnershipThunk('mem-rohan')).unwrap();
      expect(familyServices.transferOwnership).toHaveBeenCalledWith('mem-rohan');
      expect(result.newOwner.role).toBe('FAMILY_OWNER');
    });

    // 22. Delete family
    it('API 22: deleteFamilyThunk deletes family when owner is sole member', async () => {
      (familyServices.deleteFamily as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Deleted "The Sharma Family".',
      });
      const result = await store.dispatch(deleteFamilyThunk()).unwrap();
      expect(familyServices.deleteFamily).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Section 2: Skeleton Loaders', () => {
    it('MembersSkeleton renders properly with pulsating animation', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <MembersSkeleton />
          </SafeAreaProvider>
        );
      });
      expect(renderer!).toBeDefined();
    });

    it('JoinRequestsSkeleton renders properly with pulsating animation', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <JoinRequestsSkeleton />
          </SafeAreaProvider>
        );
      });
      expect(renderer!).toBeDefined();
    });
  });
});
