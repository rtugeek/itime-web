# 旧数据升级到 UserData 迁移手册

适用对象：实现客户端升级、数据导入或服务端迁移的开发人员。依据：本仓库当前工作区的模型、Repository 与同步实现，旧格式参考当前 Git HEAD 中尚未改造的版本。不同历史版本应先核对实际导出数据。

本文覆盖生日、倒计时、Todo、番茄钟场景四个模块。番茄历史不转换为 UserData，只处理它对场景的引用。

> 当前代码提供新模型的读写与同步，但没有完整的旧库自动迁移入口。`../src/data/db.ts` 当前为空导出，`UserDataRepository` 创建独立的 `userdata-v2` 数据库，不会自动读取旧库。本文中的迁移步骤、迁移日志和 ID 映射表是需要实现的方案，不代表已经存在的功能。

## 1. 数据从哪里来、迁到哪里

| 模块 | 旧版本本地来源 | 新 `dataType` | 新业务数据类型 |
| --- | --- | --- | --- |
| 生日 | Dexie 数据库 `birthday-v1`，表 `birthdays` | `birthday` | `BirthdayPayload` |
| 倒计时 | localforage 实例 `name: 'countdown-event'` | `countdown` | `CountdownPayload` |
| Todo | Dexie 数据库 `todo-v1`，表 `todos` | `todo` | `TodoPayload` |
| 番茄钟场景 | localforage 实例 `name: 'pomodoro-scene'` | `pomodoro_scene` | `PomodoroScenePayload` |

目标统一为 Dexie 数据库 `userdata-v2` 的 `userDatas` 表，主键是字符串 `id`。表内所有模块、账号共用这一主键空间，不是 `[userId, dataType, id]` 联合主键。

更早版本还可能有 localforage `.birthday_list` / `birthday-list-v1` 和 `.todo_list` / `complete-list-v1`。是否读取这些来源应按实际版本确定，并与后续旧库去重，不能把同一条记录重复导入。读取旧库应使用独立的只读适配器或导出文件；当前的四个 Repository 已经读新库，不能用它们查找旧数据。

localforage 可能使用不同存储驱动，应通过对应实例访问，不能仅凭实例名称假定其物理 IndexedDB 表结构。

## 2. 新结构：公共字段放外层，业务字段放 data

本地 UserData 和 UserDataOptions 的 createTime、updateTime、deleteTime 使用 Date（删除时间可为空）。远端 RemoteUserData 及 JSON 导出仍为 ISO 字符串。下文 JSON 示例是序列化形式，导入本地前必须恢复这三个 Date 字段；Payload 中的日期字符串不受此变更影响。userdata-v2 数据库的 schema v2 会把既有 UserData 记录的字符串时间转换为 Date；这一步不负责四个旧模块数据库的迁移。

```ts
interface UserData<T> {
  id: string
  userId: number
  dataType: string
  data: T
  sortOrder: number
  deleteTime?: Date | null
  createTime: Date
  updateTime: Date
  needSync?: boolean       // 仅本地同步元数据
  lastSyncedAt?: Date      // 仅本地同步元数据
}
```

| 新字段 | 迁移规则 |
| --- | --- |
| `id` | 字符串；通过持久化 ID 映射确定，具体见下一节 |
| `userId` | 保留已验证的新系统数字账号；真正未绑定的数据为 `0` |
| `dataType` | 严格使用上述四个字符串，场景为 `pomodoro_scene` |
| `data` | 普通对象，只写对应 Payload 的业务字段；不要再次 `JSON.stringify` |
| `sortOrder` | 原排序值，缺失为 `0`；模型约定范围 `0–65535`，越界应记录并制定归一化规则 |
| `createTime` | 原创建时间，转换为本地 `Date` 对象 |
| `updateTime` | 原最后修改时间，转换为本地 `Date` 对象；不要统一改为迁移时间 |
| `deleteTime` | 原删除时间转 `Date`；未删除为 `null` |
| `needSync` | 从旧存储首次迁入新协议时为 `true`，即使旧云端曾同步成功 |
| `lastSyncedAt` | 首次迁入设为 `undefined`，不能沿用旧协议的同步确认时间 |

旧 `uuid`、`tableId`、旧同步版本等不直接写入新 Payload，可留在迁移日志中用于追溯。只有确认目标 UserData 已存在且版本一致时，才能沿用新协议的同步确认信息。

时间字段缺失时，建议先使用其他可信的原始时间，再使用本次迁移固定的时间作为兜底，并记入日志。无效日期不要默默替换为今天；应隔离记录等待处理。JSON 导入得到的是字符串，调用要求 `Date` 的领域 Repository 前必须恢复类型。

### ID 与账号归属

旧生日和 Todo 的数字 `id` 只在各自旧库内唯一。例如两者都有 `id = 1`，简单转成 `"1"` 会相互覆盖。不同设备的自增生日 ID 也可能相同。

建议维护持久化映射：

```text
(来源系统/设备、旧账号、模块、旧记录主键) -> 新 UserData.id
```

迁移首次为旧本地 ID 分配 `nanoid()`，先持久化映射，再写入新库；重试、历史引用及组件配置都复用这份映射。已经是新版 UserData 的 ID 必须保留。确认跨模块、设备和账号均无冲突的旧字符串 ID 可以保留，但仍应登记映射。

如果同一旧云端记录存在于多台设备，必须用可信的旧云端身份进行去重，并共享映射或采用经服务端确认的统一方案；不能让每台设备各生成一份新记录。旧 `uuid` 可以是去重依据，但不能未经核实就当作新版主键。

旧账号 UUID 或旧系统数字 ID 未必等于新版账号 ID。需要明确账号映射；无法确认归属的数据留在待处理区，不要把它改为游客数据或自动归给当前登录者。当前登录只认领 `userId = 0` 等未绑定数据，不会把已有账号数据转给另一个账号。

## 3. 生日

| 旧字段 | 新位置 | 说明 |
| --- | --- | --- |
| `name` | `data.name` | 姓名 |
| `year` | `data.year` | 原生日年份 |
| `month` | `data.month` | 从 1 开始；农历负数表示闰月 |
| `dayOfMonth` | `data.dayOfMonth` | 从 1 开始 |
| `dateType` | `data.dateType` | `0` 公历，`1` 农历 |
| `introduction` | `data.introduction` | 缺失为 `''` |
| `sortOrder`（若有） | 外层 `sortOrder` | 旧基础模型无此字段时填 `0` |
| `tableId` | 不写入业务数据 | 保留在迁移日志，不能替代新主键 |

如果导出的是旧 `BirthdayWrapper`，先读取其 `birthday` 属性中的原始生日字段。不要迁移 `_isToday` 等计算缓存。

```json
{
  "id": "birthday-new-id",
  "userId": 123,
  "dataType": "birthday",
  "data": {
    "name": "小明", "year": 1995, "month": 8, "dayOfMonth": 16,
    "dateType": 0, "introduction": "朋友"
  },
  "sortOrder": 0,
  "createTime": "2024-01-01T00:00:00.000Z",
  "updateTime": "2024-06-01T00:00:00.000Z",
  "deleteTime": null,
  "needSync": true
}
```

生日保存的是对应历法的年月日，不是“下一次生日”的公历时间。农历生日不能先转成下一次公历日期再拆成年月日。公历月份不要再减 1；只有构造 JavaScript `Date` 时月份下标才从 0 开始。

## 4. 倒计时

| 旧字段 | 新位置 | 说明 |
| --- | --- | --- |
| `name` | `data.name` | 标题 |
| `note` | `data.note` | 缺失为 `''` |
| `image` | `data.image` | 可选，保留原地址；本地地址的跨设备可用性需单独处理 |
| `dateTime` | `data.dateTime` | 当前公历日期 ISO 字符串 |
| `sourceDateTime` | `data.sourceDateTime` | 最初公历日期 ISO 字符串 |
| `dateType` | `data.dateType` | `0` 公历，`1` 农历 |
| `recurrence` | `data.recurrence` | RRULE 字符串，可选 |
| `periodType` | `data.periodType` | 兼容字段，缺失为 `0` |
| `archiveTime` | `data.archiveTime` | 有值转为 ISO 字符串；与删除时间不同 |
| `sortOrder` | 外层 `sortOrder` | 缺失为 `0` |

```json
{
  "name": "纪念日", "note": "", "dateType": 0,
  "dateTime": "2026-09-30T16:00:00.000Z",
  "sourceDateTime": "2020-09-30T16:00:00.000Z",
  "recurrence": "RRULE:FREQ=YEARLY", "periodType": -3
}
```

上面只展示 `data`，外层使用公共规则。即使 `dateType = 1`，两个时间字段仍保存公历时间，不能写入农历日期文本。重复事件的当前日期与初始日期可能不同，不能互相覆盖。

对于只有旧 `periodType` 的记录，迁移器需要补齐 `recurrence`，当前 Repository 不会自动转换：

| `periodType` | 补齐的 `recurrence` |
| --- | --- |
| `0` | 不设置 |
| 正整数 N | `RRULE:FREQ=DAILY;INTERVAL=N` |
| `-1` | `RRULE:FREQ=WEEKLY` |
| `-2` | `RRULE:FREQ=MONTHLY` |
| `-3` | `RRULE:FREQ=YEARLY` |

已有 `recurrence` 时保留它，不用旧字段覆盖；其他数值应报错。对月末、闰年及农历重复单独验收。只有日期、没有时区的旧值，应按旧数据约定的时区解释后转换，不要依赖运行迁移脚本的机器时区。

## 5. Todo

| 旧字段 | 新位置 | 说明 |
| --- | --- | --- |
| `title` | `data.title` | 标题 |
| `dueDateTime` | `data.dueDateTime` | 截止时间 |
| `reminderDateTime` | `data.reminderDateTime` | 提醒时间 |
| `completedDateTime` | `data.completedDateTime` | 完成时间；有值表示已完成，不是已删除 |
| `importance` | `data.importance` | `low` / `normal` / `high` |
| `recurrence` | `data.recurrence` | 重复规则 |
| `startDateTime` | `data.startDateTime` | 开始时间 |
| `isReminderOn` | `data.isReminderOn` | 缺失为 `false`，必须是布尔值 |
| `order` | 外层 `sortOrder` | 缺失为 `0` |
| `createdDateTime`，其次 `createTime` | 外层 `createTime` | 对应当前 Repository 的优先级 |
| `updateTime`，其次 `lastModifiedDateTime` | 外层 `updateTime` | 对应当前 Repository 的优先级 |

```json
{
  "title": "整理迁移文档",
  "dueDateTime": "2026-09-15T10:00:00.000Z",
  "reminderDateTime": "2026-09-15T09:00:00.000Z",
  "importance": "normal",
  "isReminderOn": true
}
```

上面只展示 `data`。迁移必须读取全部 Todo，包括已完成和软删除记录，不能只调用旧“未完成列表”。不要在迁移时触发提醒或重新计算下一次重复任务，以免额外生成记录。

## 6. 番茄钟场景与历史引用

| 旧场景字段 | 新位置 | 说明 |
| --- | --- | --- |
| `name` | `data.name` | 场景名 |
| `icon` | `data.icon` | 原图标字符串 |
| `duration` | `data.duration` | 累计时长，单位为秒；缺失为 `0` |
| `sortOrder` | 外层 `sortOrder` | 缺失为 `0` |

```json
{
  "name": "阅读",
  "icon": "📖",
  "duration": 3600
}
```

上面只展示 `data`，外层 `dataType` 必须是 `pomodoro_scene`。不要把累计时长换算成分钟，也不要套用 `DefaultScenes` 覆盖用户场景。

### PomodoroHistory 不转换为 UserData

历史继续使用 `PomodoroHistory`，本地存储为 localforage `name: 'pomodoro'`，同步仍走 `/pomodoro/history`。历史自身的数字 `id` 必须保持不变。

如果旧场景 `id = 42` 映射到新 `id = 'scene-new-id'`，对应历史的 `sceneId` 必须更新为 `'scene-new-id'`：

```text
迁移前：history.id = 9001，history.sceneId = 42
迁移后：history.id = 9001，history.sceneId = 'scene-new-id'
```

匹配时同时检查原账号及来源，旧数字/字符串 ID 可用 `String(oldSceneId)` 统一比较。枚举历史时包括软删除记录，避免只更新活跃记录。保留开始时间、结束时间、累计时长及删除标记；引用变更后设 `needSync = true`，清除旧 `syncVersion` 和 `lastSyncedAt`，并保留原修改时间。可以使用 `PomodoroHistoryRepository.save(history, true)` 保留时间。

迁移顺序：保存并验证新场景 → 更新所有相关历史引用及组件配置 → 记录映射完成 → 先同步场景，再同步历史。找不到原场景的历史应记录为孤立引用，不要随意归到默认场景。

## 7. 如何写入新库

推荐迁移器直接构造合法的 `UserData<Payload>`，再逐条调用：

```ts
import type { BirthdayPayload } from '@/data/Birthday'
import type { UserData } from '@/data/UserData'
import { UserDataRepository } from '@/data/repository/UserDataRepository'

// row 已完成字段校验、账号核实和 ID 映射；迁移日志也已落盘。
async function insertMigratedBirthday(row: UserData<BirthdayPayload>) {
  const existing = await UserDataRepository.findOne({ id: row.id })
  if (existing) {
    // 交由迁移日志判断是重跑、已被用户编辑还是 ID 冲突。
    // 不允许直接 put 覆盖；已完成记录应在调用本函数前跳过。
    throw new Error(`目标 ID 已存在，需要核对迁移记录：${row.id}`)
  }
  return UserDataRepository.save(
    { ...row, needSync: true, lastSyncedAt: undefined },
    true, // 待同步到新协议
    true, // 保留原 createTime / updateTime
  )
}
```

此示例只是单条写入，不是完整迁移器；前提是已阻止其他页面和窗口并发写入。批量导入需要持久化迁移日志和互斥控制。`findOne` 与 `save` 并非原子操作，不能据此宣称已具备并发安全。

如果复用领域 Repository，需要先规范化旧对象；各模块参数不同：

| Repository 调用 | 正确迁移方式 |
| --- | --- |
| `BirthdayRepository.save(birthday, true, true)` | birthday 的日期属性先恢复为 `Date` |
| `CountdownEventRepository.save(event, true, true)` | 先补齐旧重复规则和字符串 ID |
| `TodoRepository.save(todo, true, true)` | 先统一旧时间字段与字符串 ID |
| `PomodoroSceneRepository.save(scene, true)` | 第二参数是 `preserveTime`；另设 `scene.needSync = true` |

所有模块都要清空旧 `lastSyncedAt`。不要用 `saveAll` 代替上述写入：当前部分批量接口没有保留时间的参数。

### 本地记录与 HTTP 请求不能混用

当前 `UserDataApi.create/update` 接受 `id`、`dataType`、`data`、`searchText`、`sortOrder`；账号由登录凭证决定。请求不包含 `needSync`、`lastSyncedAt`，也没有保留历史创建/更新时间的参数。普通 POST/PUT 不能被当作能完整保留旧时间与删除状态的服务端批量迁移接口。

客户端导入使用 Repository 后交给 `UserDataSync`。如果需要迁移旧服务器上的全部记录、保留历史时间或删除墓碑，需要另外实现经确认的服务端迁移流程。仅在本地导入一条已删除且新版云端不存在的记录，不会在云端创建删除墓碑；不能靠它阻止其他设备稍后重复导入旧活跃副本。

## 8. 推荐执行流程

1. **备份并建立清单。** 导出全部旧数据、历史记录及组件配置，记录来源、账号、数量和原始内容摘要。备份不覆盖旧库。
2. **暂停写入与同步。** 关闭旧版本其他窗口，迁移应在新版本 Store 初始化、默认数据创建、提醒和自动同步前完成；当前项目没有现成的一键暂停迁移接口，需要实现启动门禁。
3. **预检。** 验证必填字段、日期、账号、排序和旧 ID；生成错误清单，并计算四模块及历史引用的预计数量。
4. **持久化映射。** 确定去重身份，为每条旧记录记录稳定的新 ID。先写映射，再写新数据，确保中断后不重新生成 ID。
5. **逐条转换并验证落库。** 日志保存状态，例如 `mapped`、`written`、`referencesUpdated`、`verified`。重复执行时核对既有目标记录，不覆盖迁移后用户的编辑或云端更新。
6. **修复场景引用。** 根据映射更新历史及持有旧 ID 的组件配置。跨 Dexie 与 localforage 无统一事务，依靠分阶段日志恢复，不要中途删除旧场景。
7. **验收后启用新读写。** 对账通过才记录完整迁移版本；任一步失败都保留旧源和日志，不写“迁移完成”。
8. **恢复同步。** 先同步四模块的 UserData，再同步番茄历史；检查同步错误与服务端返回，不能仅因 `await sync()` 返回就视为全部成功。
9. **保留回滚材料。** 本地迁移成功后仍保留旧库一段兼容期。已经上传云端的数据，恢复本地备份不会撤销云端写入，需要单独制定回滚方案。

## 9. 验收清单

- 四模块迁移前后按账号对账：总数、活跃数、软删除数一致；Todo 还要核对已完成数。
- 同模块和跨模块相同旧数字 ID 不覆盖；同一旧云端记录跨设备不重复生成。
- 农历生日及负数闰月保持原意；倒计时保留初始日期、当前日期、归档和重复规则。
- Todo 保留完成时间、提醒开关、提醒时间、重要性和排序。
- 场景累计秒数不变，历史自身 ID 不变，所有 `sceneId` 能解析到正确账号的场景或被明确列为孤立引用。
- 中途断电或失败后重跑不增加重复项、不覆盖新编辑，映射与日志能继续使用。
- 登录另一账号不会认领上一账号的数据；未确认归属的数据不会被上传。
- 同步失败后本地数据仍在；完成后在另一设备核对实际云端结果。

## 10. 代码索引

| 内容 | 仓库文件 |
| --- | --- |
| 公共结构、远端结构 | `../src/data/UserData.ts` |
| 生日字段与转换 | `../src/data/Birthday.ts`、`src/data/repository/BirthdayRepository.ts` |
| 倒计时字段与转换 | `../src/data/CountdownEvent.ts`、`src/data/repository/CountdownEventRepository.ts` |
| Todo 字段与转换 | `../src/data/Todo.ts`、`src/data/repository/TodoRepository.ts` |
| 场景字段与转换 | `../src/data/PomodoroScene.ts`、`src/data/repository/PomodoroSceneRepository.ts` |
| 历史结构与存储 | `../src/data/PomodoroHistory.ts`、`src/data/repository/PomodoroHistoryRepository.ts` |
| 新库与保留时间写入 | `../src/data/repository/UserDataRepository.ts` |
| 新协议同步与历史同步 | `../src/data/sync/UserDataSync.ts`、`src/data/sync/PomodoroHistorySync.ts` |
| HTTP 请求字段 | `../src/api/UserDataApi.ts` |

后续模型发生变化时，以对应 Payload 和 Repository 映射为准，同时更新本文和迁移回归测试。

