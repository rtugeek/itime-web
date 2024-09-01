import type { RouteRecordRaw } from 'vue-router'
import DeadlineWidgetRoutes from './deadline/DeadlineWidgetRoutes'
import CalendarWidgetRoutes from '@/widgets/calendar/CalendarWidgetRoutes'
import TodoListWidgetRoutes from '@/widgets/todo-list/TodoListWidgetRoutes'
import PomodoroWidgetRoutes from '@/widgets/pomodoro/PomodoroWidgetRoutes'
import CountdownWidgetRoutes from '@/widgets/countdown/CountdownWidgetRoutes'
import BirthdayListWidgetRoutes from '@/widgets/birthday-list/BirthdayListWidgetRoutes'

// FBI WANING! IMPORT PLACE, DONT DELETE THIS LINE
const WidgetRouter: RouteRecordRaw[] = [
  ...DeadlineWidgetRoutes,
  // FBI WANING! ROUTE PLACE, DONT DELETE THIS LINE
  ...CalendarWidgetRoutes,
  ...TodoListWidgetRoutes,
  ...CountdownWidgetRoutes,
  ...BirthdayListWidgetRoutes,
  ...PomodoroWidgetRoutes,
]
export default WidgetRouter
