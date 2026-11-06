import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TasksScreen from '../src/screens/mainScreens/tasksScreen/TasksScreen';
import {
  ListDetailModal,
  NewListModal,
  AddListItemsModal,
  AssignListItemModal,
  ShareListModal,
  ListOptionsModal,
} from '../src/screens/mainScreens/tasksScreen/components';
import { INITIAL_LISTS } from '../src/screens/mainScreens/tasksScreen/mockData';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderWithProvider = async (component: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        {component}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('Lists Section', () => {
  it('renders Lists tab with vacation banner and all initial list cards', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen initialMainTab="lists" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Vacation planner banner
    expect(texts).toContain('VACATION PLANNER');
    expect(texts).toContain('Jaipur · 13–16 Nov');

    // List cards
    expect(texts).toContain('Diwali shopping');
    expect(texts).toContain('Weekly groceries');
    expect(texts).toContain('Jaipur trip packing');
    expect(texts).toContain('School supplies · Term 2');
    expect(texts).toContain("Nani's birthday party");
  });

  it('renders empty lists state with suggestion pills when forceEmpty={true}', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen initialMainTab="lists" forceEmpty={true} />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('No lists yet');
    expect(texts).toContain('Grocery');
    expect(texts).toContain('Packing');
    expect(texts).toContain('School');
    expect(texts).toContain('Party');
    expect(texts).toContain('Custom');
    expect(texts).toContain('Create a list');
  });

  it('renders ListDetailModal with items, progress, and done section', async () => {
    const list = INITIAL_LISTS.find((l) => l.id === 'lst-1')!; // Diwali shopping
    const onUpdateList = jest.fn();
    const onDeleteList = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ListDetailModal
        visible={true}
        list={list}
        onClose={onClose}
        onUpdateList={onUpdateList}
        onDeleteList={onDeleteList}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Diwali shopping');
    expect(texts).toContain('Shared with everyone');
    expect(texts).toContain('Add an item');

    // Pending item checks
    expect(texts).toContain('Diyas');
    expect(texts).toContain('Kaju katli');
    expect(texts).toContain('Rangoli colours');

    // Done items section (collapsed by default with "Show all")
    expect(
      texts.some((t) => typeof t === 'string' && t.startsWith('DONE'))
    ).toBe(true);
    expect(texts).toContain('Show all');

    // Tap "Show all" to expand done items
    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const showAllBtn = touchables.find((t) => {
      const tTexts = t.findAllByType(Text).map((n) => n.props.children).flat();
      return tTexts.includes('Show all');
    });
    expect(showAllBtn).toBeDefined();

    await ReactTestRenderer.act(() => {
      showAllBtn!.props.onPress();
    });

    const updatedTextNodes = renderer.root.findAllByType(Text);
    const updatedTexts = updatedTextNodes.map((n) => n.props.children).flat();
    expect(updatedTexts).toContain('Silver coin for Puja');
    expect(updatedTexts).toContain('Hide');
  });

  it('renders ListDetailModal in celebration mode when all items are done', async () => {
    const allDoneList = {
      ...INITIAL_LISTS[0],
      items: INITIAL_LISTS[0].items.map((it) => ({ ...it, isCompleted: true })),
    };

    const renderer = await renderWithProvider(
      <ListDetailModal
        visible={true}
        list={allDoneList}
        onClose={jest.fn()}
        onUpdateList={jest.fn()}
        onDeleteList={jest.fn()}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Everything’s bought');
    expect(texts).toContain('Clear list');
    expect(texts).toContain('Archive list');
  });

  it('renders NewListModal and allows typing a name', async () => {
    const onCreateList = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <NewListModal
        visible={true}
        onClose={onClose}
        onCreateList={onCreateList}
        prefillType="grocery"
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('New list');
    expect(texts).toContain('WHAT KIND OF LIST?');
    expect(texts).toContain('List name');
    expect(texts).toContain('Share with the whole family');
    expect(texts).toContain('Create list');
  });

  it('renders AddListItemsModal with suggestions and past items', async () => {
    const onAdd = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <AddListItemsModal
        visible={true}
        onClose={onClose}
        onAddItems={onAdd}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Add items');
    expect(texts).toContain('Quantity or note');
    expect(texts).toContain('FROM YOUR PAST LISTS');
    expect(texts).toContain('Gift wrap');
    expect(texts).toContain('Done');
  });

  it('renders AssignListItemModal with family members and anyone option', async () => {
    const onAssign = jest.fn();
    const onClose = jest.fn();
    const item = INITIAL_LISTS[0].items[0];

    const renderer = await renderWithProvider(
      <AssignListItemModal
        visible={true}
        item={item}
        onClose={onClose}
        onAssign={onAssign}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Who’s getting this?');
    expect(texts).toContain('Anyone can pick it up');
    expect(texts).toContain('Priya (you)');
    expect(texts).toContain('Rohan');
  });

  it('renders ShareListModal with switches and family chat button', async () => {
    const list = INITIAL_LISTS[0];
    const onUpdateShare = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ShareListModal
        visible={true}
        list={list}
        onClose={onClose}
        onUpdateShare={onUpdateShare}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Share “');
    expect(texts).toContain('Diwali shopping');
    expect(texts).toContain('People you share with can add and tick off items');
    expect(texts).toContain('Send to family chat');
  });

  it('renders ListOptionsModal with rename, duplicate, clear, archive, and delete', async () => {
    const list = INITIAL_LISTS[0];
    const onRename = jest.fn();
    const onDuplicate = jest.fn();
    const onClearDone = jest.fn();
    const onArchive = jest.fn();
    const onDelete = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ListOptionsModal
        visible={true}
        list={list}
        onClose={onClose}
        onRenameList={onRename}
        onDuplicateList={onDuplicate}
        onClearDoneItems={onClearDone}
        onArchiveList={onArchive}
        onDeleteList={onDelete}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('List options');
    expect(texts).toContain('List name');
    expect(texts).toContain('Duplicate list');
    expect(texts).toContain('Clear done items');
    expect(texts).toContain('Archive list');
    expect(texts).toContain('Delete list');
  });

  it('opens and closes ListDetailModal when tapping on a list item in TasksScreen', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen initialMainTab="lists" />
    );

    // Find the touchable for Diwali shopping
    const touchables = renderer.root.findAllByType(TouchableOpacity);
    const diwaliCard = touchables.find((t) => {
      const texts = t.findAllByType(Text).map((n) => n.props.children).flat();
      return texts.includes('Diwali shopping');
    });

    expect(diwaliCard).toBeDefined();

    // Tap Diwali shopping card
    await ReactTestRenderer.act(() => {
      diwaliCard!.props.onPress();
    });

    // Check if ListDetailModal is now visible
    const detailModal = renderer.root.findByType(ListDetailModal);
    expect(detailModal.props.visible).toBe(true);
    expect(detailModal.props.list?.title).toBe('Diwali shopping');
  });
});
