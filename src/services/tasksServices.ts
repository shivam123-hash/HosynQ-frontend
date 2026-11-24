// HosynQ-frontend/src/services/tasksServices.ts
import apiClient from './apiClient';
import API_ROUTES from '../redux/endPoints/endPoints';

export interface TaskAssigneeData {
  memberId: string;
  fullName: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  doneAt: string | null;
}

export interface TaskItemData {
  id: string;
  title: string;
  notes: string | null;
  category: 'HOUSEHOLD' | 'FAMILY' | 'PERSONAL' | 'FINANCE' | 'HEALTH' | 'TRAVEL' | 'WORK';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueOn: string | null;
  dueTime: string | null;
  visibility: 'EVERYONE' | 'ADULTS_ONLY' | 'ASSIGNEES_ONLY';
  repeat: string | null;
  repeatDays: string[] | null;
  repeatEndsOn: string | null;
  seriesId: string | null;
  reminders: string[];
  customReminderTime: string | null;
  remindViewersToo: boolean;
  status: 'PENDING' | 'DONE';
  completedAt: string | null;
  completedByMemberId: string | null;
  assignees: TaskAssigneeData[];
  createdBy: {
    memberId: string;
    fullName: string | null;
    avatarUrl: string | null;
    avatarColor: string | null;
  } | null;
  isOverdue?: boolean;
  isToday?: boolean;
  dueFormatted?: string;
  createdAt: string;
}

export interface ListTasksQueryParams {
  status?: 'PENDING' | 'DONE';
  assigneeMemberId?: string;
  priority?: string[];
  category?: string[];
  due?: 'ANY' | 'OVERDUE' | 'TODAY' | 'THIS_WEEK';
  q?: string;
  page?: number;
  limit?: number;
  today?: string;
}

export interface ListTasksResponse {
  success: boolean;
  appliedFilters: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
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
    topFinisher: {
      memberId: string;
      fullName: string;
      avatarUrl?: string | null;
      avatarColor?: string | null;
      count: number;
    } | null;
  };
  tasks: TaskItemData[];
}

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  assigneeMemberIds: string[];
  category?: string;
  priority?: string;
  dueOn?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  visibility?: string;
  repeat?: string;
  repeatDays?: string[];
  repeatEndsOn?: string;
  reminders?: string[];
  customReminderTime?: string;
  remindViewersToo?: boolean;
}

export interface CreateTaskResponse {
  success: boolean;
  task: TaskItemData;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  scope?: 'THIS_ONE' | 'THIS_AND_FUTURE';
}

export interface TaskDetailResponse {
  success: boolean;
  task: TaskItemData & {
    completedBy?: { memberId: string; fullName: string | null } | null;
    comments: {
      count: number;
      latest: Array<{
        id: string;
        body: string;
        author: { memberId: string; fullName: string | null; avatarColor: string | null } | null;
        isMine: boolean;
        createdAt: string;
      }>;
    };
    permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canReassign: boolean;
      canComplete: boolean;
      canReopen: boolean;
      completesOwnPartOnly: boolean;
      canRemind: boolean;
    };
    myPartDone: boolean | null;
    reminder: {
      canRemind: boolean;
      cooldownMinutesRemaining: number;
      lastRemindedAt: string | null;
      lastRemindedBy: { fullName: string | null } | null;
      eligibleMemberIds: string[];
    };
  };
}

export interface ReassignTaskPayload {
  memberId: string;
  notify?: boolean;
}

export interface RemindableMemberData {
  memberId: string;
  fullName: string | null;
  avatarUrl: string | null;
  avatarColor: string | null;
  canRemindNow: boolean;
  nextAllowedAt: string | null;
}

export interface TaskReminderState {
  canRemind: boolean;
  remindableMembers: RemindableMemberData[];
  nextAllowedAt: string | null;
  lastReminder: {
    at: string;
    by: { memberId?: string; fullName: string | null; avatarColor?: string | null } | null;
    to: Array<{ memberId?: string; fullName: string | null; avatarColor?: string | null }>;
  } | null;
}

export interface GetReminderStateResponse {
  success: boolean;
  reminder: TaskReminderState;
}

export interface RemindTaskPayload {
  memberIds?: string[];
}

export interface RemindTaskResponse {
  success: boolean;
  remindedMemberIds: string[];
  pushDelivered: boolean;
  reminder: TaskReminderState;
}

export interface CreateCommentPayload {
  body: string;
  mentionMemberIds?: string[];
}
export type AddCommentPayload = CreateCommentPayload;
export type FetchTasksParams = ListTasksQueryParams;

export interface TaskCommentItemData {
  id: string;
  body: string;
  mentionMemberIds?: string[];
  author: {
    memberId: string;
    fullName: string | null;
    avatarUrl: string | null;
    avatarColor: string | null;
  } | null;
  isMine: boolean;
  createdAt: string;
}

export interface TaskCommentsPagination {
  limit: number;
  total: number;
  hasOlder: boolean;
  olderCursor: string | null;
}

export interface TaskCommentsResponse {
  success: boolean;
  comments: TaskCommentItemData[];
  pagination: TaskCommentsPagination;
}

export interface CreateTaskCommentResponse {
  success: boolean;
  comment: TaskCommentItemData;
}

export interface WorkloadMemberData {
  memberId: string;
  fullName: string;
  avatarUrl: string | null;
  avatarColor: string | null;
  activeTasksCount: number;
  doneThisWeekCount: number;
}

export interface TaskWorkloadResponse {
  success: boolean;
  members: WorkloadMemberData[];
}

const tasksServices = {
  /** 1. Get task list with filters and counts (GET /api/v1/tasks) */
  listTasks: async (params?: ListTasksQueryParams): Promise<ListTasksResponse> => {
    try {
      const response = await apiClient.get<ListTasksResponse>(API_ROUTES.TASKS, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 2. Create a new task (POST /api/v1/tasks) */
  createTask: async (payload: CreateTaskPayload): Promise<CreateTaskResponse> => {
    try {
      const response = await apiClient.post<CreateTaskResponse>(API_ROUTES.TASKS, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 3. Get single task details (GET /api/v1/tasks/:id) */
  getTask: async (taskId: string, today?: string): Promise<TaskDetailResponse> => {
    try {
      const response = await apiClient.get<TaskDetailResponse>(API_ROUTES.TASK_BY_ID(taskId), {
        params: today ? { today } : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 4. Update task details (PATCH /api/v1/tasks/:id) */
  updateTask: async (taskId: string, payload: UpdateTaskPayload): Promise<CreateTaskResponse> => {
    try {
      const response = await apiClient.patch<CreateTaskResponse>(API_ROUTES.TASK_BY_ID(taskId), payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 5. Soft-delete task (DELETE /api/v1/tasks/:id) */
  deleteTask: async (
    taskId: string,
    scope?: 'THIS_ONE' | 'THIS_AND_FUTURE'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        API_ROUTES.TASK_BY_ID(taskId),
        {
          params: scope ? { scope } : undefined,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 6. Mark task as completed (POST /api/v1/tasks/:id/complete) */
  completeTask: async (taskId: string, today?: string): Promise<any> => {
    try {
      const response = await apiClient.post(API_ROUTES.TASK_COMPLETE(taskId), {}, {
        params: today ? { today } : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 7. Reopen task (POST /api/v1/tasks/:id/reopen) */
  reopenTask: async (taskId: string): Promise<any> => {
    try {
      const response = await apiClient.post(API_ROUTES.TASK_REOPEN(taskId), {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 8. Reassign task to another member (POST /api/v1/tasks/:id/reassign) */
  reassignTask: async (taskId: string, payload: ReassignTaskPayload): Promise<any> => {
    try {
      const response = await apiClient.post(API_ROUTES.TASK_REASSIGN(taskId), payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 9. Check reminder state (GET /api/v1/tasks/:id/reminder) */
  getReminderState: async (taskId: string): Promise<GetReminderStateResponse> => {
    try {
      const response = await apiClient.get<GetReminderStateResponse>(
        API_ROUTES.TASK_REMINDER_STATE(taskId)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 10. Send reminder to assignees (POST /api/v1/tasks/:id/remind) */
  remindTask: async (
    taskId: string,
    payload?: RemindTaskPayload
  ): Promise<RemindTaskResponse> => {
    try {
      // Backend validates @ArrayNotEmpty() on memberIds. If empty or undefined, send empty object to remind all eligible members.
      const body =
        payload && Array.isArray(payload.memberIds) && payload.memberIds.length > 0
          ? { memberIds: payload.memberIds }
          : {};
      const response = await apiClient.post<RemindTaskResponse>(
        API_ROUTES.TASK_REMIND(taskId),
        body
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 11. Get member task workload for reassignment (GET /api/v1/tasks/workload) */
  getWorkload: async (today?: string): Promise<TaskWorkloadResponse> => {
    try {
      const response = await apiClient.get<TaskWorkloadResponse>(API_ROUTES.TASKS_WORKLOAD, {
        params: today ? { today } : undefined,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 12. Get task comments (GET /api/v1/tasks/:id/comments) */
  getComments: async (
    taskId: string,
    before?: string | null,
    limit: number = 30
  ): Promise<TaskCommentsResponse> => {
    try {
      const params: Record<string, any> = {};
      if (typeof limit === 'number' && limit > 0) {
        params.limit = limit;
      }
      if (before && typeof before === 'string' && before.trim().length > 0) {
        params.before = before.trim();
      }
      const response = await apiClient.get<TaskCommentsResponse>(
        API_ROUTES.TASK_COMMENTS(taskId),
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** 13. Add comment to task (POST /api/v1/tasks/:id/comments) */
  addComment: async (
    taskId: string,
    payload: CreateCommentPayload
  ): Promise<CreateTaskCommentResponse> => {
    try {
      const response = await apiClient.post<CreateTaskCommentResponse>(
        API_ROUTES.TASK_COMMENTS(taskId),
        payload
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /** Aliases aligned with Master Specification */
  checkReminderState: async (taskId: string): Promise<any> => {
    return tasksServices.getReminderState(taskId);
  },

  sendReminder: async (taskId: string, payload?: RemindTaskPayload): Promise<any> => {
    return tasksServices.remindTask(taskId, payload);
  },

  getTasks: async (params?: ListTasksQueryParams): Promise<ListTasksResponse> => {
    return tasksServices.listTasks(params);
  },
};

export default tasksServices;
