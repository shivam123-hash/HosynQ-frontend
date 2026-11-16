import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TasksScreen from '../src/screens/mainScreens/tasksScreen/TasksScreen';
import TaskDetailModal from '../src/screens/mainScreens/tasksScreen/components/TaskDetailModal';
import {
  AssigneesAndViewersModal,
  DueDateTimeModal,
  RepeatModal,
  RemindersModal,
  CategoryPriorityModal,
  EditRepeatingConfirmModal,
  DiscardChangesModal,
} from '../src/screens/mainScreens/tasksScreen/components';
import { INITIAL_TASKS } from '../src/screens/mainScreens/tasksScreen/mockData';

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

describe('TasksScreen', () => {
  it('renders default tasks pending screen with tabs, members, and task items', async () => {
    const renderer = await renderWithProvider(<TasksScreen />);
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Brand & Title
    expect(texts).toContain('HosynQ');
    expect(texts).toContain('Tasks');

    // Segmented Tabs
    expect(texts).toContain('Tasks');
    expect(texts).toContain('Lists');

    // Status Tabs
    expect(texts.some((t) => typeof t === 'string' && t.startsWith('Pending'))).toBe(true);
    expect(texts.some((t) => typeof t === 'string' && t.startsWith('Completed'))).toBe(true);

    // Family Member filters
    expect(texts).toContain('Everyone');
    expect(texts).toContain('Priya');
    expect(texts).toContain('Rohan');

    // Alert cards
    expect(texts).toContain('OVERDUE');
    expect(texts).toContain('DUE THIS WEEK');

    // Category accordions & Tasks
    expect(texts).toContain('Household');
    expect(texts).toContain('Buy Diwali sweets and diyas');
    expect(texts).toContain('Get kitchen tap fixed');
  });

  it('renders completed tasks tab correctly', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen initialStatus="completed" />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('12 done this week. Anaya finished the most.');
    expect(texts).toContain('Submit science project');
    expect(texts).toContain('Reopen');
  });

  it('renders empty tasks state when forceEmpty={true}', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen forceEmpty={true} />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('No tasks yet');
    expect(texts).toContain('Add a task');
    expect(texts).toContain('OR START WITH ONE OF THESE');
    expect(texts).toContain('Pay electricity bill');
  });

  it('renders TaskDetailModal correctly matching design for task without comments (repeat badge, comments 0, and write comment pill)', async () => {
    const task = INITIAL_TASKS.find((t) => t.id === 'tsk-1')!; // Buy Diwali sweets and diyas
    const renderer = await renderWithProvider(
      <TaskDetailModal
        visible={true}
        task={task}
        onClose={jest.fn()}
        onToggleComplete={jest.fn()}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Task');
    expect(texts).toContain('Buy Diwali sweets and diyas');
    expect(texts).toContain('Household');
    expect(texts).toContain('High priority');

    // Contains "Doesn't repeat" badge pill matching design
    expect(texts).toContain("Doesn't repeat");

    // Contains "Comments · 0" and "Write a comment..." pill matching design
    expect(texts).toContain('Comments · 0');
    expect(texts).toContain('Write a comment...');

    // Should have Mark as done and Reassign buttons
    expect(texts).toContain('Mark as done');
    expect(texts).toContain('Reassign');
    expect(texts).toContain('Created by Dadi on 27 Oct');
  });

  it('renders TaskDetailModal correctly for task with comments and repeating interval', async () => {
    const task = INITIAL_TASKS.find((t) => t.id === 'tsk-4')!; // Pay electricity bill
    const renderer = await renderWithProvider(
      <TaskDetailModal
        visible={true}
        task={task}
        onClose={jest.fn()}
        onToggleComplete={jest.fn()}
      />
    );

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Task');
    expect(texts).toContain('Pay electricity bill');
    expect(texts).toContain('Finance');
    expect(texts).toContain('High priority');
    expect(texts).toContain('Repeats monthly');

    // Should have Comments section with count and View all
    expect(texts).toContain('Comments · 2');
    expect(texts).toContain('View all');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('You');
    expect(texts).toContain('Mark as done');
  });

  it('renders AssigneesAndViewersModal (TSK-15) correctly', async () => {
    const renderer = await renderWithProvider(
      <AssigneesAndViewersModal
        visible={true}
        selectedAssignees={['You']}
        selectedViewers="everyone"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Who’s doing it?');
    expect(texts).toContain('Pick one or more people');
    expect(texts).toContain('You');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('WHO CAN SEE IT');
    expect(texts).toContain('Everyone in the family');
    expect(texts).toContain('Done');
  });

  it('renders DueDateTimeModal (TSK-16) correctly', async () => {
    const renderer = await renderWithProvider(
      <DueDateTimeModal
        visible={true}
        initialDate="Mon, 2 Nov"
        initialTime="6:00 PM"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('When is it due?');
    expect(texts).toContain('Today');
    expect(texts).toContain('Tomorrow');
    expect(texts).toContain('November 2026');
    expect(texts).toContain('TIME');
    expect(texts).toContain('Evening 6:00');
    expect(texts).toContain('No specific time');
    expect(texts).toContain('Done');
  });

  it('renders RepeatModal (TSK-17) correctly', async () => {
    const renderer = await renderWithProvider(
      <RepeatModal
        visible={true}
        initialRepeat="Doesn’t repeat"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Repeat');
    expect(texts).toContain('Doesn’t repeat');
    expect(texts).toContain('Every day');
    expect(texts).toContain('Every month');
    expect(texts).toContain('Done');
  });

  it('renders RemindersModal (TSK-18) correctly', async () => {
    const renderer = await renderWithProvider(
      <RemindersModal
        visible={true}
        initialReminders={['1 hour before']}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Reminders');
    expect(texts).toContain('Pick as many as you like');
    expect(texts).toContain('1 hour before');
    expect(texts).toContain('Also remind the people who can see it');
    expect(texts).toContain('Done');
  });

  it('renders CategoryPriorityModal (TSK-19) correctly', async () => {
    const renderer = await renderWithProvider(
      <CategoryPriorityModal
        visible={true}
        initialCategory="travel"
        initialPriority="medium"
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Category and priority');
    expect(texts).toContain('CATEGORY');
    expect(texts).toContain('Travel');
    expect(texts).toContain('Household');
    expect(texts).toContain('PRIORITY');
    expect(texts).toContain('High');
    expect(texts).toContain('Medium');
    expect(texts).toContain('Low');
    expect(texts).toContain('Done');
  });

  it('renders EditRepeatingConfirmModal (TSK-20) correctly', async () => {
    const renderer = await renderWithProvider(
      <EditRepeatingConfirmModal
        visible={true}
        repeatInterval="every month"
        dueDateText="31 Oct"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Change just this one?');
    expect(texts).toContain('This task repeats every month.');
    expect(texts).toContain('Only this one');
    expect(texts).toContain('This and all future ones');
    expect(texts).toContain('Save changes');
    expect(texts).toContain('Cancel');
  });

  it('renders DiscardChangesModal (TSK-21) correctly', async () => {
    const renderer = await renderWithProvider(
      <DiscardChangesModal
        visible={true}
        onKeepEditing={jest.fn()}
        onDiscard={jest.fn()}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Discard this task?');
    expect(texts).toContain('Keep editing');
    expect(texts).toContain('Discard');
  });
});

