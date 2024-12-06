## Create surveys

Surveys are composed of questions, referred to as items, grouped into groups. Surveys are then created by combining these groups.

### CSV structure

The data required to create surveys is divided into three CSV files:

1. `items.csv` to create items.
2. `groups.csv` to create groups, where items are just appended at the end of each line.
3. `surveys.csv` to create surveys, where groups are appended at the end of each line.

Even if the script do some checks, it's important to double-check that there is no duplicates in ID for each field, or it will fail (or not provide the expected output). 
It's also important to know that running again a script on the same survey/group/item, will first **delete** it, before recreating it. So, be cautious!

In `items.csv`, blanks fields are replaced by files from [static/surveys/items](../../frontend/static/surveys/items), with the structure `<item_id>/<option_id|q>.<jpeg|mp3>`. 

### Sample questions

In `groups.csv` there is a column `demo` that need to be set to `true` or `false`.
A group with demo set to `true` will be defined as a group needed to be shown at the beginning of the test.
The responses to these questions are not recorded in the final score.

### Special Group IDs
Groups with IDs >= 1100 are reserved for question with no correct answer that will be shown only if the user is not connected. 
Those special groups needs to be present in the source code.

To add a special group to the survey it needs to be added at the **end** of list of groups in `surveys.csv`.

#### Special Group: 1100
Items present in the special group 1100:
- The year of birth
- The gender 
- First language
- The education level

