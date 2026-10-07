# Field spec

Every field the frontend uses. **R** = required, **O** = optional, **auto** = set by backend.

## User
| Field | Type | Who | Rule |
|---|---|---|---|
| full_name | string | all | R |
| email | string | all | R, unique, must end with `@ritindia.edu` |
| password | string | all | R on signup, min 8 chars (store hashed) |
| role | `admin` \| `teacher` \| `student` | all | R |
| phone | string | all | O, 10-digit Indian mobile |
| department | string | all | R, from department list |
| prn | string | student | R, 10 digits, unique |
| roll_no | string | student | R |
| year | `FY` \| `SY` \| `TY` \| `LY` | student | R |
| division | `A`–`D` | student | R |
| employee_id | string | teacher | R, unique |
| designation | string | teacher | R |
| is_active | bool | all | auto, default true (admin can disable) |
| is_approved | bool | all | auto; teachers start false until admin approves |
| created_at | datetime | all | auto |

## Class
| Field | Type | Rule |
|---|---|---|
| subject_name | string | R |
| subject_code | string | R, e.g. AI401 |
| department | string | R |
| year | FY/SY/TY/LY | R |
| division | string | R |
| semester | int 1–8 | R |
| academic_year | string | R, e.g. 2026-27 |
| name | string | O, defaults to "`subject_name` – `year` `division`" |
| join_code | string(6) | auto, uppercase, unique — typed by students |
| join_token | string | auto, unique — encoded in QR as `/join/{join_token}` |
| allow_join | bool | default true |
| join_expires_at | datetime | O |
| teacher_id, teacher_name, student_count, created_at | — | auto |

Students ↔ classes is many-to-many (a `class_members` table with `class_id`, `student_id`, `joined_at`).

## Quiz
| Field | Type | Rule |
|---|---|---|
| class_id | int | R |
| title | string | R |
| description | string | O, shown in student waiting room |
| mode | `quiz` \| `poll` | R; poll = no scoring, no correct answers |
| status | `draft` \| `scheduled` \| `live` \| `closed` | auto |
| scheduled_at | datetime | O |
| shuffle_questions | bool | default false |
| shuffle_options | bool | default true |
| speed_bonus | bool | default true |
| show_leaderboard_each_question | bool | default true |
| allow_late_join | bool | default true |

## Question
| Field | Type | Used by | Rule |
|---|---|---|---|
| order | int | all | R |
| type | `mcq` \| `multi_select` \| `true_false` \| `rating` \| `word_cloud` \| `open_text` | all | R |
| text | string | all | R, max 300 |
| image_url | string | all | O |
| options | string[] | mcq, multi_select (2–6), true_false (fixed) | R for those types |
| correct_options | int[] | mcq (1), multi_select (1+), true_false (1) | R in quiz mode |
| time_limit_sec | int | all | 5–120, default 30 |
| points | int | scored types | 0 / 500 / 1000 / 2000 |
| explanation | string | scored types | O, shown after reveal |
| rating_max | int | rating | 5 or 10 |
| max_words | int | word_cloud | 1–3 |
| max_chars | int | open_text | 20–500 |

## Response (one per student per question)
| Field | Type |
|---|---|
| question_id, student_id | int |
| answer | int[] for choice/rating, string for text |
| is_correct | bool (null for unscored) |
| response_time_ms | int |
| points_awarded | int — `points × (0.5 + 0.5 × time_left / time_limit)` with speed bonus, else `points` |
| submitted_at | datetime |

## Admin settings
domain, institute name, academic_year, student_self_signup, teacher_approval,
max_class_size, join_code_expiry_hours, default_time, default_points,
speed_bonus default, data_retention_days.

## Live events (WebSocket `/ws/quiz/{quiz_id}`)
`student_joined {name}` · `question_start {question, ends_at}` · `answer_count {answered, total}` ·
`question_end {correct_options, distribution}` · `leaderboard {top}` · `quiz_end {final}`.
Teacher controls send: `start`, `next`, `pause`, `add_time {seconds}`, `close_answers`, `end`.
