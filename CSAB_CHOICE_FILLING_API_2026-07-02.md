# CSAB Choice Filling API Documentation

> **Last Updated:** 2026-07-02
> **Base URL:** `/api/choice-filling/csab`

The CSAB Choice Filling system generates a personalised, priority-ordered college list (NITs, IIITs, GFTIs) for students participating in CSAB Special Round Counselling. It cross-references historical round-wise cutoff datasets with curated priority/preference order lists using a multi-stage logic engine conforming to the Technical Specification (Rev 6).

---

## What's New (2026-07-02)

This is a newly implemented choice filling module specifically engineered for the CSAB counselling process, featuring:
1. **Three-Round Master Cutoff deduplication** (R3 $\rightarrow$ R2 $\rightarrow$ R1 priority).
2. **Female priority gender logic** (Female-only first, then Gender-Neutral, duplicate omit).
3. **PwD rank bypass rule** (Full preference list showing available cutoffs).
4. **Home State dream and backup logic** with specific safety bands and 21 exempt states.
5. **75% to 130% Range Recheck** appended separately.
6. **Fallback safety net** (Case A: results $\le$ 90 colleges; Case B: high rank with 0 matches $\rightarrow$ returns last 150 safe choices).
7. **Gender Constraint** excluding Gurukula Kangri Vishwavidyalaya, Haridwar for female candidates.
8. **Excel and PDF exports** conforming to standard JOSAA layouts with custom dynamic columns (Counsellor full view vs Student 3-column view).

---

## Database Collections

*   **CSAB R3 Cutoff**: `csab_r3_cutoff` (Primary cutoff source)
*   **CSAB R2 Cutoff**: `csab_r2_cutoff` (Secondary cutoff source)
*   **CSAB R1 Cutoff**: `csab_r1_cutoff` (Tertiary cutoff source)
*   **Preference General**: `csab_preference_gen` (Doc 4 — for `OPEN`, `EWS`, `OBC-NCL`)
*   **Preference Reserved**: `csab_preference_reserved` (Doc 5 — for `SC`, `ST` and all `PwD` categories)

*Seeding is automated via the script `src/scripts/seedCSABData.ts` which parses the datasets directly from `/Choice_Filling_Tool_CSAB_2026/Input`.*

---

## Endpoints

### `POST /generate`

Generates a personalised, prioritised choice list as JSON.

**Access:** Authenticated (Requires `choiceFilling` feature access key `CSAB`)

#### Request Body

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `name` | `string` | ✅ | Student's full name (Alphabets only) |
| `crlRank` | `number` | ✅ | JEE Main Common Rank List (CRL) rank |
| `categoryRank` | `number` | ❌ | Category rank (optional, for display/details) |
| `gender` | `"Male" \| "Female"` | ✅ | Student's gender |
| `category` | `string` | ✅ | Main category (one of: `OPEN`, `EWS`, `OBC-NCL`, `SC`, `ST`, or their `(PwD)` variants) |
| `homeState` | `string` | ✅ | Student's home state (one of the 36 supported States/UTs) |
| `instituteType` | `string[]` | ❌ | Filter by institute type(s) (`NIT`, `IIIT`, `GFTI`). Defaults to all |
| `branchGroup` | `string[]` | ❌ | Filter by branch group(s) (e.g. `Computer Science`, `Electrical`). Defaults to `["All"]` |
| `includedStates` | `string[]` | ❌ | Filter to only include colleges located in these specific states |

#### Sample Request
```json
{
  "name": "Rohan Sharma",
  "crlRank": 25000,
  "gender": "Male",
  "category": "OPEN",
  "homeState": "Andhra Pradesh",
  "instituteType": ["NIT", "IIIT"]
}
```

#### Response Structure (Counsellor View)

```json
{
  "user": {
    "name": "Rohan Sharma",
    "crlRank": 25000,
    "categoryRank": null,
    "gender": "Male",
    "category": "OPEN",
    "homeState": "Andhra Pradesh",
    "instituteType": ["NIT", "IIIT"],
    "branchGroup": ["All"],
    "includedStates": []
  },
  "searchRank": 22500,
  "minRange": 18750,
  "maxRange": 32500,
  "totalChoices": 161,
  "choices": [
    {
      "serialNo": 1,
      "choiceNo": 96,
      "institute": "National Institute of Technology Patna",
      "program": "Computer Science and Engineering with Specialization in Cyber Security (5 Years, Bachelor and Master of Technology (Dual Degree))",
      "quota": "Other State",
      "seatType": "OPEN",
      "gender": "Gender-Neutral",
      "openingRank": 14256,
      "closingRank": 25330,
      "origin": "R3",
      "isHomeState": false
    }
  ],
  "disclaimer": "..."
}
```

> **Student View Override:** If the requesting user's role is `student` or the query/body contains `exportAs: "student"`, the output is restricted. The properties `searchRank`, `minRange`, and `maxRange` are omitted, and each choice item in `choices[]` only contains four properties: `serialNo`, `choiceNo` (sequential choice position), `institute`, and `program`.

---

### `POST /export/excel`

Generates a downloadable Excel workbook. Request body validation and payload is **identical** to `/generate`.

**Access:** Authenticated (Requires `choiceFilling` feature access key `CSAB`)

**Returns:** Binary Excel file
**Filename:** `CSAB_Personalised_NIT_IIIT_GFTI_Choice_Filling_[Name].xlsx`

#### Excel Sheet Structure

*   **Sheet 1 — Choices:**
    *   *Student View*: contains columns: `Choice No`, `Institute`, and `Program`.
    *   *Counsellor View*: contains full columns: `Serial No`, `Choice No`, `Institute`, `Academic Program Name`, `Quota`, `Seat Type`, `Gender`, `Opening Rank`, `Closing Rank`, `Origin`, and `Home State Quota`.
*   **Sheet 2 — Summary:** Contains candidate profiling details (Name, Ranks, Category, Home State, Filters) and the disclaimer text.

---

### `POST /export/pdf`

Generates a downloadable PDF document with a professional watermarked JOSAA layout. Request body validation is **identical** to `/generate`.

**Access:** Authenticated (Requires `choiceFilling` feature access key `CSAB`)

**Returns:** Binary PDF file
**Filename:** `CSAB_Personalised_NIT_IIIT_GFTI_Choice_Filling_[Name].pdf`

---

## Processing Pipeline Algorithm

The engine processes student inputs through the following sequence:

### 1. Ranks and Search Boundaries
*   `Search_Rank = crlRank * 0.90` (10% safety margin).
*   `Min_Range = crlRank * 0.75` and `Max_Range = crlRank * 1.30` (For Range Recheck).
*   *Note: For PwD candidates, all rank constraints, safety factors, and range limitations are completely bypassed.*

### 2. Preference List Selection
*   General categories (`OPEN`, `EWS`, `OBC-NCL`) match with `csab_preference_gen` (Doc 4).
*   Reserved & PwD categories (`SC`, `ST`, and all PwD variants) match with `csab_preference_reserved` (Doc 5).

### 3. Cutoff Filters & Round Deduplication
*   **Quota filter**: NITs scan OS quota. IIITs and GFTIs scan AI or OS quotas.
*   **Category filter**: `Seat_Type` must match the user's category (unless PwD).
*   **Gender filter**: Male candidates get `Gender-Neutral` seats. Female candidates get `Female-only` seats prioritized first, falling back to `Gender-Neutral` seats for non-duplicate combinations.
*   **Round Deduplication (R3 $\rightarrow$ R2 $\rightarrow$ R1)**: If a college+program is present in R3, its cutoff and round origin are locked. If absent in R3, the algorithm queries R2, and falls back to R1 if missing in R2.

### 4. Base List Assembly (Up to 150 choices)
*   Find the first 25 matching colleges after the `Search_Rank` (sorted by `Closing_Rank` ascending) in R3.
*   Find the first 25 unique matching colleges in R2 (excluding R3 matches).
*   Find the first 25 unique matching colleges in R1 (excluding R3/R2 matches).
*   Sort the accumulated pool of up to 75 unique colleges by preference list order.
*   Find the lowest choice number in this sorted pool (`minChoiceNo`).
*   Retrieve **150 consecutive choices** from the preference list starting from `minChoiceNo`. This forms the base choices.

### 5. Home State Integration
*   If the candidate's home state matches any colleges, cutoffs are evaluated.
*   **Non-Exempt States**:
    *   *Dream*: `crlRank * 0.70 <= Closing_Rank < Search_Rank` $\rightarrow$ Added to **TOP**.
    *   *Backup*: `Search_Rank < Closing_Rank <= crlRank * 1.20` $\rightarrow$ Added to **BOTTOM**.
*   **Exempt States (21 States/UTs)**: Dream and Backup range checks are bypassed (Dream goes to TOP, Backup to BOTTOM based purely on whether `Closing_Rank` is below/above the `Search_Rank`).

### 6. Range Recheck Appending
*   Scans cutoffs where `crlRank * 0.75 <= Closing_Rank <= crlRank * 1.30`.
*   Any matching college+program not already in the choices list is sorted by preference choice number and appended to the end of the list.

### 7. Fallback Safety Net
*   If the list size (prior to range recheck) is $\le 90$ colleges, or if no results are found (due to a very high rank), fallback is triggered.
*   The entire list is discarded, and the **last 150 choices** from the preference list are returned as the output choices (marked with origin `FALLBACK`).

### 8. Exclusions and Re-indexing
*   **Haridwar Exclusion**: For female candidates, all programs at `Gurukula Kangri Vishwavidyalaya, Haridwar` are excluded.
*   **Architecture Exclusion**: All architecture/planning programs are excluded.
*   **Re-indexing**: Sequential serial numbers (`serialNo`) and choice numbers (`choiceNo` in student view) are re-indexed from $1$ to $N$ with no gaps.
