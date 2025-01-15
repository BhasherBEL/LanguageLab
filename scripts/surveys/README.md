## Create surveys

Surveys are composed of questions, referred to as items, grouped into groups. Surveys are then created by combining these groups.

### CSV structure

The data required to create surveys is divided into three CSV files:

1. `items.csv` to create items.
2. `groups.csv` to create groups, where items are just appended at the end of each line.
3. `surveys.csv` to create surveys, where groups are appended at the end of each line.

Even if the script do some checks, it's important to double-check that there are no duplicates in ID for each field, or it will fail (or not provide the expected output). 
It's also important to know that running again a script on the same survey/group/item, will first **delete** it, before recreating it. So, be cautious!

### Format

The CSV is formatted as follows:
```csv
id,question,correct,option1,option2,option3,option4,option5,option6,option7,option8
```

Unused options can be let blank. Example:
```csv
1,"What's your favorite color?",1,"Red","Blue","Green",,,,,
```

In `items.csv`, blanks fields are replaced by files from [static/surveys/items](../../frontend/static/surveys/items), with the structure `<item_id>/<option_id|q>.<jpeg|mp3>`. 

The previous example could become:
```csv
1,"What's your favorite color?",1,,,,,,,,
```
with
```sh
/static/surveys/items/1/1.jpeg  # Red picture
/static/surveys/items/1/2.jpeg  # Blue picture
/static/surveys/items/1/3.jpeg  # Green picture
```

### Types

Each value can have 4 types:
- Text: `"What's your favorite color?"`
- Image: `<blank>` with `/static/surveys/item/<item_id>/<option_id>.jpeg`
- Sound: `<blank>` with `/static/surveys/item/<item_id>/<option_id>.mp3`
- Gapfill: `What's y<ou>r (ta) favourite c<olo>r (couleur)?` (only on questions, responses entries are ignored)


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

