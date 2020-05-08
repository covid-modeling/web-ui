import Axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useState} from 'react'
import {SentryContext} from '../pages/_app'
import CircleCheck from '../svg/CircleCheck.svg'
import btnStyles from './styles/button.module.css'

export default function Disclaimer() {
  const router = useRouter()
  const {captureException} = useContext(SentryContext)
  const [error, setError] = useState<string | null>(null)

  // TODO: Currently this is only a UI block—the API will still return results.
  const acceptDisclaimer = async () => {
    try {
      setError(null)
      await Axios.post('/api/user/accept-disclaimer')
      router.reload()
    } catch (err) {
      captureException(err)
      setError('An unexpected error occurred.')
    }
  }

  return (
    <div className="p-4 rounded bg-orange-100 border border-orange-200 text-orange-400">
      {error ? <p className="mb-6 text-orange-400 font-bold">{error}</p> : null}
      <p className="mb-6">
        These results are based on simulations from different modeling groups.
        Results are subject to change as real world situations change over time
        and more data is available. These results are not medical predictors and
        are provided as-is. The models themselves, their underlying assumptions,
        and their weaknesses should be reviewed carefully before making any
        decisions.
      </p>

      <button
        type="button"
        className={`${btnStyles.button} ${btnStyles.orange}`}
        onClick={() => acceptDisclaimer()}
      >
        <div className="flex justify-center items-center">
          <CircleCheck className="mr-4 text-orange-200" />I understand these
          disclaimers
        </div>
      </button>
    </div>
  )
}
