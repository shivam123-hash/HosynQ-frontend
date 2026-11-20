import { configureStore } from '@reduxjs/toolkit';
import lifeProfileReducer, {
  fetchLifeProfileFullThunk,
} from '../src/redux/features/lifeProfile/lifeProfileSlice';
import lifeProfileServices from '../src/services/lifeProfileServices';

describe('fetchLifeProfileFullThunk', () => {
  it('calls lifeProfileServices.getFullProfile with memberId and updates state on success', async () => {
    const mockFullData = {
      success: true,
      message: 'Life profile retrieved successfully',
      data: {
        completionPercentage: 70,
        completedSectionsCount: 3,
        totalSectionsCount: 5,
        nextStepHint: 'Add your interests next',
        personal: { fullName: 'Rupesh Sharma' },
      },
    };

    const spy = jest
      .spyOn(lifeProfileServices, 'getFullProfile')
      .mockResolvedValueOnce(mockFullData);

    const store = configureStore({
      reducer: {
        lifeProfile: lifeProfileReducer,
      },
    });

    const testMemberId = 'f6ebfe52-eb2a-4e07-b482-4c5c01649c41';
    await store.dispatch(fetchLifeProfileFullThunk({ memberId: testMemberId }));

    expect(spy).toHaveBeenCalledWith(testMemberId);
    expect(store.getState().lifeProfile.full).toEqual(mockFullData);

    spy.mockRestore();
  });
});

