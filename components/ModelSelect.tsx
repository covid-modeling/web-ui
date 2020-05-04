import models from '../lib/models'
import selectStyle from './styles/select.module.css'

type Props = {
  modelSlug: keyof typeof models
  modelOpts: (keyof typeof models)[]
  onChange: (modelSlug: string) => void
}

export default function ModelSelect(props: Props) {
  return (
    <select
      value={props.modelSlug}
      onChange={e => props.onChange(e.target.value)}
      className={`${selectStyle.select} mr-4`}
    >
      {props.modelOpts.map(
        slug =>
          models[slug] && (
            <option key={slug} value={slug}>
              {models[slug].name}
            </option>
          )
      )}
    </select>
  )
}
