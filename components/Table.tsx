import styles from './Table.module.css'

type Props = JSX.IntrinsicElements['table'] & {
  fixed?: boolean
}

export default function Table(props: Props) {
  const layout = props.fixed ? 'fixed' : 'auto'

  return (
    <table
      className={`${styles.table} ${styles[layout]} ${props.className}`}
      cellSpacing="0"
      cellPadding="0"
    >
      {props.children}
    </table>
  )
}
