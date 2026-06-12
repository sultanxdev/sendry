name: Feature Request
description: Suggest an idea for Sendry
title: "[FEATURE] "
labels: ["enhancement", "needs-triage"]

body:
  - type: markdown
    attributes:
      value: |
        Thank you for suggesting a feature! Please provide details below.

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this solve?
      placeholder: "Currently, there's no way to..."
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How should this feature work?
      placeholder: "I propose adding..."
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      description: Any alternative approaches?
      placeholder: "Other options could include..."

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other relevant information?

  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      options:
        - label: I have searched existing feature requests
          required: true
        - label: This feature would benefit multiple users
