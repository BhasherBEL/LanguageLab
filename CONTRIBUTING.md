## Introduction

This document aims to specify how we currently work on this project, and how to get it working on your machine.

## General organisation

To keep track of the past, present and future work, we use the gitlab repository as a source of trust for the progress of the project. All the bugs, *to do*, improvement ideas and discussions are developed in the [issues](https://forge.uclouvain.be/sbibauw/languagelab/-/issues).

The issues are categorised using tags. There are two types of tags. Gray tags are used to specify the kind of issues: UX, Studies, AI, topics, ... New kinds could be created at any time to reflect the progress and the targets of the project. Colored tags are used to specify the priority of an issue. Here are the different priorities:

- Bug: Urgent issues that prevent the normal or expected application's operations.
- To do: New functionalities or improvements already discussed and validated.
- Waiting: Issues where work has already started, but is waiting someone else's answer or opinion to continue.
- To review: Developed functionalities and improvements waiting for a review.
- Nice to have: Non-priority features or improvements, that would be *nice to have*.
- Open for discussions: Features and improvements that still need more discussions before being started.
- Won't: Rejected features and improvements.

To keep track of who is working on what, it's better to assign our-self an issue when working on it (or plan to work on it in a near future), and unassign if we plan to not work anymore (or anytime soon) on it.

The different planned versions and the issues assigned to them are presented in the form of [milestones](https://forge.uclouvain.be/sbibauw/languagelab/-/milestones). The general idea is to finish a milestone before working on the next one.


## Getting started

#### Requirements

- OS: Tested on Linux and macOS, untested and unmaintained on Windows.
- Backend: The deployment currently use `python3.12`, so it's recommanded to use the same version for development. It also requires `virtualenv` to manage the virtual environment.
- Frontend: `npm` is currently used (more precisely, `npm10.8.2`). `Prettier` is also used for linting and formatting, so is highly recommanded.

#### Configuration

The application is configured using environment variables for both the frontend and the backend. The best way to specify them is through the `.env` file. 

Check `backend/app/config.py` and `frontend/src/lib/config.ts` for an extensive list of the environment variables in use and their default values.

Here is a simple example:
```sh
LANGUAGELAB_JWT_SECRET_KEY=abc
LANGUAGELAB_JWT_REFRESH_SECRET_KEY=efg
LANGUAGELAB_ADMIN_EMAIL=admin@admin.tld
LANGUAGELAB_ADMIN_PASSWORD=admin
LANGUAGELAB_CALCOM_SECRET=hij
ALLOWED_ORIGINS=*
```
⚠ Be sure to NEVER push the `.env` to the repo, and to use long and random keys for tests and deployment ⚠

#### Backend dependencies

Download and update the backend dependencies.

```sh
# Move into the backend's directory
cd backend/app

# Create the python virtual environment (only the first time)
virtualenv .env

# Update the dependencies (anytime the dependencies changes)
pip install -r ../requirements.txt
```

#### Running the project

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend/app && sh backend.sh`

## Useful tips

#### Users

By default, only one admin is created (and only once), using the email and password specified in the environment variables. To create more users, you should use the student register page `/register` and the tutor register page `/tutor/register`. You can also change the type of a user in `/admin`.

#### Breaking changes in database

Sometimes, breaking changes are made in the database. In such cases, manual actions are necessary to get the application works again. The easiest way to get the project working again in development is to completely delete the database file (`/backend/languagelab.sqlite`).
