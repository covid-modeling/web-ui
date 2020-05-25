import serverlessMysql from 'serverless-mysql'

/**
 * Validates that the new table is not smaller than the old table.
 * The assumption is that our fetch data size will never shrink.
 *
 * @db the database to run the queries on
 * @param origTable The original table to check
 * @param newTable The new table to replace the original table
 * @param ignore If true, ignore this check
 *
 * @throws Error if the new table is smaller than the old table.
 */
export async function validateTableLength(
  db: serverlessMysql.ServerlessMysql,
  origTable: string,
  newTable: string,
  ignore: boolean
) {
  if (ignore) {
    return
  }

  const origCount: number = ((await db.query(
    `SELECT count(*) as count from ${origTable}`
  )) as any)[0].count
  const newCount: number = ((await db.query(
    `SELECT count(*) as count from ${newTable}`
  )) as any)[0].count

  if (newCount < origCount) {
    throw new Error(
      `New table ${newTable} has fewer rows than original table ${origTable}. ${newCount} rows and ${origCount} rows respectively`
    )
  }
}
