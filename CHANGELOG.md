# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0](https://github.com/liberuum/budget-tool/releases/tag/v1.3.0) - 2022-11-03

### Added

- Added expense report general comments, CU admins can now add extra information regarding their monthly CU expenses

### Changed

- **Breaking change**: users need to get latest version of budgtet tool in order to log in. User log in object is changed from API

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
