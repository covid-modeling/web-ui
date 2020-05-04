import Joi from '@hapi/joi'
import isEqual from 'lodash/isEqual'
import boxStyle from '../styles/box.module.css'

type Path = Joi.ValidationErrorItem['path']

type Props = {
  error: Joi.ValidationError | null
  path: Path
  children: (errors: Joi.ValidationErrorItem[]) => JSX.Element
}

/**
 * Render the children once per error if there's an error for the given path on the validation
 * error.
 *
 *     <ErrorMessage error={error} path={['inteventions.strategyRequired']}>{details => (
 *       <ul>{details.map((d, i) => <li key={i}>{d.message}</li>)}</ul>
 *     )}</ErrorMessage>
 */
export default function ErrorMessage(props: Props) {
  const details = props.error?.details ?? []
  const relevantErrors = getRelevantErrors(details, props.path)

  if (!relevantErrors.length) {
    return null
  }

  return props.children(relevantErrors)
}

export function ErrorList(
  props: Omit<Props, 'children'> & {className?: string}
) {
  return (
    <ErrorMessage error={props.error} path={props.path}>
      {details => (
        <ul className={`${boxStyle.box} ${boxStyle.error} ${props.className}`}>
          {details.map((d, i) => (
            <li key={i}>{d.message}</li>
          ))}
        </ul>
      )}
    </ErrorMessage>
  )
}

/**
 * A helper to get a CSS class when an error exists for a given path
 *
 * @param error The validation error (or null)
 * @param path The path to check errors at
 * @param ifError The value to return if at least one error is present
 */
export function errorClass(
  error: Joi.ValidationError | null,
  path: Path,
  ifError: string
): string {
  const details = error?.details ?? []

  if (getRelevantErrors(details, path).length > 0) {
    return ifError
  }

  return ''
}

function getRelevantErrors(
  details: Joi.ValidationErrorItem[],
  path: Path
): Joi.ValidationErrorItem[] {
  return details.reduce<Joi.ValidationErrorItem[]>((errors, detail) => {
    if (isEqual(detail.path, path)) {
      errors.push(detail)
    }

    return errors
  }, [])
}
