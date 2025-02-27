import pandas as pd
import requests
import os
import re

API_URL = os.getenv("API_URL") or input("APP (API) URL: ")
API_PATH = "/tmp-api/v1"
LOCAL_ITEMS_FOLDER = "../../frontend/static/surveys/items"
REMOTE_ITEMS_FOLDER = "/surveys/items"

# PARSE QCM QUESTIONS

df_questions_qcm = pd.read_csv("questions_qcm.csv", dtype=str)

questions_qcm = []
for i, row in df_questions_qcm.iterrows():
    row = row.dropna()
    id_ = int(row["id"])

    o = {"id": id_, "question": None, "question_qcm": {"correct": None}}
    questions_qcm.append(o)

    if "question" in row:
        o["question"] = f'text:{row["question"]}'
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.mp3"):
        o["question"] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/q.mp3"
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.jpeg"):
        o["question"] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/q.jpeg"
    else:
        print(f"Failed to find a question for item {id_}")

    if "correct" in row:
        o["question_qcm"]["correct"] = int(row["correct"])
    else:
        print(f"Failed to find corect for item {id_}")

    if os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_dropdown.txt"):
        with open(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_dropdown.txt", "r") as file:
            options = file.read().split(",")
        options = [option.strip() for option in options]
        o["question_qcm"][f"option1"] = f"dropdown:{', '.join(options)}"
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_radio.txt"):
        with open(f"{LOCAL_ITEMS_FOLDER}/{id_}/1_radio.txt", "r") as file:
            options = file.read().split(",")
        options = [option.strip() for option in options]
        o["question_qcm"][f"option1"] = f"radio:{', '.join(options)}"
    else:
        for j in range(1, 9):
            op = f"option{j}"
            if op in row:
                o["question_qcm"][op] = "text:" + row[op]
            elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.mp3"):
                o["question_qcm"][op] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.mp3"
            elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/{j}.jpeg"):
                o["question_qcm"][op] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/{j}.jpeg"

# PARSE GAPFILL QUESTIONS

df_questions_gapfill = pd.read_csv("questions_gapfill.csv", dtype=str)

questions_gapfill = []
for i, row in df_questions_gapfill.iterrows():
    row = row.dropna()
    id_ = int(row["id"])

    o = {"id": id_, "question": None}
    questions_gapfill.append(o)

    if "question" in row:
        o["question"] = f'text:{row["question"]}'
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.mp3"):
        o["question"] = f"audio:{REMOTE_ITEMS_FOLDER}/{id_}/q.mp3"
    elif os.path.isfile(f"{LOCAL_ITEMS_FOLDER}/{id_}/q.jpeg"):
        o["question"] = f"image:{REMOTE_ITEMS_FOLDER}/{id_}/q.jpeg"
    else:
        print(f"Failed to find a question for item {id_}")


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

tests_task = []
with open("tests_task.csv") as file:
    file.readline()
    for line in file.read().split("\n"):
        if not line:
            continue
        id_, title, *gps = line.split(",")
        id_ = int(id_)
        gps = [int(x) for x in gps if x]
        tests_task.append({"id": id_, "test_task": {"title": title}, "groups_id": gps})

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

# CREATE QUESTIONS QCM

n_questions_qcm = 0

for q in questions_qcm:
    assert session.delete(
        f'{API_URL}{API_PATH}/tests/questions/{q["id"]}'
    ).status_code in [404, 204], f'Failed to delete item {q["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/tests/questions", json=q)
    if r.status_code not in [201]:
        print(f'Failed to create item {q["id"]}: {r.text}')
        continue

    if r.text != str(q["id"]):
        print(f'Item {q["id"]} was created with id {r.text}')

    n_questions_qcm += 1
else:
    print(f"Successfully created {n_questions_qcm}/{len(questions_qcm)} qcm questions")

# CREATE QUESTIONS GAPFILL

n_questions_gapfill = 0

for q in questions_gapfill:
    assert session.delete(
        f'{API_URL}{API_PATH}/tests/questions/{q["id"]}'
    ).status_code in [404, 204], f'Failed to delete item {q["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/tests/questions", json=q)
    if r.status_code not in [201]:
        print(f'Failed to create item {q["id"]}: {r.text}')
        continue

    if r.text != str(q["id"]):
        print(f'Item {q["id"]} was created with id {r.text}')

    n_questions_gapfill += 1
else:
    print(
        f"Successfully created {n_questions_gapfill}/{len(questions_gapfill)} gapfill questions"
    )

# CREATE GROUPS

n_groups = 0

for group in groups:
    group = group.copy()
    its = group.pop("items_id")
    assert session.delete(
        f'{API_URL}{API_PATH}/tests/groups/{group["id"]}'
    ).status_code in [404, 204], f'Failed to delete group {group["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/tests/groups", json=group)
    if r.status_code not in [201]:
        print(f'Failed to create group {group["id"]}: {r.text}')
        continue

    if r.text != str(group["id"]):
        print(f'Group {group["id"]} was created with id {r.text}')

    n_groups += 1

    for it in its:
        assert session.delete(
            f'{API_URL}{API_PATH}/tests/groups/{group["id"]}/questions/{it}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete question {it} from group {group["id"]}'
        r = session.post(
            f'{API_URL}{API_PATH}/tests/groups/{group["id"]}/questions/{it}'
        )
        if r.status_code not in [201]:
            print(f'Failed to add item {it} to group {group["id"]}: {r.text}')
            continue

else:
    print(f"Successfully created {n_groups}/{len(groups)} groups")

# CREATE TASK TESTS

n_task_tests = 0

for t in tests_task:
    t = t.copy()
    gps = t.pop("groups_id")
    assert session.delete(f'{API_URL}{API_PATH}/tests/{t["id"]}').status_code in [
        404,
        204,
    ], f'Failed to delete test {t["id"]}'
    r = session.post(f"{API_URL}{API_PATH}/tests", json=t)
    if r.status_code not in [201]:
        print(f'Failed to create suvey {t["id"]}: {r.text}')
        continue

    if r.text != str(t["id"]):
        print(f'Survey {t["id"]} was created with id {r.text}')

    n_task_tests += 1

    for gp in gps:
        assert session.delete(
            f'{API_URL}{API_PATH}/tests/{t["id"]}/groups/{gp}'
        ).status_code in [
            404,
            204,
        ], f'Failed to delete gp {gp} from test {t["id"]}'
        r = session.post(f'{API_URL}{API_PATH}/tests/{t["id"]}/groups/{gp}')
        if r.status_code not in [201]:
            print(f'Failed to add group {gp} to test {t["id"]}: {r.text}')
            break

else:
    print(f"Successfully created {n_task_tests}/{len(tests_task)} tests")
