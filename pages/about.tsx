import AppFrame from '../components/AppFrame'
import ModelInfo from '../components/ModelInfo'
import models, {ModelSpec} from '../lib/models'
import styles from './about.module.css'

export default function IndexPage() {
  return (
    <AppFrame loggedIn={false}>
      <div className={styles.AboutPage}>
        <h1>About</h1>

        <p className={styles.MainDesc}>
          The COVID Modeling UI was developed to help policy makers explore
          hypothetical intervention strategies to reduce the impact of COVID-19.
          It provides a common interface and language to run simulations against
          multiple models at the same time.
        </p>

        <h2>How it works</h2>
        <p>
          Taking into account existing real-world data, policy makers can run
          hypothetical simulations to test different combinations and durations
          of intervention strategies. This application runs the simulation
          through multiple epidemiology models and presents a single overview
          with the projected outcomes.
        </p>
        <p>
          The UI is independent of the models and architected to support the
          addition of new models in the future. It is also designed to support
          new intervention strategies that policy makers may consider in the
          future, like testing procedures and contact tracing.
        </p>

        <h2>Access</h2>
        <p>
          Because some of the models require large amounts of computing power,
          access to the COVID Modeling UI is invitation-only at this time. In
          the future, it is likely that pre-computed outcome views will be
          visible to the public.
        </p>

        <h2>Open Source</h2>
        <p>
          All code is open source and the relevant repositories are available
          under the covid-modeling organization on GitHub. Please record all
          feedback, suggestions, and improvements as issues or pull requests on
          those repositories.
        </p>

        <h2>Models</h2>
        <p>
          The UI was designed in a collaboration between modeling teams at the
          following institutions (in alphabetical order):
        </p>

        {models.basel && (
          <>
            <h3>Basel University</h3>
            <ModelInfo modelSpec={models.basel} minimal={true} />
          </>
        )}

        {models['mrc-ide-covid-sim'] && (
          <>
            <h3>Imperial College</h3>
            <ModelInfo modelSpec={models['mrc-ide-covid-sim']} minimal={true} />
          </>
        )}

        <h3>Institute of Disease Modelling</h3>
        <ModelInfo
          modelSpec={
            {
              metaURLs: {
                code: 'https://github.com/InstituteforDiseaseModeling/covasim',
                website: 'https://covid.idmod.org/sim/'
              }
            } as ModelSpec
          }
          minimal={true}
        />

        {models.cosmc && (
          <>
            <h3>Stanford University</h3>
            <ModelInfo modelSpec={models.cosmc} minimal={true} />
          </>
        )}

        <p>
          Many other modeling teams generously provided input and feedback.
          Microsoft and GitHub provided software engineering assistance to the
          expert modeling teams.
        </p>
      </div>
    </AppFrame>
  )
}
