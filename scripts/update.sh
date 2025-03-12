echo "STARTED UPDATE AT $(date)" > /tmp/docker_update

cd /mnt/data/languagelab/repo/
git checkout main >> /tmp/docker_update
git pull >> /tmp/docker_update

cd /mnt/data/languagelab/repo/backend
source app/.env/bin/activate >> /tmp/docker_update
alembic -c alembic.prod.ini upgrade head >> /tmp/docker_update

cd /mnt/data/languagelab/repo/
docker compose up -d >> /tmp/docker_update
docker restart languagelab-backend >> /tmp/docker_update

cd /mnt/data/languagelab/repo/scripts/surveys
python3 survey_maker.py < .creds >> /tmp/docker_update

echo "END UPDATE AT $(date)" >> /tmp/docker_update
