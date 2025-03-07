echo "STARTED DEV UPDATE AT $(date)" > /tmp/docker_update_dev

cd /mnt/data/languagelab/repo/
git checkout dev >> /tmp/docker_update_dev
git pull >> /tmp/docker_update_dev


cd /mnt/data/languagelab/repo/backend 
source app/.env/bin/activate >> /tmp/docker_update_dev
alembic -c alembic.dev.ini upgrade head >> /tmp/docker_update_dev

cd /mnt/data/languagelab/repo/
docker compose up -d >> /tmp/docker_update_dev

cd /mnt/data/languagelab/repo/scripts/surveys
python3 survey_maker.py < .creds >> /tmp/docker_update_dev

git checkout main >> /tmp/docker_update_dev

echo "END DEV UPDATE AT $(date)" >> /tmp/docker_update_dev
