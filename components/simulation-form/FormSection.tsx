import {PropsWithChildren} from 'react'
import styles from './FormSection.module.css'

type Props = {
  title?: string
  description?: string
  isError?: boolean
}

export default function FormSection(props: PropsWithChildren<Props>) {
  return (
    <div
      className={
        styles.FormSection +
        ' ' +
        (props.isError ? styles.FormSectionError : '')
      }
    >
      {props.title && (
        <div className={styles.FormSectionHeader}>
          {props.title && <h2>{props.title}</h2>}
          {props.description && <p>{props.description}</p>}
        </div>
      )}

      {props.children}
    </div>
  )
}
