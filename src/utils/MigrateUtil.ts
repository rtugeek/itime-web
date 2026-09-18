type StoredRecord = Record<string, unknown>

const stores = [
  ['birthday-v1', 'birthdays'],
  ['countdown-event', 'keyvaluepairs'],
  ['todo-v1', 'todos'],
  ['pomodoro-scene', 'keyvaluepairs'],
  ['pomodoro', 'keyvaluepairs'],
] as const

/** Access existing stores without creating or upgrading uninitialized databases. */
function accessRecords(databaseName: string, storeName: string, operation: 'read' | 'clear'): Promise<StoredRecord[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    let missing = false
    let blocked = false

    request.onupgradeneeded = () => {
      missing = true
      request.transaction?.abort()
    }
    request.onerror = () => {
      if (missing) {
        resolve([])
      }
      else {
        reject(request.error)
      }
    }
    request.onblocked = () => {
      blocked = true
      reject(new Error(`Opening IndexedDB database "${databaseName}" was blocked`))
    }
    request.onsuccess = () => {
      const db = request.result
      if (blocked) {
        db.close()
        return
      }
      db.onversionchange = () => db.close()
      if (!db.objectStoreNames.contains(storeName)) {
        db.close()
        resolve([])
        return
      }
      try {
        const transaction = db.transaction(storeName, operation === 'read' ? 'readonly' : 'readwrite')
        const store = transaction.objectStore(storeName)
        const records = operation === 'read' ? store.getAll() : store.clear()
        transaction.oncomplete = () => {
          db.close()
          resolve(operation === 'read' ? records.result as StoredRecord[] : [])
        }
        transaction.onabort = () => {
          db.close()
          reject(transaction.error ?? records.error ?? new Error(`IndexedDB operation "${operation}" on "${databaseName}" was aborted`))
        }
      }
      catch (error) {
        db.close()
        reject(error)
      }
    }
  })
}

/** Standalone browser API: reads iTime data from the current origin's IndexedDB. */
export async function readExportData(includeRemoved = false) {
  const [birthdays, countdowns, todos, pomodoroScenes, pomodoroHistories] = await Promise.all(
    stores.map(([databaseName, storeName]) => accessRecords(databaseName, storeName, 'read')),
  )
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    birthdays: birthdays.filter(birthday => includeRemoved || !birthday.deleteTime),
    countdowns: countdowns.filter(countdown => includeRemoved || !countdown.deleteTime),
    todos: todos.filter(todo => includeRemoved || !todo.deleteTime),
    pomodoroScenes: pomodoroScenes.filter(scene => includeRemoved || !scene.deleteTime),
    pomodoroHistories: pomodoroHistories.filter(history => includeRemoved || !history.deleteTime),
  }
}

/**
 * Permanently clear all five exported stores, including soft-deleted records.
 * Keeps database schemas and unrelated browser data intact. Missing stores are skipped.
 * Each store commits separately; a failure may leave some stores already cleared.
 */
export async function clear(): Promise<void> {
  await clearStores(stores)
}

/** Only clear migrated modules; pomodoro history still uses its original store. */
export async function clearMigratedStores(): Promise<void> {
  await clearStores(stores.filter(([databaseName]) => databaseName !== 'pomodoro'))
}

async function clearStores(selectedStores: ReadonlyArray<readonly [string, string]>): Promise<void> {
  const results = await Promise.allSettled(
    selectedStores.map(([databaseName, storeName]) => accessRecords(databaseName, storeName, 'clear')),
  )
  const failure = results.find(result => result.status === 'rejected')
  if (failure?.status === 'rejected') {
    throw failure.reason
  }
}

/** Download the same data as a JSON file; no project or third-party dependencies. */
export async function exportData(snapshot?: Awaited<ReturnType<typeof readExportData>>) {
  const data = snapshot ?? await readExportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `itime-data-${data.exportedAt.replace(/[:.]/g, '-')}.json`
  try {
    document.body.appendChild(link)
    link.click()
  }
  finally {
    link.remove()
    // Allow the browser to start reading the download before releasing the URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}
