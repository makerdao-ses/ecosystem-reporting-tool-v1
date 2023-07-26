# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.3](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v2.0.3) - 2023-07-26

⚠️ Ecosystem Actor users are required to use this latest version in order to see their team name displayed when logging in.

### Added

- Improved UI information display

### Fixed

- Fixed Ecosystem Actor Team display

## [2.0.2](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v2.0.2) - 2023-06-16

### HOTFIX

This release fixes the single CU display if user has multiple teams that can upload expense reports to. 

#### Fixed

- Added missing roles when user logs in.

## [2.0.1](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v2.0.1) - 2023-06-09

### HOTFIX

Download this version as version 2.0.0 has bugs that doesn't allow user to add spreadsheet or publish expense reports

#### Fixed

- Made `!Currency` tag optional and if not present, it is set to `DAI` as default.
- Define `ownerType` when user logs in. 

## [2.0.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v2.0.0) - 2023-06-06

### Changed

- Refactor to allow EcosystenActors and AlignedDelegates to login and publish data

- Added MKR currency support when uploading budget expenses.

- Minor bug fixes

## [1.9.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v1.9.0) - 2023-05-09

### Changed

- Refactor to allow Delegates to login and publish data

- Added UX improvements when having multimple spreadsheets added for different budgets. User can see which spreadsheet 
belongs to the respective budget. 

- Updated node version for package publishing.

- Fixed forecast total calculation bug. 

## [1.8.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v1.8.0) - 2023-03-30

### Changed

- Improve calculation logic when summarising spreadsheet numbers

- Fixed white screen UI bug. 

- Added group column in expense line items table

- When updating an expense report, previous stored line item comments are saved and re-added if there's a matching line item budget category and grouping.

## [1.7.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v1.7.0) - 2023-03-02

### Changed

- **Breaking change**: users need to get latest version of budget tool in order to being able to log in

- Delegates can now log in and publish delegate data

- When publishing an expense report for a certain month, any actual amount for the next 3 forecasted months will be removed and the user will be notified. As the forecasted next three months should only show forecasted values.

## [1.6.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v1.6.0) - 2022-02-09

### Changed

- **Breaking change**: users need to get latest version of budget tool in order to being able to log in

- General fixes and improvements

## [1.5.0](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases/tag/v1.5.0) - 2022-12-21

### Changed

- **Breaking change**: users need to get latest version of budget tool in order to properly use the tool's comment features.

- General fixes and improvements

- **Moved budget tool to new repo location.** Moving forward, the tool releases will happen at [makerdao-ses releases.](https://github.com/makerdao-ses/ecosystem-reporting-tool-v1/releases)

## [1.4.0](https://github.com/liberuum/budget-tool/releases/tag/v1.4.0) - 2022-12-01

### Changed

- **Breaking change**: users need to get latest version of budget tool in order to log in. User log in object is changed from API

- General fixes and improvements

## [1.3.0](https://github.com/liberuum/budget-tool/releases/tag/v1.3.0) - 2022-11-03

### Added

- Added expense report general comments, CU admins can now add extra information regarding their monthly CU expenses

### Changed

- **Breaking change**: users need to get latest version of budget tool in order to log in. User log in object is changed from API

- General fixes and improvements

- Improved notification experience when user is interacting with the tool

- Improved UI in 'ToAPI" page.

## [1.2.1](https://github.com/liberuum/budget-tool/releases/tag/v1.2.1) - 2022-10-17

### Changed

- Hot fix: Fixed bug in filtering months from spreadsheet against current month from tool.

## [1.2.0](https://github.com/liberuum/budget-tool/releases/tag/v1.2.0) - 2022-10-10

### Added

- Added app update checker so user is notified in app for new releases
- Added commenting functionality for line items in budget statements in the tool
- Added input update so user can update FTEs per budget statement

### Changed

- Fixed month selection dropdown so user can only push budget statements up to current month in the tool

## [1.1.0](https://github.com/pcatana/budget-tool/releases/tag/v1.1.0) - 2022-09-09

### Added

- Added link in upload to API view to ecosystem dashboard
- Added environment checker

### Changed

- Refactored processor to handle negative numbers, ignore 'Budget' tag in SF Template and inverse sign for 'Revenue' tag

### Removed

- Removed unsued MongoDB source file and library.
