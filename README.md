# Contract

Recognize and store legally enforceable agreement documents — NDAs, MSAs, SOWs, employment agreements, vendor agreements, and licensing agreements. Both executed contracts and reusable templates with bracketed placeholders are recognized, so the same artifact type holds your signed paper and the forms you reuse.

**Install.** Add this artifact to your workspace from the marketplace. No additional credentials are required — the classifier runs inside the platform on files you attach.

**Usage.** Attach a `.md` or `.pdf` file to a Cinatra run. The platform scores the file using the `contract-matcher` skill (confidence threshold 0.70). Files scoring at or above the threshold are stored as Contract artifacts and become available for retrieval and comparison in later runs. Files that score below the threshold are not classified as contracts and remain unaffected.

**Configuration.** No configuration fields are required. The artifact is installed workspace-wide. To skip classification for a specific file, use a different artifact type or leave the file as a plain attachment.

**Troubleshooting.** If a PDF or Markdown file is not classified as a contract, check whether it contains the structural cues the matcher looks for: a title declaring the contract type, a PARTIES section, WHEREAS recitals, numbered sections, and a signature block. Informal or partial drafts may score below the 0.70 threshold. Contract templates with bracketed placeholders are valid and should score 0.70–0.80.

## Works with

- Any agent that processes attached files and needs legal context (such as a contract-review or negotiation agent)

## Capabilities

- Classify an attached Markdown or PDF file as a legal contract at or above 0.70 confidence
- Store the full body of a signed contract or reusable template as a named artifact
- Retrieve a past agreement when reviewing similar terms in a later run
- Attach as reference context when an agent needs grounded legal language
- Compare contracts side by side when negotiating new versions
