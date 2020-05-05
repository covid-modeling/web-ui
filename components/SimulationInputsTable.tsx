import {input} from '@covid-modeling/api'
import {StrategyDescriptions} from '../lib/new-simulation-state'
import Check from '../svg/Check.svg'
import LocalDate from './LocalDate'
import styles from './SimulationInputsTable.module.css'
import Table from './Table'

type Props = {
  inputs: input.ModelInput
}

export default function SimulationInputsTable(props: Props) {
  const inputs = props.inputs

  return (
    <>
      <h1 className={styles.h1}>Simulation Inputs</h1>

      <Table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Starting On</th>

            {Object.entries(StrategyDescriptions).map(([key, desc]) => (
              <th key={key} scope="col">
                {desc.label}
              </th>
            ))}

            <th scope="col">Contact Reduction</th>
          </tr>
        </thead>

        <tbody>
          {inputs.parameters.interventionPeriods.map((pd, i) => (
            <tr key={`${pd.startDate}-${i}`}>
              <td>
                <LocalDate isoDate={pd.startDate} />
              </td>
              {Object.keys(StrategyDescriptions).map(strat => {
                const intensity = String(
                  pd[strat as keyof input.InterventionPeriod] || ''
                )

                return (
                  <td
                    key={strat}
                    className={`${intensity ? styles[intensity] : undefined} ${
                      styles[strat]
                    }`}
                  >
                    {strat !== 'socialDistancing' ? (
                      intensity ? (
                        <Check className="inline" />
                      ) : null
                    ) : (
                      intensity.charAt(0).toUpperCase() + intensity.slice(1)
                    )}
                  </td>
                )
              })}

              <td>{pd.reductionPopulationContact}%</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className={styles.h2}>Other Parameters</h2>
      <div className={styles.Inputs}>
        <div className={styles.Name}>
          R<sub>0</sub>:
        </div>
        <div className={styles.Value}>
          {props.inputs.parameters.r0 ?? 'Default'}
        </div>
      </div>
    </>
  )
}
