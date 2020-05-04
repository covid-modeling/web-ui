import styles from './Button.module.css'

type Props = {
  icon?: JSX.Element
  text: string
  className?: string
}

export default function Button(props: Props) {
  return (
    <span className={`${styles.Button} ${props.className}`}>
      <span className={styles.ButtonContent}>
        {props.icon}
        {props.text}
      </span>
    </span>
  )
}
