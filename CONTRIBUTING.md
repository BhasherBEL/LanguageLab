## Introduction

This document aims to specify how we currently work on this project, and how to get it working on your machine.

## General organisation

To keep track of the past, present and future work, we use the gitlab repository as a source of trust for the progress of the project. All the bugs, _to do_, improvement ideas and discussions are developed in the [issues](https://forge.uclouvain.be/sbibauw/languagelab/-/issues).

The issues are categorised using tags. There are two types of tags. Gray tags are used to specify the kind of issues: UX, Studies, AI, topics, ... New kinds could be created at any time to reflect the progress and the targets of the project. Colored tags are used to specify the priority of an issue. Here are the different priorities:

- Bug: Urgent issues that prevent the normal or expected application's operations.
- To do: New functionalities or improvements already discussed and validated.
- Waiting: Issues where work has already started, but is waiting someone else's answer or opinion to continue.
- To review: Developed functionalities and improvements waiting for a review.
- Nice to have: Non-priority features or improvements, that would be _nice to have_.
- Open for discussions: Features and improvements that still need more discussions before being started.
- Won't: Rejected features and improvements.

To keep track of who is working on what, it's better to assign yourself an issue when working on it (or plan to work on it in a near future), and unassign if you plan to not work anymore (or anytime soon) on it.

The different planned versions and the issues assigned to them are presented in the form of [milestones](https://forge.uclouvain.be/sbibauw/languagelab/-/milestones). The general idea is to finish a milestone before working on the next one.

## Getting started

#### Requirements

- OS: Tested on Linux and macOS, untested and unmaintained on Windows.
- Backend: The deployment currently use `python3.12`, so it's recommended to use the same version for development. It also requires `virtualenv` to manage the virtual environment.
- Frontend: `npm` is currently used (more precisely, `npm10.8.2`). `Prettier` is also used for linting and formatting, so it is highly recommended.

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

#### Pre-Commit hooks

The CI run `npm run lint` and `black --check --verbose` on every commit, on every branch. To prevent a failing CI, there is a pre-commit hook ([docs](https://git-scm.com/book/ms/v2/Customizing-Git-Git-Hooks)). To use it, you can configure the local repository to use the hooks available directly on the repository:

```sh
git config --local core.hooksPath .githooks
```

#### up-to-date PR

The project is more and more complex, integrated, tested, etc. To avoid conflicts, ensure your PR is always up-to-date with the `dev` branch.

## Useful tips

#### Users

By default, only one admin is created (and only once), using the email and password specified in the environment variables. To create more users, you should use the student register page `/register` and the tutor register page `/tutor/register`. You can also change the type of user in `/admin`.

#### Breaking changes in database

Sometimes, breaking changes are made in the database. In such cases, manual actions are necessary to get the application works again. The easiest way to get the project working again in development is to completely delete the database file (`/backend/languagelab.sqlite`). It may also be necessary to clear the cookies and cache to avoid visual issues.

#### Dependencies update

After an update, it may happen that the dependencies have changed. In such case, many "Missing Packages" errors would appear when running the frontend. In that case, running `npm install` before `npm run dev` should fix the issue.

#### API documentation

To use, try and explore the backend's API, both production and development's server have the `/docs` endpoint. Using the interface, it's possible to register, login, get, create, update, ...

#### Alembic

As alembic is backend-specific, you have to go into the `backend` folder for the commands to work. Note that the alembic environment is slighly different in local, dev and prod, so they all have their own `alembic.*.ini` file. Those files shouldn't be changed unless you really know what you are doing.

:warning: Alembic versions work as a linked list. Each version refer it's previous and next version. To prevent having to tweak "weird" things, ensure you're up-to-date with any other version update. You could need to redo those steps if someone else merged a change in the meantime.

To create a migration script, you can run

```sh
alembic revision -m "<change message>"
```

It will tell you the name of the new file, where you can implement the changes.

In most cases, you should only need to change the functions:

- `upgrade` contains all your changes
- `downgrade` drop them. This is **deeply advised** to allow to rollback in case of issue, especially in production.

Here are the most useful alembic functions:

```python
# Create a table
op.create_table(
    'account',
    sa.Column('id', sa.Integer, primary_key=True),
    sa.Column('name', sa.String(50), nullable=False),
)

# Drop a table
op.drop_table('account')

# Add a column
op.add_column('account', sa.Column('last_transaction_date', sa.DateTime))

# Remove a column
op.drop_column('account', 'last_transaction_date')

# Rename a column
op.alter_column('account', 'id', new_column_name='uuid')
```

To update to the latest version:

```sh
alembic upgrade head
```

:warning: You will also need to run that if someone else wrote a version. This is NOT automatic for the local environment.

For more in depth information, check the [official documentation](https://alembic.sqlalchemy.org/en/latest/).
