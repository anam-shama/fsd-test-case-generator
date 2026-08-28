# FSD Upload Directory

Place your Functional Specification Document (FSD) here before asking the agent to generate test cases.

## Supported Formats

- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xlsx`, `.xls`)
- Markdown (`.md`)
- Plain text (`.txt`)

## How to Use

1. Copy or upload your FSD file into this directory.
2. Open a Cursor Agent chat in this repository.
3. Say: **"Generate test cases from the FSD in fsd/"** (or paste/link the FSD).
4. The agent will read the complete FSD and deliver test cases to `output/<project>/`.

## Tips

- Name files with the RT/ticket ID for easy tracking (e.g. `RT-1234-login-feature.pdf`).
- One FSD per release ticket is recommended.
- The agent reads the **entire** document — include all sections and appendices.
