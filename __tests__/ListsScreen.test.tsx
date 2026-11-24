import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import listsServices from '../src/services/listsServices';
import apiClient from '../src/services/apiClient';
import {
  mapBackendListTypeToUi,
  mapUiListTypeToBackend,
  mapApiListItemToUiEntry,
  mapApiListSummaryToUiList,
  mapApiListDetailToUiList,
} from '../src/screens/mainScreens/tasksScreen/listApiHelpers';
import listsReducer, {
  fetchLists,
  fetchListDetail,
  createList,
  updateList,
  deleteList,
  duplicateList,
  clearDone,
  addListItems,
  updateListItem,
  deleteListItem,
  clearSelectedList,
} from '../src/redux/features/lists/listsSlice';

describe('Lists APIs and Integration Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listsServices API Methods', () => {
    it('1. listLists calls GET /lists with archived parameter', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          lists: [
            {
              id: 'lst-1',
              name: 'Weekly Groceries',
              type: 'GROCERY',
              sharedWithAll: true,
              createdBy: { memberId: 'm-1', fullName: 'Priya', avatarColor: '#123' },
              members: [],
              counts: { total: 5, done: 2, left: 3 },
              archivedAt: null,
              createdAt: '2026-11-20T10:00:00Z',
            },
          ],
        },
      } as any);

      const res = await listsServices.listLists(false);
      expect(getSpy).toHaveBeenCalledWith('lists', { params: { archived: false } });
      expect(res.success).toBe(true);
      expect(res.lists).toHaveLength(1);
      getSpy.mockRestore();
    });

    it('2. createList calls POST /lists with CreateListPayload', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          success: true,
          list: {
            id: 'lst-new',
            name: 'Trip to Goa',
            type: 'PACKING',
            sharedWithAll: false,
            createdBy: null,
            members: [],
            counts: { total: 0, done: 0, left: 0 },
            archivedAt: null,
            createdAt: '2026-11-23T11:45:00Z',
            items: { toBuy: [], done: [] },
            permissions: { canManage: true, canAddAndTick: true, canDuplicate: true },
          },
        },
      } as any);

      const payload = {
        name: 'Trip to Goa',
        type: 'PACKING' as const,
        sharedWithAll: false,
        memberIds: ['m-2'],
      };

      const res = await listsServices.createList(payload);
      expect(postSpy).toHaveBeenCalledWith('lists', payload);
      expect(res.success).toBe(true);
      expect(res.list.name).toBe('Trip to Goa');
      postSpy.mockRestore();
    });

    it('3. getList calls GET /lists/:id', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          list: {
            id: 'lst-1',
            name: 'Weekly Groceries',
            type: 'GROCERY',
            sharedWithAll: true,
            createdBy: null,
            members: [],
            counts: { total: 2, done: 1, left: 1 },
            archivedAt: null,
            createdAt: '2026-11-20T10:00:00Z',
            items: {
              toBuy: [
                {
                  id: 'item-1',
                  name: 'Milk',
                  note: '2 cartons',
                  assignedTo: null,
                  done: false,
                  doneAt: null,
                  createdAt: '2026-11-20T10:05:00Z',
                },
              ],
              done: [
                {
                  id: 'item-2',
                  name: 'Bread',
                  note: null,
                  assignedTo: null,
                  done: true,
                  doneAt: '2026-11-20T11:00:00Z',
                  createdAt: '2026-11-20T10:02:00Z',
                },
              ],
            },
            permissions: { canManage: true, canAddAndTick: true, canDuplicate: true },
          },
        },
      } as any);

      const res = await listsServices.getList('lst-1');
      expect(getSpy).toHaveBeenCalledWith('lists/lst-1');
      expect(res.list.items.toBuy).toHaveLength(1);
      expect(res.list.items.done).toHaveLength(1);
      getSpy.mockRestore();
    });

    it('4. updateList calls PATCH /lists/:id with UpdateListPayload', async () => {
      const patchSpy = jest.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        data: { success: true },
      } as any);

      await listsServices.updateList('lst-1', { name: 'Monthly Groceries', archived: true });
      expect(patchSpy).toHaveBeenCalledWith('lists/lst-1', {
        name: 'Monthly Groceries',
        archived: true,
      });
      patchSpy.mockRestore();
    });

    it('5. deleteList calls DELETE /lists/:id', async () => {
      const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        data: { success: true, message: 'List deleted.' },
      } as any);

      const res = await listsServices.deleteList('lst-1');
      expect(deleteSpy).toHaveBeenCalledWith('lists/lst-1');
      expect(res.success).toBe(true);
      deleteSpy.mockRestore();
    });

    it('6. duplicateList calls POST /lists/:id/duplicate', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: { success: true, list: { id: 'lst-dup' } },
      } as any);

      await listsServices.duplicateList('lst-1', 'Groceries (Copy)');
      expect(postSpy).toHaveBeenCalledWith('lists/lst-1/duplicate', { name: 'Groceries (Copy)' });
      postSpy.mockRestore();
    });

    it('7. clearDone calls POST /lists/:id/clear-done with empty object', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: { success: true, clearedCount: 3 },
      } as any);

      const res = await listsServices.clearDone('lst-1');
      expect(postSpy).toHaveBeenCalledWith('lists/lst-1/clear-done', {});
      expect(res.clearedCount).toBe(3);
      postSpy.mockRestore();
    });

    it('8. getSuggestions calls GET /lists/:id/suggestions', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          suggestions: [
            { name: 'Almond milk', note: '2 cartons', timesUsed: 14 },
          ],
        },
      } as any);

      const res = await listsServices.getSuggestions('lst-1', 'milk', 5);
      expect(getSpy).toHaveBeenCalledWith('lists/lst-1/suggestions', {
        params: { q: 'milk', limit: 5 },
      });
      expect(res.suggestions[0].name).toBe('Almond milk');
      getSpy.mockRestore();
    });

    it('9. addItems calls POST /lists/:id/items', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: { success: true, addedCount: 2, items: [] },
      } as any);

      await listsServices.addItems('lst-1', {
        items: [
          { name: 'Eggs', note: '1 dozen' },
          { name: 'Butter', note: null },
        ],
      });
      expect(postSpy).toHaveBeenCalledWith('lists/lst-1/items', {
        items: [
          { name: 'Eggs', note: '1 dozen' },
          { name: 'Butter', note: null },
        ],
      });
      postSpy.mockRestore();
    });

    it('10. updateItem calls PATCH /lists/:id/items/:itemId', async () => {
      const patchSpy = jest.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        data: { success: true, item: { id: 'it-1', done: true } },
      } as any);

      await listsServices.updateItem('lst-1', 'it-1', { done: true });
      expect(patchSpy).toHaveBeenCalledWith('lists/lst-1/items/it-1', { done: true });
      patchSpy.mockRestore();
    });

    it('11. deleteItem calls DELETE /lists/:id/items/:itemId', async () => {
      const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        data: { success: true, message: 'Item deleted.' },
      } as any);

      await listsServices.deleteItem('lst-1', 'it-1');
      expect(deleteSpy).toHaveBeenCalledWith('lists/lst-1/items/it-1');
      deleteSpy.mockRestore();
    });
  });

  describe('listApiHelpers', () => {
    it('maps type strings between backend and UI correctly', () => {
      expect(mapBackendListTypeToUi('GROCERY')).toBe('grocery');
      expect(mapBackendListTypeToUi('PACKING')).toBe('packing');
      expect(mapBackendListTypeToUi('SCHOOL')).toBe('school');
      expect(mapBackendListTypeToUi('PARTY')).toBe('party');
      expect(mapBackendListTypeToUi('CUSTOM')).toBe('custom');
      expect(mapBackendListTypeToUi('OTHER')).toBe('custom');

      expect(mapUiListTypeToBackend('grocery')).toBe('GROCERY');
      expect(mapUiListTypeToBackend('packing')).toBe('PACKING');
      expect(mapUiListTypeToBackend('school')).toBe('SCHOOL');
      expect(mapUiListTypeToBackend('party')).toBe('PARTY');
      expect(mapUiListTypeToBackend('custom')).toBe('CUSTOM');
    });

    it('maps backend item to UI entry correctly', () => {
      const uiEntry = mapApiListItemToUiEntry({
        id: 'item-uuid-1',
        name: 'Avocados',
        note: 'Ripe, 4 pcs',
        assignedTo: {
          memberId: 'mem-1',
          fullName: 'Rohan Sharma',
          avatarColor: '#1E3A66',
        },
        done: false,
        doneAt: null,
        createdAt: '2026-11-20T10:00:00Z',
      });

      expect(uiEntry).toEqual({
        id: 'item-uuid-1',
        title: 'Avocados',
        quantity: 'Ripe, 4 pcs',
        isCompleted: false,
        assignedTo: 'Rohan Sharma',
        assignedInitial: 'R',
        assignedAvatarBg: '#1E3A66',
      });
    });

    it('maps backend list detail to UI list group combining toBuy and done', () => {
      const uiList = mapApiListDetailToUiList({
        id: 'lst-uuid',
        name: 'Goa Packing',
        type: 'PACKING',
        sharedWithAll: false,
        createdBy: null,
        members: [{ memberId: 'm1', fullName: 'Priya', avatarColor: null }],
        counts: { total: 2, done: 1, left: 1 },
        archivedAt: null,
        createdAt: '2026-11-20T10:00:00Z',
        items: {
          toBuy: [
            {
              id: 'i-1',
              name: 'Sunscreen',
              note: 'SPF 50',
              assignedTo: null,
              done: false,
              doneAt: null,
              createdAt: '2026-11-20T10:00:00Z',
            },
          ],
          done: [
            {
              id: 'i-2',
              name: 'Swimwear',
              note: null,
              assignedTo: null,
              done: true,
              doneAt: '2026-11-20T11:00:00Z',
              createdAt: '2026-11-20T10:00:00Z',
            },
          ],
        },
        permissions: { canManage: true, canAddAndTick: true, canDuplicate: true },
      });

      expect(uiList.id).toBe('lst-uuid');
      expect(uiList.title).toBe('Goa Packing');
      expect(uiList.type).toBe('packing');
      expect(uiList.items).toHaveLength(2);
      expect(uiList.items[0].title).toBe('Sunscreen');
      expect(uiList.items[0].isCompleted).toBe(false);
      expect(uiList.items[1].title).toBe('Swimwear');
      expect(uiList.items[1].isCompleted).toBe(true);
    });
  });

  describe('listsSlice Redux Reducer', () => {
    it('sets loading on fetchLists.pending and sets lists on fetchLists.fulfilled', () => {
      const state1 = listsReducer(undefined, { type: fetchLists.pending.type });
      expect(state1.loading).toBe(true);

      const mockLists = [
        {
          id: 'lst-1',
          name: 'Weekend groceries',
          type: 'GROCERY',
          sharedWithAll: true,
          createdBy: null,
          members: [],
          counts: { total: 4, done: 2, left: 2 },
          archivedAt: null,
          createdAt: '2026-11-20T10:00:00Z',
        },
      ];

      const state2 = listsReducer(state1, {
        type: fetchLists.fulfilled.type,
        payload: mockLists,
      });
      expect(state2.loading).toBe(false);
      expect(state2.lists).toEqual(mockLists);
    });

    it('clears selected list on clearSelectedList action', () => {
      const initialState = {
        lists: [],
        selectedList: { id: 'l1' } as any,
        suggestions: [],
        loading: false,
        detailLoading: false,
        actionLoading: false,
        error: null,
      };

      const nextState = listsReducer(initialState, clearSelectedList());
      expect(nextState.selectedList).toBeNull();
    });
  });
});
