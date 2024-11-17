echo "STARTED UPDATE AT $(date)" > /tmp/docker_update
cd /mnt/data/languagelab/repo/
git pull
docker compose up -d
cd scripts/surveys
python3 survey_maker.py < .creds
echo "END UPDATE AT $(date)" >> /tmp/docker_update
