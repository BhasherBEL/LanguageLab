echo "STARTED UPDATE AT $(date)" > /tmp/docker_update

cd /mnt/data/languagelab/repo/
source app/.env/bin/activate
cd backend
alembic upgrade head

cd /mnt/data/languagelab/repo/
git pull
docker compose up -d

cd /mnt/data/languagelab/repo/scripts/surveys
python3 survey_maker.py < .creds

echo "END UPDATE AT $(date)" >> /tmp/docker_update
