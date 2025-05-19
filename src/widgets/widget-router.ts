import type { RouteRecordRaw } from 'vue-router'
import DeadlineWidgetRoutes from './deadline/DeadlineWidgetRoutes'
import CalendarWidgetRoutes from '@/widgets/calendar/CalendarWidgetRoutes'
import TodoListWidgetRoutes from '@/widgets/todo-list/TodoListWidgetRoutes'
import PomodoroWidgetRoutes from '@/widgets/pomodoro/PomodoroWidgetRoutes'
import CountdownWidgetRoutes from '@/widgets/countdown/CountdownWidgetRoutes'
import BirthdayWidgetRoutes from '@/widgets/birthday-list/BirthdayListWidgetRoutes'
import CountdownListWidgetRoutes from '@/widgets/countdown-list/CountdownListWidgetRoutes'

import CalendarLargeWidgetRoutes from "./calendar-large/CalendarLargeWidgetRoutes";
//FBI WANING! IMPORT PLACE, DONT DELETE THIS LINE
const WidgetRouter: RouteRecordRaw[] = [
  ...DeadlineWidgetRoutes,
  ...CalendarLargeWidgetRoutes,
    // FBI WANING! ROUTE PLACE, DONT DELETE THIS LINE
  ...CalendarWidgetRoutes,
  ...TodoListWidgetRoutes,
  ...CountdownWidgetRoutes,
  ...CountdownListWidgetRoutes,
  ...BirthdayWidgetRoutes,
  ...PomodoroWidgetRoutes,
]
export default WidgetRouter
