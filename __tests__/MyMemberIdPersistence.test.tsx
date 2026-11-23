import {
  saveMyMemberId,
  getMyMemberId,
  saveUserData,
  getUserData,
  clearUserData,
} from '../src/units/asyncStorageManager';
import familyReducer, {
  createFamilyThunk,
  setMyMemberId,
} from '../src/redux/features/family/familySlice';

describe('myMemberId persistence and family state', () => {
  beforeEach(async () => {
    await clearUserData();
  });

  it('saves and retrieves myMemberId in async storage', async () => {
    const testMemberId = '91688c1c-c33f-4739-a142-e77c36843f4a';
    await saveMyMemberId(testMemberId);

    const retrieved = await getMyMemberId();
    expect(retrieved).toBe(testMemberId);

    const userData = await getUserData();
    expect(userData?.memberId).toBe(testMemberId);
    expect(userData?.myMemberId).toBe(testMemberId);
  });

  it('updates family slice with myMemberId on createFamilyThunk.fulfilled', () => {
    const initialState = {
      family: null,
      familyCode: null,
      myMemberId: null,
      loading: false,
      error: null,
      success: false,
      invitation: null,
      inviteLoading: false,
      inviteError: null,
      joinRequest: null,
      joinLoading: false,
      joinError: null,
      previewData: null,
      previewLoading: false,
      previewError: null,
      myFamilyData: null,
      myFamilyLoading: false,
      myFamilyError: null,
    };

    const action = {
      type: createFamilyThunk.fulfilled.type,
      payload: {
        success: true,
        message: 'Family created successfully',
        family: {
          id: 'be1414ba-e805-4216-8372-73c5f369ee3d',
          name: 'The Sharma Family',
          familyCode: 'HSQ-YEGVNT',
          familyType: 'JOINT',
          memberCount: 1,
          myRole: 'FAMILY_OWNER',
          myMemberId: '91688c1c-c33f-4739-a142-e77c36843f4a',
          createdAt: '2026-11-17T08:46:39.665Z',
        },
      },
    };

    const state = familyReducer(initialState as any, action);
    expect(state.family?.familyCode).toBe('HSQ-YEGVNT');
    expect(state.myMemberId).toBe('91688c1c-c33f-4739-a142-e77c36843f4a');
    expect(state.family?.myMemberId).toBe('91688c1c-c33f-4739-a142-e77c36843f4a');
  });

  it('setMyMemberId manually updates state', () => {
    const initialState = {
      family: null,
      familyCode: null,
      myMemberId: null,
      loading: false,
      error: null,
      success: false,
      invitation: null,
      inviteLoading: false,
      inviteError: null,
      joinRequest: null,
      joinLoading: false,
      joinError: null,
      previewData: null,
      previewLoading: false,
      previewError: null,
      myFamilyData: null,
      myFamilyLoading: false,
      myFamilyError: null,
    };

    const state = familyReducer(
      initialState as any,
      setMyMemberId('test-manual-id-123')
    );
    expect(state.myMemberId).toBe('test-manual-id-123');
  });
});

