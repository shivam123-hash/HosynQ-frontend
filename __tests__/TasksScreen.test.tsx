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
import { TEST_TASKS, TEST_FAMILY_MEMBERS } from '../src/__test_fixtures__/tasksFixtures';

const mockMetrics = {
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
  frame: { x: 0, y: 0, width: 375, height: 812 },
};

const renderWithProvider = async (component: React.ReactElement<any>) => {
  let elementToRender = component;
  if (component.type === TasksScreen) {
    elementToRender = React.cloneElement(component, {
      initialTasks: TEST_TASKS,
      initialFamilyMembers: TEST_FAMILY_MEMBERS,
      ...component.props,
    });
  } else if (
    component.type === ReassignModal ||
    component.type === AssigneesAndViewersModal ||
    component.type === TaskDetailModal
  ) {
    elementToRender = React.cloneElement(component, {
      members: TEST_FAMILY_MEMBERS.filter((m) => m.id !== 'everyone'),
      ...component.props,
    });
  }
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={mockMetrics}>
        {elementToRender}
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
    const task = TEST_TASKS.find((t) => t.id === 'tsk-1')!; // Buy Diwali sweets and diyas
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
    const task = TEST_TASKS.find((t) => t.id === 'tsk-4')!; // Pay electricity bill
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
    const task = TEST_TASKS.find((t) => t.id === 'tsk-4')!; // Pay electricity bill
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

    const sampleTask = TEST_TASKS[0];
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
    expect(texts).toContain('Comments · 3');
    expect(texts).toContain('Comment 1');
    expect(texts).toContain('Comment 2');
    expect(texts).toContain('Comment 3');

    getCommentsSpy.mockRestore();
  });

  it('tasksServices.getComments properly constructs query params and omits undefined/null before', async () => {
    const tasksServices = require('../src/services/tasksServices').default;
    const apiClient = require('../src/services/apiClient').default;

    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        comments: [],
        pagination: { limit: 30, total: 0, hasOlder: false, olderCursor: null },
      },
    });

    await tasksServices.getComments('0045a34e-89ee-4d95-ba3c-eb125e63bf11', undefined, 30);
    expect(getSpy).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/comments',
      { params: { limit: 30 } }
    );

    getSpy.mockResolvedValueOnce({
      data: {
        success: true,
        comments: [],
        pagination: { limit: 10, total: 37, hasOlder: true, olderCursor: 'cursor-uuid' },
      },
    });

    await tasksServices.getComments('0045a34e-89ee-4d95-ba3c-eb125e63bf11', '056e359a-9c6f-4384-8e01-c0d5ce47ee91', 10);
    expect(getSpy).toHaveBeenCalledWith(
      'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/comments',
      { params: { limit: 10, before: '056e359a-9c6f-4384-8e01-c0d5ce47ee91' } }
    );

    getSpy.mockRestore();
  });

  it('renders strictly 2 options (Edit Task and Delete Task) in TaskDetailModal options menu', async () => {
    const sampleTask = TEST_TASKS[0];

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

  it('DueDateTimeModal defaults to current date and opens time picker on tap of Pick a time', async () => {
    const AppDateTimePicker = require('../src/components/AppDateTimePicker').default;
    const onSave = jest.fn();

    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <DueDateTimeModal
            visible={true}
            onClose={() => {}}
            onSave={onSave}
          />
        </SafeAreaProvider>
      );
    });

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n: any) => n.props.children).flat();
    expect(texts).toContain('When is it due?');
    expect(texts).toContain('Today');
    expect(texts).toContain('Pick a time');

    // Tap "Pick a time"
    const pickTimeBtn = renderer.root.findByProps({ accessibilityLabel: 'Pick a time' });
    await ReactTestRenderer.act(async () => {
      pickTimeBtn.props.onPress();
    });

    // AppDateTimePicker should now be open
    const picker = renderer.root.findByType(AppDateTimePicker);
    expect(picker.props.visible).toBe(true);
    expect(picker.props.mode).toBe('time');

    // Simulate confirming a time (e.g. 7:30 PM)
    const testTime = new Date(2026, 10, 23, 19, 30);
    await ReactTestRenderer.act(async () => {
      picker.props.onConfirm(testTime);
    });

    // Picker closes and custom time displays on chip
    expect(picker.props.visible).toBe(false);
    const updatedTexts = renderer.root.findAllByType(Text).map((n: any) => n.props.children).flat();
    expect(updatedTexts).toContain('7:30 PM');

    // Tap Done and verify onSave received the chosen time and current date
    const doneBtn = renderer.root.findByProps({ accessibilityLabel: 'Done' });
    await ReactTestRenderer.act(async () => {
      doneBtn.props.onPress();
    });

    expect(onSave).toHaveBeenCalledWith(
      'Today',
      'Today · by 7:30 PM',
      '7:30 PM',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
    );
  });

  it('CreateTaskModal defaults Due row to current date Today', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <SafeAreaProvider initialMetrics={mockMetrics}>
          <CreateTaskModal
            visible={true}
            onClose={() => {}}
            onCreateTask={() => {}}
          />
        </SafeAreaProvider>
      );
    });

    const textNodes = renderer.root.findAllByType(Text);
    const texts = textNodes.map((n: any) => n.props.children).flat();
    expect(texts).toContain('Due');
    expect(texts).toContain('Today · by 6:00 PM');
  });

  describe('Overdue task detection & Overdue Alert Banner', () => {
    const { isTaskOverdue } = require('../src/screens/mainScreens/tasksScreen/taskApiHelpers');

    it('accurately identifies overdue tasks by date and time', () => {
      const fixedNow = new Date(2026, 10, 23, 11, 0, 0); // 23 Nov 2026, 11:00 AM

      // Case 1: completed task is never overdue
      expect(isTaskOverdue({ isCompleted: true, dueOn: '2026-11-20' }, fixedNow)).toBe(false);

      // Case 2: task with isOverdue: true
      expect(isTaskOverdue({ isOverdue: true }, fixedNow)).toBe(true);

      // Case 3: past date (20 Nov vs 23 Nov)
      expect(isTaskOverdue({ dueOn: '2026-11-20' }, fixedNow)).toBe(true);

      // Case 4: today with past time (09:00 vs 11:00)
      expect(isTaskOverdue({ dueOn: '2026-11-23', dueTime: '09:00' }, fixedNow)).toBe(true);

      // Case 5: today with future time (18:00 vs 11:00)
      expect(isTaskOverdue({ dueOn: '2026-11-23', dueTime: '18:00' }, fixedNow)).toBe(false);

      // Case 6: tomorrow is not overdue
      expect(isTaskOverdue({ dueOn: '2026-11-24' }, fixedNow)).toBe(false);

      // Case 7: yesterday string
      expect(isTaskOverdue({ dueDate: 'Yesterday' }, fixedNow)).toBe(true);

      // Case 8: today string with past 12-hour time in dueFormatted
      expect(
        isTaskOverdue(
          { dueDate: 'Today', dueFormatted: 'Today · by 9:00 AM' },
          fixedNow
        )
      ).toBe(true);
    });

    it('renders Overdue Alert Banner matching Figma design with Remind and Change due date buttons', async () => {
      const overdueTask: any = {
        id: 'tsk-overdue-1',
        title: 'Submit quarterly budget',
        assignee: 'Rupesh Sharma',
        dueDate: 'Yesterday',
        dueTime: '6:00 PM',
        category: 'finance',
        priority: 'high',
        isCompleted: false,
        isOverdue: true,
      };

      let renderer: any;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={mockMetrics}>
            <TaskDetailModal
              visible={true}
              task={overdueTask}
              onClose={() => {}}
              onToggleComplete={() => {}}
            />
          </SafeAreaProvider>
        );
      });

      const textNodes = renderer.root.findAllByType(Text);
      const texts = textNodes.map((n: any) => n.props.children).flat();

      // Overdue title and subtitle
      expect(texts).toContain('Overdue');
      expect(texts).toContain('Rupesh Sharma was reminded yesterday at 6:00 PM.');

      // Stacked vertical action buttons
      expect(texts).toContain('Remind Rupesh Sharma');
      expect(texts).toContain('Change due date');

      // Tapping "Change due date" opens DueDateTimeModal
      const changeDueBtn = renderer.root.findByProps({
        accessibilityLabel: 'Change due date',
      });
      await ReactTestRenderer.act(async () => {
        changeDueBtn.props.onPress();
      });

      const updatedTexts = renderer.root.findAllByType(Text).map((n: any) => n.props.children).flat();
      expect(updatedTexts).toContain('When is it due?');
    });

    it('implements getReminderState (GET) and remindTask (POST) APIs with active Remind button', async () => {
      const tasksServices = require('../src/services/tasksServices').default;
      const apiClient = require('../src/services/apiClient').default;

      // 1. Verify getReminderState calls GET /api/v1/tasks/:id/reminder
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          success: true,
          reminder: {
            canRemind: true,
            remindableMembers: [
              {
                memberId: '25bfd6dd-b38e-4757-b77a-77fd4552bf91',
                fullName: 'Rupesh Sharma',
                canRemindNow: true,
                nextAllowedAt: null,
              },
            ],
            nextAllowedAt: null,
            lastReminder: null,
          },
        },
      });

      const reminderRes = await tasksServices.getReminderState('0045a34e-89ee-4d95-ba3c-eb125e63bf11');
      expect(getSpy).toHaveBeenCalledWith('tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/reminder');
      expect(reminderRes.reminder.canRemind).toBe(true);
      getSpy.mockRestore();

      // 2. Verify remindTask calls POST /api/v1/tasks/:id/remind with {}
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          success: true,
          remindedMemberIds: ['25bfd6dd-b38e-4757-b77a-77fd4552bf91'],
          pushDelivered: true,
          reminder: {
            canRemind: false,
            remindableMembers: [],
            nextAllowedAt: '2026-11-23T12:15:30.000Z',
            lastReminder: {
              at: '2026-11-23T11:15:30.000Z',
              by: { memberId: '4a6b2cc3', fullName: 'Priya Sharma' },
              to: [{ memberId: '25bfd6dd', fullName: 'Rupesh Sharma' }],
            },
          },
        },
      });

      const remindRes = await tasksServices.remindTask('0045a34e-89ee-4d95-ba3c-eb125e63bf11');
      expect(postSpy).toHaveBeenCalledWith(
        'tasks/0045a34e-89ee-4d95-ba3c-eb125e63bf11/remind',
        {}
      );
      expect(remindRes.success).toBe(true);
      postSpy.mockRestore();

      // 3. Verify Remind button is activated and tapping it triggers remindTask
      const overdueTask: any = {
        id: '0045a34e-89ee-4d95-ba3c-eb125e63bf11',
        title: 'Electricity bill payment',
        assignee: 'Rohan Sharma',
        dueDate: 'Yesterday',
        dueTime: '6:00 PM',
        category: 'finance',
        priority: 'high',
        isCompleted: false,
        isOverdue: true,
      };

      const getReminderSpy = jest.spyOn(tasksServices, 'getReminderState').mockResolvedValueOnce({
        success: true,
        reminder: {
          canRemind: true,
          remindableMembers: [
            {
              memberId: '25bfd6dd-b38e-4757-b77a-77fd4552bf91',
              fullName: 'Rohan Sharma',
              canRemindNow: true,
              nextAllowedAt: null,
            },
          ],
          nextAllowedAt: null,
          lastReminder: null,
        },
      });

      const remindSpy = jest.spyOn(tasksServices, 'remindTask').mockResolvedValueOnce({
        success: true,
        remindedMemberIds: ['25bfd6dd-b38e-4757-b77a-77fd4552bf91'],
        pushDelivered: true,
        reminder: {
          canRemind: false,
          remindableMembers: [],
          nextAllowedAt: '2026-11-23T12:15:30.000Z',
          lastReminder: {
            at: '2026-11-23T11:15:30.000Z',
            by: { memberId: '4a6b2cc3', fullName: 'Priya Sharma', avatarColor: '#5C3A21' },
            to: [],
          },
        },
      });

      let renderer: any;
      await ReactTestRenderer.act(async () => {
        renderer = ReactTestRenderer.create(
          <SafeAreaProvider initialMetrics={mockMetrics}>
            <TaskDetailModal
              visible={true}
              task={overdueTask}
              onClose={() => {}}
              onToggleComplete={() => {}}
            />
          </SafeAreaProvider>
        );
      });

      const remindBtn = renderer.root.findByProps({
        accessibilityLabel: 'Remind Rohan Sharma',
      });
      // The button is not disabled (activated)
      expect(remindBtn.props.disabled).toBe(false);

      await ReactTestRenderer.act(async () => {
        remindBtn.props.onPress();
      });

      expect(remindSpy).toHaveBeenCalledWith('0045a34e-89ee-4d95-ba3c-eb125e63bf11', {});
      remindSpy.mockRestore();
      getReminderSpy.mockRestore();
    });
  });

  describe('Bug fixes: Task Reassign member UUID & Due Date/Time 24-hr format', () => {
    const {
      formatTimeTo24Hour,
      resolveMemberId,
      resolveMemberDisplayName,
    } = require('../src/screens/mainScreens/tasksScreen/taskApiHelpers');

    it('formatTimeTo24Hour converts 12-hr AM/PM, quick chips, and "by" prefixes to valid 24-hour format', () => {
      expect(formatTimeTo24Hour('6:00 PM')).toBe('18:00');
      expect(formatTimeTo24Hour('by 6:00 PM')).toBe('18:00');
      expect(formatTimeTo24Hour('Evening 6:00')).toBe('18:00');
      expect(formatTimeTo24Hour('Afternoon 2:00')).toBe('14:00');
      expect(formatTimeTo24Hour('Morning 9:00')).toBe('09:00');
      expect(formatTimeTo24Hour('9:00 AM')).toBe('09:00');
      expect(formatTimeTo24Hour('18:00')).toBe('18:00');
      expect(formatTimeTo24Hour('09:00')).toBe('09:00');
      expect(formatTimeTo24Hour('12:00 AM')).toBe('00:00');
      expect(formatTimeTo24Hour('12:00 PM')).toBe('12:00');
      expect(formatTimeTo24Hour(undefined)).toBeUndefined();
    });

    it('resolveMemberId resolves member name to member UUID from familyMembers', () => {
      const mockFamilyMembers = [
        {
          memberId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          fullName: 'Rupesh Sharma',
          role: 'ADULT',
          isYou: false,
        },
        {
          memberId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
          fullName: 'Priya Sharma',
          role: 'ADMIN',
          isYou: true,
        },
      ];

      // Resolve by full name
      expect(resolveMemberId('Rupesh Sharma', mockFamilyMembers)).toBe(
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
      );
      // Case-insensitive
      expect(resolveMemberId('rupesh sharma', mockFamilyMembers)).toBe(
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
      );
      // "You" resolves to current user memberId
      expect(resolveMemberId('You', mockFamilyMembers)).toBe(
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'
      );
      // "Priya" resolves to current user memberId
      expect(resolveMemberId('Priya', mockFamilyMembers)).toBe(
        'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e'
      );
      // Already a UUID returns as-is
      expect(
        resolveMemberId('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', mockFamilyMembers)
      ).toBe('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
      // Unknown name returns null
      expect(resolveMemberId('Unknown Person', mockFamilyMembers)).toBeNull();
    });

    it('resolveMemberDisplayName returns human readable name', () => {
      const mockFamilyMembers = [
        {
          memberId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          fullName: 'Rupesh Sharma',
          isYou: false,
        },
        {
          memberId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
          fullName: 'Priya Sharma',
          isYou: true,
        },
      ];

      expect(
        resolveMemberDisplayName('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', mockFamilyMembers)
      ).toBe('Rupesh Sharma');
      expect(
        resolveMemberDisplayName('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', mockFamilyMembers)
      ).toBe('You');
      expect(resolveMemberDisplayName('Rupesh Sharma', mockFamilyMembers)).toBe(
        'Rupesh Sharma'
      );
    });
  });
});

