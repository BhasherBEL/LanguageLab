import pandas as pd
import requests
import os

API_URL = "http://127.0.0.1:8000"
LOCAL_ITEMS_FOLDER = "../../frontend/static/surveys/items"
REMOTE_ITEMS_FOLDER = "/surveys/items"

# PARSE ITEMS

df_items = pd.read_csv("items.csv", dtype=str)

items = []
for i, row in df_items.iterrows():
    row = row.dropna()
    id_ = int(row["id"])

    o = {"id": id_, "question": None, "correct": None}
    items.append(o)

    if "question" in row:
        o["question"] = f'text:{row["question"]}'
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.mp3"):
        o["question"] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/q.mp3"
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.jpeg"):
        o["question"] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/q.jpeg"
    else:
        print(f"Failed to find a question for item {id_}")

    if "correct" in row:
        o["correct"] = int(row["correct"])
    else:
        print(f"Failed to find corect for item {id_}")

    for j in range(1, 9):
        op = f"option{j}"
        if op in row:
            o[op] = "text:" + row[op]
        elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.mp3"):
            o[op] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.mp3"
        elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.jpeg"):
            o[op] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.jpeg"

# PARSE GROUPS

groups = []
with open("groups.csv") as file:
    file.readline()
    for line in file.read().split("\n"):
        if not line:
            continue
        id_, title, *its = line.split(",")
        id_ = int(id_)
        its = [int(x) for x in its]
        groups.append({"id": id_, "title": title, "items_id": its})

# PARSE SURVEYS

surveys = []
with open("surveys.csv") as file:
    file.readline()
    for line in file.read().split("\n"):
        if not line:
            continue
        id_, title, *gps = line.split(",")
        id_ = int(id_)
        gps = [int(x) for x in gps]
        surveys.append({"id": id_, "title": title, "groups_id": gps})

# SESSION DATA

username = input("Email: ")
password = input("Password: ")

session = requests.session()

assert (
    session.post(
        API_URL + "/api/v1/auth/login", data={"email": username, "password": password}
    ).status_code
    == 200
), "Wrong username or password"

# CREATE ITEMS

for item in items:
    assert session.delete(
        f'{API_URL}/api/v1/surveys/items/{item["id"]}'
    ).status_code in [404, 204], f'Failed to delete item {item["id"]}'
    r = session.post(f"{API_URL}/api/v1/surveys/items", json=item)
    if r.status_code not in [201]:
        print(f'Failed to create item {item["id"]}: {r.text}')
        break
else:
    print(f"Successfully created {len(items)} items")

# CREATE GROUPS

for group in groups:
    group = group.copy()
    its = group.pop("items_id")
    assert session.delete(
        f'{API_URL}/api/v1/surveys/groups/{group["id"]}'
    ).status_code in [404, 204], f'Failed to delete group {group["id"]}'
    r = session.post(f"{API_URL}/api/v1/surveys/groups", json=group)
    if r.status_code not in [201]:
        print(f'Failed to create group {group["id"]}: {r.text}')
        break

    for it in its:
        assert session.delete(
            f'{API_URL}/api/v1/surveys/groups/{group["id"]}/items/{it}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete item {it} from group {group["id"]}'
        r = session.post(
            f'{API_URL}/api/v1/surveys/groups/{group["id"]}/items',
            json={"question_id": it},
        )
        if r.status_code not in [201]:
            print(f'Failed to add item {it} to group {group["id"]}: {r.text}')
            break

else:
    print(f"Successfully created {len(groups)} groups")

# CREATE SURVEYS

for survey in surveys:
    survey = survey.copy()
    gps = survey.pop("groups_id")
    assert session.delete(f'{API_URL}/api/v1/surveys/{survey["id"]}').status_code in [
        404,
        204,
    ], f'Failed to delete survey {survey["id"]}'
    r = session.post(f"{API_URL}/api/v1/surveys", json=survey)
    if r.status_code not in [201]:
        print(f'Failed to create suvey {survey["id"]}: {r.text}')
        break

    for gp in gps:
        assert session.delete(
            f'{API_URL}/api/v1/surveys/{survey["id"]}/groups/{gp}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete gp {gp} from survey {survey["id"]}'
        r = session.post(
            f'{API_URL}/api/v1/surveys/{survey["id"]}/groups', json={"group_id": gp}
        )
        if r.status_code not in [201]:
            print(f'Failed to add group {gp} to survey {survey["id"]}: {r.text}')
            break

else:
    print(f"Successfully created {len(groups)} surveys")
