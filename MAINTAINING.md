## Code maintenance

### Recurring actions

- Update the CI/CD if necessary to adapt to new features
- Write tests for new/changed components
- Ensure that the `main` branch is up-to-date to `dev` once the dev features are battle-tested.
- Ensure secrets are secrets and backed up somewhere

### Known potential issues

#### The CI/CD passed, but the application fail or isn't up-to-date.

This can happen when something went wrong in the CD script. There is currently no feedback if it worked or not. Logs are available in /tmp. Usually, running the script by hand (`sh scripts/update(.dev).sh`) solve/highlight the issue.  

#### Linting pass locally but not in the CI/CD.

The CI/CD always run the latest version of `black` (python linter). The same version should be used locally to avoid conflicts.

## Server maintenance

The server is accessible trough SSH using personal user accounts. To access it, it's necessary to be first connected to the VPN.

### Recurring actions

- Ensure that the container's log do not report suspicious errors
- Clean up space on the disk (mainly old docker images)
- Ensure that the server is up-to-date (Email the first of each month for that, can be a good remember to do all those preventive tasks)

### Known potential issues

#### The login page charge correctly, but it's impossible to log in.

This error usually happened when for some reason the backend container crashed. It's usually the symptom of a deeper problem, that usually require checking the container's log directly on the server.

#### The application return a 404 error on every page.

This usually means that the frontend container has crashed, and it also usually require digging in the container's log.
