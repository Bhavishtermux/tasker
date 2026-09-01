import {
  getTaskSection,
  groupTasksIntoSections,
  groupTasksForDate,
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
  getWeekDaysForDate,
  getTimeOfDayFromTime,
} from '../src/utils/dateUtils';
import { Task } from '../src/types/task';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

console.log('\n--- Running Unit Verification Tests ---');

// 1. Test Date Section Categorization & Time-of-Day Grouping
console.log('\n1. Testing Time-of-Day Grouping (Morning, Afternoon, Evening, Completed):');
const todayStr = getTodayDateString();

const morningTask: Task = {
  id: 'm1',
  title: 'design user registration process',
  category: 'coinbase',
  dueDate: todayStr,
  dueTime: '09:30',
  timeOfDay: 'morning',
  estimatedMinutes: 50,
  isAllDay: false,
  reminder: { preset: 'none', offsetMinutes: 0 },
  repeat: { type: 'none' },
  priority: 'normal',
  subtasks: [],
  isCompleted: false,
  createdAt: new Date().toISOString(),
};

const afternoonTask: Task = {
  id: 'a1',
  title: 'finalize color palette and typography',
  category: 'apple',
  dueDate: todayStr,
  dueTime: '14:00',
  timeOfDay: 'afternoon',
  estimatedMinutes: 25,
  isAllDay: false,
  reminder: { preset: 'none', offsetMinutes: 0 },
  repeat: { type: 'none' },
  priority: 'normal',
  subtasks: [],
  isCompleted: false,
  createdAt: new Date().toISOString(),
};

const completedTodayTask: Task = {
  ...morningTask,
  id: 'c1',
  isCompleted: true,
  completedAt: new Date().toISOString(),
};

const dateSections = groupTasksForDate([morningTask, afternoonTask, completedTodayTask], todayStr);
assert(dateSections.length === 3, 'Date sections contains Morning, Afternoon, Completed');
assert(dateSections[0].type === 'morning', 'First section is Morning');
assert(dateSections[1].type === 'afternoon', 'Second section is Afternoon');
assert(dateSections[2].type === 'completed', 'Third section is Completed');

// 2. Test Week Calendar Strip
console.log('\n2. Testing Week Calendar Strip:');
const weekDays = getWeekDaysForDate(todayStr);
assert(weekDays.length === 7, 'Week days generator returns 7 days');
assert(weekDays[0].dayName === 'Mon', 'Week starts with Monday');
assert(weekDays[6].dayName === 'Sun', 'Week ends with Sunday');
const todayInWeek = weekDays.find((d) => d.isToday);
assert(todayInWeek !== undefined, 'Current day is marked as isToday');

// 3. Test Recurring Tasks
console.log('\n3. Testing Recurring Task Occurrence Generation:');
const dailyRecurring: Task = {
  ...morningTask,
  id: 'recur-daily',
  dueDate: '2026-09-01',
  repeat: { type: 'daily', interval: 1 },
  subtasks: [{ id: 'sub-1', title: 'Sub 1', isCompleted: true }],
};

const nextDaily = generateNextOccurrence(dailyRecurring);
assert(nextDaily !== null, 'Next daily occurrence is created');
assert(nextDaily?.dueDate === '2026-09-02', 'Next daily occurrence is scheduled for +1 day');
assert(nextDaily?.isCompleted === false, 'Next occurrence is active/incomplete');
assert(nextDaily?.subtasks[0].isCompleted === false, 'Next occurrence resets subtask completion status');

// 4. Test Search Filtering
console.log('\n4. Testing Search Filtering:');
const searchTag = filterTasksBySearch([morningTask, afternoonTask], 'coinbase');
assert(searchTag.length === 1 && searchTag[0].category === 'coinbase', 'Search filters by @category');

const searchTitle = filterTasksBySearch([morningTask, afternoonTask], 'registration');
assert(searchTitle.length === 1 && searchTitle[0].id === 'm1', 'Search filters by title text');

// 5. Test Progress & Streak Calculation
console.log('\n5. Testing Progress & Streaks:');
const metrics = calculateProgressMetrics([morningTask, afternoonTask, completedTodayTask]);
assert(metrics.tasksCompletedToday === 1, 'Tasks completed today is 1');
assert(metrics.totalCompletedTasks === 1, 'Total completed tasks is 1');
assert(metrics.weeklyDays.length === 7, 'Weekly breakdown contains 7 days');

console.log('\nAll updated UI & logic unit tests passed successfully!\n');
