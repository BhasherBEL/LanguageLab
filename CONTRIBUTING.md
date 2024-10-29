## Initial setup

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
