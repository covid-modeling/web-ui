import {ToggleGroupOption} from './ChartWrapper'
import {ScaleXDomainMonths, ScaleYType} from './OutcomeChart/OutcomeChart'
import selectStyle from './styles/select.module.css'

type Props = {
  disabled: boolean
  cumulative: boolean
  setCumulative: (isCumulative: boolean) => void
  scaleYType: ScaleYType
  setScaleYType: (scaleYType: ScaleYType) => void
  scaleXDomainMonths: ScaleXDomainMonths
  setScaleXDomainMonths: (scaleXDomainMonths: ScaleXDomainMonths) => void
  timeToggleOptions: ToggleGroupOption[]
}

export default function ResultViewSettings(props: Props) {
  return (
    <>
      <select
        disabled={props.disabled}
        value={props.cumulative ? 'cumulative' : 'daily'}
        onChange={e => props.setCumulative(e.target.value === 'cumulative')}
        className={`${selectStyle.select} mr-4`}
      >
        <option value="daily">Daily</option>
        <option value="cumulative">Cumulative</option>
      </select>
      <select
        disabled={props.disabled}
        value={props.scaleYType}
        onChange={e => props.setScaleYType(e.target.value as ScaleYType)}
        className={`${selectStyle.select} mr-4`}
      >
        <option value="linear">Linear</option>
        <option value="logarithmic">Logarithmic</option>
      </select>
      <select
        disabled={props.disabled}
        value={
          props.scaleXDomainMonths ? props.scaleXDomainMonths.toString() : ''
        }
        onChange={e =>
          props.setScaleXDomainMonths(
            e.target.value === '' ? null : parseInt(e.target.value)
          )
        }
        className={selectStyle.select}
      >
        {props.timeToggleOptions.map(opt => (
          <option
            key={opt.label}
            value={opt.value ?? ''}
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </>
  )
}
