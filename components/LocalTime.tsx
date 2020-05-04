type Props = {
  time: Date
  options?: Intl.DateTimeFormatOptions
}

export default function LocalTime(props: Props) {
  return (
    <time dateTime={props.time.toISOString()}>
      {props.time.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        ...props.options
      })}
    </time>
  )
}
