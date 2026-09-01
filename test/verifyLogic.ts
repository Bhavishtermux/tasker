import {
  getTaskSection,
  groupTasksIntoSections,
  filterTasksBySearch,
  generateNextOccurrence,
  calculateNextDueDate,
} from '../src/services/tasks/TaskLogic';
import { calculateProgressMetrics } from '../src/services/tasks/StreakCalculator';
import {
  formatDateToString,
  getTodayDateString,
  getTomorrowDateString,
  addDays,
} from '../src/utils/dateUtils';
import { Task } from '../src/types/task';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

console.log('\n--- Running Unit Verification Tests ---');

// 1. Test Date Section Categorization
console.log('\n1. Testing Date Section Categorization (Overdue, Today, Tomorrow, Upcoming, Completed):');
const todayStr = getTodayDateString();
const tomorrowStr = getTomorrowDateString();
const overdueDate = addDays(todayStr, -2);
const futureDate = addDays(todayStr, 5);

const baseTask: Task = {
  id: 't1',
  title: 'Buy groceries',
  dueDate: todayStr,
  isAllDay: false,
  dueTime: '18:00',
  priority: 'normal',
  reminder: { preset: 'none', offsetMinutes: 0 },
  repeat: { type: 'none' },
  subtasks: [],
  isCompleted: false,
  createdAt: new Date().toISOString(),
};

const overdueTask: Task = { ...baseTask, id: 'overdue-1', title: 'Overdue task', dueDate: overdueDate };
const todayTask: Task = { ...baseTask, id: 'today-1', title: 'Today task', dueDate: todayStr };
const tomorrowTask: Task = { ...baseTask, id: 'tomorrow-1', title: 'Tomorrow task', dueDate: tomorrowStr };
const upcomingTask: Task = { ...baseTask, id: 'upcoming-1', title: 'Upcoming task', dueDate: futureDate };
const completedTask: Task = {
  ...baseTask,
  id: 'comp-1',
  title: 'Completed task',
  dueDate: overdueDate,
  isCompleted: true,
  completedAt: new Date().toISOString(),
};

assert(getTaskSection(overdueTask) === 'overdue', 'Overdue task categorized into overdue');
assert(getTaskSection(todayTask) === 'today', 'Today task categorized into today');
assert(getTaskSection(tomorrowTask) === 'tomorrow', 'Tomorrow task categorized into tomorrow');
assert(getTaskSection(upcomingTask) === 'upcoming', 'Future task categorized into upcoming');
assert(getTaskSection(completedTask) === 'completed', 'Completed task categorized into completed');

const allTasks = [overdueTask, todayTask, tomorrowTask, upcomingTask, completedTask];
const sections = groupTasksIntoSections(allTasks);
assert(sections.length === 5, 'All 5 non-empty sections rendered');
assert(sections[0].type === 'overdue', 'First section is Overdue');
assert(sections[1].type === 'today', 'Second section is Today');
assert(sections[2].type === 'tomorrow', 'Third section is Tomorrow');
assert(sections[3].type === 'upcoming', 'Fourth section is Upcoming');
assert(sections[4].type === 'completed', 'Fifth section is Completed');

// 2. Test Search Filtering
console.log('\n2. Testing Search Filtering:');
const taskA: Task = { ...baseTask, id: 'a', title: 'Buy Groceries', notes: 'Milk and eggs' };
const taskB: Task = { ...baseTask, id: 'b', title: 'Finish assignment', notes: 'Review final draft' };
const taskC: Task = { ...baseTask, id: 'c', title: 'Call Mom', subtasks: [{ id: 's1', title: 'Ask about weekend', isCompleted: false }] };

const searchTitle = filterTasksBySearch([taskA, taskB, taskC], 'groceries');
assert(searchTitle.length === 1 && searchTitle[0].id === 'a', 'Search finds task by title');

const searchNotes = filterTasksBySearch([taskA, taskB, taskC], 'draft');
assert(searchNotes.length === 1 && searchNotes[0].id === 'b', 'Search finds task by notes');

const searchSubtask = filterTasksBySearch([taskA, taskB, taskC], 'weekend');
assert(searchSubtask.length === 1 && searchSubtask[0].id === 'c', 'Search finds task by subtask title');

// 3. Test Recurring Tasks
console.log('\n3. Testing Recurring Task Occurrence Generation:');
const dailyRecurring: Task = {
  ...baseTask,
  id: 'recur-daily',
  dueDate: '2026-09-01',
  repeat: { type: 'daily', interval: 1 },
  subtasks: [{ id: 'sub-1', title: 'Milk', isCompleted: true }],
};

const nextDaily = generateNextOccurrence(dailyRecurring);
assert(nextDaily !== null, 'Next daily occurrence is created');
assert(nextDaily?.dueDate === '2026-09-02', 'Next daily occurrence is scheduled for +1 day');
assert(nextDaily?.isCompleted === false, 'Next occurrence is active/incomplete');
assert(nextDaily?.subtasks[0].isCompleted === false, 'Next occurrence resets subtask completion status');

// 4. Test Progress Metrics & Streak Calculation
console.log('\n4. Testing Progress Metrics & Streak Calculation:');
const completedToday: Task = {
  ...baseTask,
  id: 'c-today',
  dueDate: todayStr,
  isCompleted: true,
  completedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

const completedYesterday: Task = {
  ...baseTask,
  id: 'c-yesterday',
  dueDate: addDays(todayStr, -1),
  isCompleted: true,
  completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

const activeToday: Task = {
  ...baseTask,
  id: 'a-today',
  dueDate: todayStr,
  isCompleted: false,
  createdAt: new Date().toISOString(),
};

const metrics = calculateProgressMetrics([completedToday, completedYesterday, activeToday]);
assert(metrics.tasksCompletedToday === 1, 'Tasks completed today is 1');
assert(metrics.totalCompletedTasks === 2, 'Total completed tasks all time is 2');
assert(metrics.currentStreak >= 2, 'Current streak calculates consecutive days');
assert(metrics.bestStreak >= 2, 'Best streak matches or exceeds current streak');
assert(metrics.weeklyDays.length === 7, 'Weekly breakdown contains 7 days');

console.log('\nAll unit tests passed successfully!\n');
