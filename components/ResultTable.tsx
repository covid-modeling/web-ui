import classNames from 'classnames'
import numbro from 'numbro'
import React, {FunctionComponent} from 'react'
import styles from './ResultTable.module.css'

type ResultTableProps = {
  title: string
  rows: {label: string; value: string | number}[]
}

const ResultTable: FunctionComponent<ResultTableProps> = ({title, rows}) => {
  return (
    <div>
      <header className={styles.Title}>{title}</header>
      {rows.map((r, i) => (
        <div
          key={i}
          className={classNames(styles.Row, i % 2 === 0 && styles.EvenRow)}
        >
          <div className={styles.Label}>{r.label}</div>
          <div className={styles.Value}>
            {typeof r.value === 'number'
              ? numbro(r.value).format({thousandSeparated: true})
              : r.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ResultTable
