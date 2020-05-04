import {SortIndicator, TableHeaderProps} from 'react-virtualized'

export default function TableHeader(props: TableHeaderProps) {
  return (
    <>
      {props.label}
      {props.sortBy === props.dataKey && (
        <SortIndicator sortDirection={props.sortDirection} />
      )}
    </>
  )
}
