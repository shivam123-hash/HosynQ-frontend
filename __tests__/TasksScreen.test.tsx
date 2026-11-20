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
  ReassignModal,
  DeleteTaskModal,
  CreateTaskModal,
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

  it('opens DiscardChangesModal when closing CreateTaskModal with half-filled info', async () => {
    const onClose = jest.fn();
    const onCreateTask = jest.fn();

    const renderer = await renderWithProvider(
      <CreateTaskModal
        visible={true}
        initialTitle="Book train tickets to Jaipur"
        onClose={onClose}
        onCreateTask={onCreateTask}
      />
    );

    const closeBtn = renderer.root.findByProps({
      accessibilityLabel: 'Close create task',
    });
    await ReactTestRenderer.act(() => {
      closeBtn.props.onPress();
    });

    expect(onClose).not.toHaveBeenCalled();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();
    expect(texts).toContain('Discard this task?');
    expect(texts).toContain('Keep editing');
    expect(texts).toContain('Discard');
  });

  it('renders ReassignModal correctly matching Figma design', async () => {
    const onSelectAssignee = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <ReassignModal
        visible={true}
        taskTitle="Pay electricity bill"
        currentAssignee="Priya"
        onClose={onClose}
        onSelectAssignee={onSelectAssignee}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Reassign task');
    expect(texts).toContain('Pay electricity bill');
    expect(texts).toContain('Priya (you)');
    expect(texts).toContain('Assigned now · 5 tasks this week');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('4 tasks this week');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('1 task this week');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Child · 1 task this week');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Child · 1 task this week');
    expect(texts).toContain('Let Rohan know');
    expect(texts).toContain('Reassign to Rohan');
    expect(texts).toContain('Cancel');
  });

  it('renders DeleteTaskModal correctly matching Figma design', async () => {
    const onConfirmDelete = jest.fn();
    const onClose = jest.fn();

    const renderer = await renderWithProvider(
      <DeleteTaskModal
        visible={true}
        taskTitle="Pay electricity bill"
        isRepeating={true}
        repeatText="monthly"
        onClose={onClose}
        onConfirmDelete={onConfirmDelete}
      />
    );
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Delete this task?');
    expect(texts).toContain(
      '“Pay electricity bill” and its comments will be removed for everyone. Future monthly reminders stop too.'
    );
    expect(texts).toContain('Delete task');
    expect(texts).toContain('Cancel');
  });

  it('opens ReassignModal when tapping Reassign in TaskDetailModal', async () => {
    const task = INITIAL_TASKS.find((t) => t.id === 'tsk-4')!; // Pay electricity bill
    const onReassign = jest.fn();
    const renderer = await renderWithProvider(
      <TaskDetailModal
        visible={true}
        task={task}
        onClose={jest.fn()}
        onToggleComplete={jest.fn()}
        onReassign={onReassign}
      />
    );

    // Find and tap "Reassign" button
    const { TouchableOpacity } = require('react-native');
    const reassignBtn = renderer.root
      .findAllByType(TouchableOpacity)
      .find((t: any) => t.props.accessibilityLabel === 'Reassign task');
    expect(reassignBtn).toBeTruthy();

    await ReactTestRenderer.act(() => {
      reassignBtn?.props.onPress();
    });

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Reassign task');
    expect(texts).toContain('Pay electricity bill');
    expect(texts).toContain('Priya (you)');
    expect(texts).toContain('Let Rohan know');
  });

  it('renders NoTasksEmptyState when initialTasks is [] (no mock data leakage)', async () => {
    const renderer = await renderWithProvider(<TasksScreen initialTasks={[]} />);
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('No tasks yet');
    expect(texts).toContain('Add a task');
    expect(texts).not.toContain('Buy Diwali sweets and diyas');
  });

  it('renders TaskDetailModal safely with uppercase backend category/priority and partial data', async () => {
    const uppercaseBackendTask: any = {
      id: 'backend-task-uuid-1',
      title: 'Backend Uppercase Task',
      dueDate: '2026-11-25',
      category: 'HOUSEHOLD',
      priority: 'HIGH',
      isCompleted: false,
    };

    const renderer = await renderWithProvider(
      <TaskDetailModal
        visible={true}
        task={uppercaseBackendTask}
        onClose={jest.fn()}
        onToggleComplete={jest.fn()}
      />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    expect(texts).toContain('Backend Uppercase Task');
    expect(texts).toContain('Household');
    expect(texts).toContain('High priority');
  });

  it('preserves hook order when transitioning TaskDetailModal from closed (null task) to open', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <TaskDetailModal
            visible={false}
            task={null}
            onClose={jest.fn()}
            onToggleComplete={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });

    const sampleTask = INITIAL_TASKS[0];
    await ReactTestRenderer.act(() => {
      renderer.update(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <TaskDetailModal
            visible={true}
            task={sampleTask}
            onClose={jest.fn()}
            onToggleComplete={jest.fn()}
          />
        </SafeAreaProvider>
      );
    });

    expect(renderer!.root).toBeTruthy();
    const textNodes = renderer!.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();
    expect(texts).toContain(sampleTask.title);
  });

  it('formats raw ISO dates into friendly human dates (formatTaskDueDate)', () => {
    const { formatTaskDueDate } = require('../src/screens/mainScreens/tasksScreen/taskApiHelpers');
    expect(formatTaskDueDate('2026-11-02T00:00:00.000Z')).toBe('Mon, 2 Nov');
    expect(formatTaskDueDate('2026-11-04T00:00:00.000Z')).toBe('Wed, 4 Nov');
    expect(formatTaskDueDate('Today')).toBe('Today');
    expect(formatTaskDueDate(null)).toBe('Today');
  });

  it('keeps status filter tabs and displays "No completed tasks yet" when completed tab has 0 items', async () => {
    const renderer = await renderWithProvider(
      <TasksScreen initialStatus="completed" initialTasks={[]} />
    );
    expect(renderer.root).toBeTruthy();

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat();

    // Filter tabs are preserved
    expect(texts).toContain('Pending 0');
    expect(texts).toContain('Completed 0');
    expect(texts).toContain('Everyone');

    // Dedicated completed empty message
    expect(texts).toContain('No completed tasks yet');
    expect(texts).toContain('Tasks you complete will show up here.');

    // Global onboarding empty state must NOT show
    expect(texts).not.toContain('OR START WITH ONE OF THESE');
  });

  it('sends empty object {} body instead of null in completeTask and reopenTask API calls', async () => {
    const tasksServices = require('../src/services/tasksServices').default;
    const apiClient = require('../src/services/apiClient').default;

    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });
    await tasksServices.completeTask('0045a34e-89ee-4d95-ba3c-eb125e63bf11', '2026-11-20');

    expect(postSpy).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/complete',
      {},
      { params: { today: '2026-11-20' } }
    );
    postSpy.mockRestore();

    const postSpyReopen = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });
    await tasksServices.reopenTask('0045a34e-89ee-4d95-ba3c-eb125e63bf11');

    expect(postSpyReopen).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/reopen',
      {}
    );
    postSpyReopen.mockRestore();
  });

  it('supports scope param in deleteTask and mentionMemberIds in addComment', async () => {
    const tasksServices = require('../src/services/tasksServices').default;
    const apiClient = require('../src/services/apiClient').default;

    const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: { success: true } });
    await tasksServices.deleteTask('0045a34e-89ee-4d95-ba3c-eb125e63bf11', 'THIS_AND_FUTURE');

    expect(deleteSpy).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11',
      { params: { scope: 'THIS_AND_FUTURE' } }
    );
    deleteSpy.mockRestore();

    const postCommentSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } });
    await tasksServices.addComment('0045a34e-89ee-4d95-ba3c-eb125e63bf11', {
      body: '@Rupesh please check this',
      mentionMemberIds: ['ebcb4825-1bd2-471c-b099-de310d6c2e8f'],
    });

    expect(postCommentSpy).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/comments',
      {
        body: '@Rupesh please check this',
        mentionMemberIds: ['ebcb4825-1bd2-471c-b099-de310d6c2e8f'],
      }
    );
    postCommentSpy.mockRestore();
  });

  it('fetches all comments via tasksServices.getComments when CommentsModal is opened with taskId', async () => {
    const CommentsModal = require('../src/screens/mainScreens/tasksScreen/components/CommentsModal').default;
    const tasksServices = require('../src/services/tasksServices').default;

    const mockComments = [
      { id: '1', body: 'Comment 1', author: { fullName: 'Priya' }, createdAt: '2026-11-20T10:00:00Z' },
      { id: '2', body: 'Comment 2', author: { fullName: 'Rohan' }, createdAt: '2026-11-20T11:00:00Z' },
      { id: '3', body: 'Comment 3', author: { fullName: 'Anaya' }, createdAt: '2026-11-20T12:00:00Z' },
    ];

    const getCommentsSpy = jest.spyOn(tasksServices, 'getComments').mockResolvedValueOnce({
      comments: mockComments,
      pagination: { limit: 50, total: 3, hasOlder: false },
    });

    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <CommentsModal
            visible={true}
            taskId="0045a34e-89ee-4d95-ba3c-eb125e63bf11"
            taskTitle="Book train tickets to Jaipur"
            dueDateSubtitle="Due Mon, 2 Nov"
            comments={[]}
            onClose={() => {}}
          />
        </SafeAreaProvider>
      );
    });

    expect(getCommentsSpy).toHaveBeenCalledWith('0045a34e-89ee-4d95-ba3c-eb125e63bf11', undefined, 50);
    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n: any) => n.props.children).flat();
    expect(texts).toContain('Comment 1');
    expect(texts).toContain('Comment 2');
    expect(texts).toContain('Comment 3');

    getCommentsSpy.mockRestore();
  });

  it('renders strictly 2 options (Edit Task and Delete Task) in TaskDetailModal options menu', async () => {
    const sampleTask = INITIAL_TASKS[0];

    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <TaskDetailModal
            visible={true}
            task={sampleTask}
            onClose={() => {}}
            onToggleComplete={() => {}}
          />
        </SafeAreaProvider>
      );
    });

    const moreBtn = renderer.root.findByProps({ accessibilityLabel: 'More options' });
    await ReactTestRenderer.act(async () => {
      moreBtn.props.onPress();
    });

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n: any) => n.props.children).flat();
    expect(texts).toContain('Edit Task');
    expect(texts).toContain('Delete Task');
    expect(texts).not.toContain('Edit Due Date');
    expect(texts).not.toContain('Category & Priority');
  });
});

