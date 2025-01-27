import pandas as pd
import requests
import os
import re

API_URL = os.getenv("API_URL") or input("APP (API) URL: ")
API_PATH = "/tmp-api/v1"
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
        if re.search(r"<.*?>", str(row["question"])):
            o["question"] = f'gap:{row["question"]}'
        else:
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

    if os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_dropdown.txt"):
        with open(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_dropdown.txt", "r") as file:
            options = file.read().split(",")
        options = [option.strip() for option in options]
        o[f"option1"] = f"dropdown:{', '.join(options)}"
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_radio.txt"):
        with open(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_radio.txt", "r") as file:
            options = file.read().split(",")
        options = [option.strip() for option in options]
        o[f"option1"] = f"radio:{', '.join(options)}"
    else:
        for j in range(1, 9):
            op = f"option{j}"
            if op in row:
                o[op] = "text:" + row[op]
            elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.mp3"):
                o[op] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.mp3"
            elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.jpeg"):
                o[op] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.jpeg"
    # print(o)
# PARSE GROUPS

groups = []
with open("groups.csv") as file:
    file.readline()
    for line in file.read().split("\n"):
        if not line:
            continue
        id_, title, demo_, *its = line.split(",")
        id_ = int(id_)
        demo_ = True if demo_.lower() == "true" else False
        its = [int(x) for x in its if x]
        groups.append({"id": id_, "title": title, "demo": demo_, "items_id": its})

# PARSE SURVEYS

surveys = []
with open("surveys.csv") as file:
    file.readline()
    for line in file.read().split("\n"):
        if not line:
            continue
        id_, title, *gps = line.split(",")
        id_ = int(id_)
        gps = [int(x) for x in gps if x]
        surveys.append({"id": id_, "title": title, "groups_id": gps})

# SESSION DATA

username = os.getenv("EMAIL") or input("Email: ")
password = os.getenv("PASSWORD") or input("Password: ")

session = requests.session()

response_code = session.post(
    f"{API_URL}{API_PATH}/auth/login", json={"email": username, "password": password}
).status_code

assert (
    response_code == 200
), f"Probably wrong username or password. Status code: {response_code}"

# CREATE ITEMS

n_items = 0

for item in items:
    assert session.delete(
        f'{API_URL}{API_PATH}/surveys/items/{item["id"]}'
    ).status_code in [404, 204], f'Failed to delete item {item["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/surveys/items", json=item)
    if r.status_code not in [201]:
        print(f'Failed to create item {item["id"]}: {r.text}')
        continue
    else:
        n_items += 1
else:
    print(f"Successfully created {n_items}/{len(items)} items")

# CREATE GROUPS

n_groups = 0

for group in groups:
    group = group.copy()
    its = group.pop("items_id")
    assert session.delete(
        f'{API_URL}{API_PATH}/surveys/groups/{group["id"]}'
    ).status_code in [404, 204], f'Failed to delete group {group["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/surveys/groups", json=group)
    if r.status_code not in [201]:
        print(f'Failed to create group {group["id"]}: {r.text}')
        continue
    else:
        n_groups += 1

    for it in its:
        assert session.delete(
            f'{API_URL}{API_PATH}/surveys/groups/{group["id"]}/items/{it}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete item {it} from group {group["id"]}'
        r = session.post(
            f'{API_URL}{API_PATH}/surveys/groups/{group["id"]}/items',
            json={"question_id": it},
        )
        if r.status_code not in [201]:
            print(f'Failed to add item {it} to group {group["id"]}: {r.text}')
            continue

else:
    print(f"Successfully created {n_groups}/{len(groups)} groups")

# CREATE SURVEYS

n_surveys = 0

for survey in surveys:
    survey = survey.copy()
    gps = survey.pop("groups_id")
    assert session.delete(
        f'{API_URL}{API_PATH}/surveys/{survey["id"]}'
    ).status_code in [
        404,
        204,
    ], f'Failed to delete survey {survey["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/surveys", json=survey)
    if r.status_code not in [201]:
        print(f'Failed to create suvey {survey["id"]}: {r.text}')
        continue
    else:
        n_surveys += 1

    for gp in gps:
        assert session.delete(
            f'{API_URL}{API_PATH}/surveys/{survey["id"]}/groups/{gp}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete gp {gp} from survey {survey["id"]}'
        r = session.post(
            f'{API_URL}{API_PATH}/surveys/{survey["id"]}/groups', json={"group_id": gp}
        )
        if r.status_code not in [201]:
            print(f'Failed to add group {gp} to survey {survey["id"]}: {r.text}')
            break

else:
    print(f"Successfully created {n_surveys}/{len(surveys)} surveys")
