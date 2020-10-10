# Covid modeling UI

## What

The Covid modeling UI is a tool for policy makers to experiment with mitigation strategies, running each strategy through several models and comparing the projections. The mitigation strategies specify what policies are in force at any given time, and the models project the likely number of deaths, infections, hospitalisations and ICU use.

## Why?

By examining the projections of multiple models, policy makers can gain an understanding of the level of uncertainty and divergence of expert opinion. In cases where models disagree, this can provide the basis for informed discussion between policy makers and epidemiologists on the deeper reasons for such discrepancies.

## Who

The UI was originally designed in a collaboration between potential users, modeling experts, a team of engineers at GitHub, and the AI+Cloud strategy team at Microsoft.

## Goals

The code is made available here to enable modelers to extend the breadth and depth of the information provided to policy makers, in particular by adding:

- models, to give the broadest coverage of epidemiological expertise,
- intervention types, such as various testing strategies and contact tracing,
- data sources for displaying “ground truth” alongside future projections, such as past intervention policies and mobility data,
- geographies not currently supported by the models that have already been integrated,
- ways to compare models, for example through new visualisations or by scoring their fit to the ground truth.

We welcome contributions in all five of these areas. See [CONTRIBUTING.md](CONTRIBUTING.md).

Currently the service running the simulations has restricted access because some of the simulations are compute-intensive to run. We are however firm believers in the need to share the data, and we’d therefore welcome contributions to make pre-computed projections for common scenarios visible to the general public.

## Non-goals

Of course there are other potential applications of this code, such as a more sophisticated UI for experts to experiment with all the advanced parameters of a particular model. We’d be glad to see those applications in forks of this repository.
