import {GetServerSideProps} from 'next'
import {useContext, useState} from 'react'
import Button from '../../components/Button'
import handleError from '../../lib/handle-error'
import {ensureSession} from '../../lib/session'
import {SentryContext} from '../_app'

const DEFAULT_MESSAGE = 'Test Error'

export default function MetaBoomPage() {
  const {captureException} = useContext(SentryContext)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [type, setType] = useState('catch-and-report')
  const [rethrow, setRethrow] = useState(false)

  return (
    <form
      className="mx-auto my-16 container"
      onSubmit={e => {
        console.log('Testing error with', type)

        e.preventDefault()

        if (type === 'catch-and-report') {
          try {
            throw new Error(message)
          } catch (err) {
            captureException(err)

            if (rethrow) {
              throw err
            }
          }
        } else {
          throw new Error(message)
        }
      }}
    >
      <h1 className="text-2xl mb-4">Test Error</h1>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        autoFocus
        className="block w-full p-4 rounded mb-4 border outline-none focus:shadow-outline"
      />
      <div
        className="grid items-baseline gap-2 mb-4"
        style={{gridTemplateColumns: 'max-content auto'}}
      >
        <input
          type="radio"
          id="catch-and-report"
          name="type"
          value="catch-and-report"
          checked={type === 'catch-and-report'}
          onChange={() => setType('catch-and-report')}
        />
        <label htmlFor="catch-and-report">Catch & Report</label>
        {type === 'catch-and-report' && (
          <>
            <input
              type="checkbox"
              checked={rethrow}
              onChange={() => setRethrow(!rethrow)}
              id="rethrow"
            />
            <label htmlFor="rethrow">Rethrow</label>
          </>
        )}
        <input
          type="radio"
          id="throw"
          name="type"
          value="throw"
          checked={type === 'throw'}
          onChange={() => setType('throw')}
        />
        <label htmlFor="throw" className="flex-">
          Throw
        </label>
      </div>

      <div className="flex"></div>
      <button type="submit">
        <Button text="Throw Error" />
      </button>
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = ensureSession(
  handleError(async ctx => {
    if (ctx.query['throw-ssp']) {
      throw new Error(`${ctx.query.message || DEFAULT_MESSAGE}`)
    }

    return {props: {}}
  })
)
