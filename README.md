# FAIR4Health Data Curation & Validation Tool

![alt text](https://www.fair4health.eu/images/logo.png)

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

