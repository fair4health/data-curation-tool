# FAIR4Health Data Curation & Validation Tool

<p align="center">
  <a href="https://www.fair4health.eu" target="_blank"><img width="400" src="https://www.fair4health.eu/images/logo.png" alt="FAIR4Health logo"></a>
</p>

<p align="center">
  <a href="https://github.com/fair4health/data-curation-tool"><img src="https://img.shields.io/github/license/fair4health/data-curation-tool" alt="License"></a>
  <a href="https://github.com/fair4health/data-curation-tool/releases"><img src="https://img.shields.io/github/v/release/fair4health/data-curation-tool" alt="Releases"></a>
</p>

## About

This is a standalone, desktop application developed by the FAIR4Health project (https://www.fair4health.eu/).
The tool is used to connect the health data sources which can be in various formats (Excel files,
CSV files, SQL databases) and migrate data into a HL7 FHIR Repository. The tool shows the available 
FHIR profiles to the user so that he/she can perform mappings appropriately. The tool can also
contact a Terminology Server (which is actually another HL7 FHIR Repository) so that data fields
can be annotated if coding schemes such as ICD10 or SNOMED-CT are in use.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Targets

**Windows**: `nsis`

**Linux**: `AppImage`, `deb`

**Mac**: `dmg`

### Run your tests
All:
```
npm run test
```
Unit:
```
npm run test:unit
```
e2e:
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Log Locations
The tool writes logs to the following locations:

- on **macOS**: `~/Library/Logs/FAIR4Health Data Curation Tool/log.txt`
- on **Windows**: `%USERPROFILE%\AppData\Roaming\FAIR4Health Data Curation Tool\logs\log.txt`
- on **Linux**: `~/.config/FAIR4Health Data Curation Tool/logs/log.txt`

## Terminology Server Connection
The tool is compatible with FHIR based Terminology Servers, in order to translate values from one system to another.
 As the sample API `https://health-digital-term.ari-health.eu` provided by ATOS was used.

Currently, in the tool:
- For the translation operation, the ConceptMap translate API: `/ConceptMap/$translate` is consumed.
- For listing the Codesystems, the Codesystem metadata API: `/Codesystem/$metadata` is consumed.


## Acknowledgement

This research has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 824666,
[FAIR4Health Project](https://www.fair4health.eu/) (Improving Health Research in EU through FAIR Data).
