// HosynQ-frontend/src/redux/features/tasks/tasksSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import tasksServices, {
  CreateCommentPayload,
  CreateTaskPayload,
  CreateTaskResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  ReassignTaskPayload,
  RemindTaskPayload,
  TaskDetailResponse,
  TaskItemData,
  TaskWorkloadResponse,
  UpdateTaskPayload,
  WorkloadMemberData,
} from '../../../services/tasksServices';

export interface TasksState {
  tasks: TaskItemData[];
  selectedTask: TaskDetailResponse['task'] | null;
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  success: boolean;
  counts: {
    pending: number;
    completed: number;
  };
  summary: {
    overdue: number;
    dueThisWeek: number;
  };
  doneThisWeek: {
    count: number;
    topFinisher: any | null;
  };
  workload: WorkloadMemberData[];
  workloadLoading: boolean;
  pagination: {
    page: number;
    total: number;
    hasNextPage: boolean;
  };
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  success: false,
  counts: { pending: 0, completed: 0 },
  summary: { overdue: 0, dueThisWeek: 0 },
  doneThisWeek: { count: 0, topFinisher: null },
  workload: [],
  workloadLoading: false,
  pagination: { page: 1, total: 0, hasNextPage: false },
};

/** 1. Fetch Tasks Thunk (GET /api/v1/tasks) */
export const fetchTasksThunk = createAsyncThunk<
  ListTasksResponse,
  ListTasksQueryParams | undefined,
  { rejectValue: string }
>('tasks/fetchTasks', async (params, { rejectWithValue }) => {
  try {
    console.log('[fetchTasks API] Query Params:', params);
    const response = await tasksServices.listTasks(params);
    console.log('[fetchTasks API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch tasks.';
    console.log('[fetchTasks API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchTasks = fetchTasksThunk;

/** 2. Create Task Thunk (POST /api/v1/tasks) */
export const createTaskThunk = createAsyncThunk<
  CreateTaskResponse,
  CreateTaskPayload,
  { rejectValue: string }
>('tasks/createTask', async (payload, { rejectWithValue, dispatch }) => {
  try {
    console.log('[createTask API] Payload:', payload);
    const response = await tasksServices.createTask(payload);
    console.log('[createTask API] Success Response:', response);
    // Refresh pending task list
    dispatch(fetchTasksThunk({ status: 'PENDING' }));
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create task.';
    console.log('[createTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const createTask = createTaskThunk;

/** 3. Fetch Task Detail Thunk (GET /api/v1/tasks/:id) */
export const fetchTaskDetailThunk = createAsyncThunk<
  TaskDetailResponse,
  { taskId: string; today?: string },
  { rejectValue: string }
>('tasks/fetchTaskDetail', async ({ taskId, today }, { rejectWithValue }) => {
  try {
    console.log('[fetchTaskDetail API] Requesting Task ID:', taskId);
    const response = await tasksServices.getTask(taskId, today);
    console.log('[fetchTaskDetail API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch task detail.';
    console.log('[fetchTaskDetail API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchTaskDetail = fetchTaskDetailThunk;

/** 4. Update Task Thunk (PATCH /api/v1/tasks/:id) */
export const updateTaskThunk = createAsyncThunk<
  CreateTaskResponse,
  { taskId: string; payload: UpdateTaskPayload },
  { rejectValue: string }
>('tasks/updateTask', async ({ taskId, payload }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[updateTask API] Updating Task ID:', taskId, 'Payload:', payload);
    const response = await tasksServices.updateTask(taskId, payload);
    console.log('[updateTask API] Success Response:', response);
    dispatch(fetchTaskDetailThunk({ taskId }));
    dispatch(fetchTasksThunk());
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update task.';
    console.log('[updateTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const updateTask = updateTaskThunk;

/** 5. Complete Task Thunk (POST /api/v1/tasks/:id/complete) */
export const completeTaskThunk = createAsyncThunk<
  string,
  { taskId: string; today?: string },
  { rejectValue: string }
>('tasks/completeTask', async ({ taskId, today }, { rejectWithValue }) => {
  try {
    console.log('[completeTask API] Completing Task ID:', taskId);
    await tasksServices.completeTask(taskId, today);
    return taskId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to complete task.';
    console.log('[completeTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const completeTask = completeTaskThunk;

/** 6. Reopen Task Thunk (POST /api/v1/tasks/:id/reopen) */
export const reopenTaskThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('tasks/reopenTask', async (taskId, { rejectWithValue }) => {
  try {
    console.log('[reopenTask API] Reopening Task ID:', taskId);
    await tasksServices.reopenTask(taskId);
    return taskId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to reopen task.';
    console.log('[reopenTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const reopenTask = reopenTaskThunk;

/** 7. Delete Task Thunk (DELETE /api/v1/tasks/:id) */
export const deleteTaskThunk = createAsyncThunk<
  string,
  string | { taskId: string; scope?: 'THIS_ONE' | 'THIS_AND_FUTURE' },
  { rejectValue: string }
>('tasks/deleteTask', async (arg, { rejectWithValue }) => {
  const taskId = typeof arg === 'string' ? arg : arg.taskId;
  const scope = typeof arg === 'string' ? undefined : arg.scope;
  try {
    console.log('[deleteTask API] Deleting Task ID:', taskId, 'Scope:', scope);
    await tasksServices.deleteTask(taskId, scope);
    return taskId;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to delete task.';
    console.log('[deleteTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const deleteTask = deleteTaskThunk;

/** 8. Reassign Task Thunk (POST /api/v1/tasks/:id/reassign) */
export const reassignTaskThunk = createAsyncThunk<
  void,
  { taskId: string; payload: ReassignTaskPayload },
  { rejectValue: string }
>('tasks/reassignTask', async ({ taskId, payload }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[reassignTask API] Task ID:', taskId, 'Payload:', payload);
    await tasksServices.reassignTask(taskId, payload);
    dispatch(fetchTaskDetailThunk({ taskId }));
    dispatch(fetchTasksThunk());
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to reassign task.';
    console.log('[reassignTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const reassignTask = reassignTaskThunk;

/** 9. Send Reminder Thunk (POST /api/v1/tasks/:id/remind) */
export const remindTaskThunk = createAsyncThunk<
  void,
  { taskId: string; payload?: RemindTaskPayload },
  { rejectValue: string }
>('tasks/remindTask', async ({ taskId, payload }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[remindTask API] Reminding Task ID:', taskId);
    await tasksServices.remindTask(taskId, payload);
    dispatch(fetchTaskDetailThunk({ taskId }));
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send task reminder.';
    console.log('[remindTask API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const remindTask = remindTaskThunk;

/** 10. Fetch Member Workload Thunk (GET /api/v1/tasks/workload) */
export const fetchWorkloadThunk = createAsyncThunk<
  TaskWorkloadResponse,
  string | undefined,
  { rejectValue: string }
>('tasks/fetchWorkload', async (today, { rejectWithValue }) => {
  try {
    console.log('[fetchWorkload API] Fetching workload...');
    const response = await tasksServices.getWorkload(today);
    console.log('[fetchWorkload API] Success Response:', response);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to load workload.';
    console.log('[fetchWorkload API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchWorkload = fetchWorkloadThunk;

/** 11. Add Comment Thunk (POST /api/v1/tasks/:id/comments) */
export const addTaskCommentThunk = createAsyncThunk<
  void,
  { taskId: string; payload: CreateCommentPayload },
  { rejectValue: string }
>('tasks/addComment', async ({ taskId, payload }, { rejectWithValue, dispatch }) => {
  try {
    console.log('[addComment API] Task ID:', taskId, 'Payload:', payload);
    await tasksServices.addComment(taskId, payload);
    dispatch(fetchTaskDetailThunk({ taskId, today: new Date().toISOString().slice(0, 10) }));
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to add comment.';
    console.log('[addComment API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const addTaskComment = addTaskCommentThunk;

/** 12. Fetch Task Comments Thunk (GET /api/v1/tasks/:id/comments) */
export const fetchTaskCommentsThunk = createAsyncThunk<
  any,
  { taskId: string; before?: string; limit?: number },
  { rejectValue: string }
>('tasks/fetchComments', async ({ taskId, before, limit }, { rejectWithValue }) => {
  try {
    console.log('[fetchComments API] Task ID:', taskId, 'Params:', { before, limit });
    const response = await tasksServices.getComments(taskId, before, limit);
    return response;
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch comments.';
    console.log('[fetchComments API] Error Response:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: errorMsg,
    });
    return rejectWithValue(
      Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
    );
  }
});
export const fetchTaskComments = fetchTaskCommentsThunk;

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    resetTasksState: () => initialState,
  },
  extraReducers: (builder) => {
    // List Tasks
    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.counts = action.payload.counts;
        state.summary = action.payload.summary;
        state.doneThisWeek = action.payload.doneThisWeek;
        state.pagination = {
          page: action.payload.pagination.page,
          total: action.payload.pagination.total,
          hasNextPage: action.payload.pagination.hasNextPage,
        };
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tasks.';
      });

    // Create Task
    builder
      .addCase(createTaskThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTaskThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create task.';
      });

    // Task Detail
    builder
      .addCase(fetchTaskDetailThunk.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskDetailThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedTask = action.payload.task;
      })
      .addCase(fetchTaskDetailThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to fetch task detail.';
      });

    // Complete Task
    builder.addCase(completeTaskThunk.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      if (state.counts) {
        state.counts.pending = Math.max(0, state.counts.pending - 1);
        state.counts.completed = state.counts.completed + 1;
      }
    });

    // Reopen Task
    builder.addCase(reopenTaskThunk.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      if (state.counts) {
        state.counts.completed = Math.max(0, state.counts.completed - 1);
        state.counts.pending = state.counts.pending + 1;
      }
    });

    // Delete Task
    builder.addCase(deleteTaskThunk.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    });

    // Member Workload
    builder
      .addCase(fetchWorkloadThunk.pending, (state) => {
        state.workloadLoading = true;
      })
      .addCase(fetchWorkloadThunk.fulfilled, (state, action) => {
        state.workloadLoading = false;
        state.workload = action.payload.members;
      })
      .addCase(fetchWorkloadThunk.rejected, (state) => {
        state.workloadLoading = false;
      });
  },
});

export const { clearTasksError, clearSelectedTask, resetTasksState } = tasksSlice.actions;
export default tasksSlice.reducer;
