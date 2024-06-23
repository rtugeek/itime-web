import type { RouteRecordRaw } from 'vue-router'
import CalendarWidgetRoutes from '@/widgets/calendar/CalendarWidgetRoutes'
import TodoListWidgetRoutes from '@/widgets/todo-list/TodoListWidgetRoutes'
import PomodoroWidgetRoutes from '@/widgets/pomodoro/PomodoroWidgetRoutes'
import CountdownWidgetRoutes from '@/widgets/countdown/CountdownWidgetRoutes'

// FBI WANING! IMPORT PLACE, DONT DELETE THIS LINE
const WidgetRouter: RouteRecordRaw[] = [
  // FBI WANING! ROUTE PLACE, DONT DELETE THIS LINE
  ...CalendarWidgetRoutes,
  ...TodoListWidgetRoutes,
  ...CountdownWidgetRoutes,
  ...PomodoroWidgetRoutes,
]
export default WidgetRouter
