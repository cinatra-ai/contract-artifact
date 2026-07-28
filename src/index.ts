import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/contract-artifact`: legal contracts (NDAs, MSAs, SOWs,
// employment agreements, vendor agreements, etc.) as semantic artifacts.
// Distinct from operational legal-record data objects, which remain
// relational.
//
// Bytes-only matcher for text/markdown and application/pdf. .docx is not
// in the LLM capability registry. Legal contracts have strong structural cues
// (WHEREAS / PARTIES / signature blocks), so the LLM matcher can reliably
// classify from bytes alone at 0.7 confidence.
export const contractArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "application/pdf"],
    },
  },
  skills: {
    matchers: ["@cinatra-ai/contract-matcher-skill:contract-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
  objectTypes: [
    {
      type: "@cinatra-ai/contract-artifact:contract",
      claim: "dedicated",
      dispositions: {
        projection: "artifact-safe",
        sensitivity: "sensitive",
      },
      schema: {
        type: "object",
      },
    },
  ],
};
