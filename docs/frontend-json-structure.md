# Frontend JSON Structure

This is a sample of the JSON data that the web frontend should be sent:

```json
{
  id: just a unique id. Numeric or guid. doesn't matter
  creator: github id of the person who created this account
  dateCreated: ISO timestamp - date this document was created
  from: ISO Date
  to: ISO Date

  region: path or array of regions, eg "us/ny/nyc" or ["us", "ny", "nyc"]
  model: "ImperialCollege" etc
  virus: "Covid-19"

  parameters: {
    caseIsolation: true/false/object, // use object to more precisely specify parameter (eg- % isolation)
    socialDistancingSeventyPlus: true/false
    socialDistancingAll: true/false
    r0: 3.0
    adaptive: { something, something }
    ...
  },

  // we may want to consider including a stats chunk for each.
  // initially, let's leave out the stats, but keep it in mind as a placeholder for later.
  dailyChanges: {
    active: { stats: { min/max/stddev/variance/1st derivative/...}, values: [...] },
    recoveries: ...
    deaths: ...
    inIcu
    inHospital
    ...
  }
  // running daily totals for the above changes. these can be calculated locally, so maybe not necessary
  totals: {
    active: { stats: { min/max/stddev/variance/1st derivative/...}, values: [...] },
    recoveries: ...
    deaths: ...
    inIcu
    inHospital
    ...
  },

  constants: {
    icuBeds: 254
    hospitalBeds: 7098
    peakCases: ISO date,
    .....
  }
}
```
