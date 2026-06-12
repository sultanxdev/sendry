name: Bug Report
description: Report a bug in Sendry
title: "[BUG] "
labels: ["bug", "needs-triage"]

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide the following information.

  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear description of what the bug is
      placeholder: "When I try to..., the system..."
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to...
        2. Create...
        3. See error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What should happen
      placeholder: "The system should..."
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happens
      placeholder: "Instead it..."
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Version
      description: What version are you running?
      placeholder: "1.0.0"
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: |
        OS, Node.js version, etc.
      placeholder: |
        - OS: macOS 12.1
        - Node.js: 18.10.0
        - MongoDB: 5.0
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Error Logs
      description: Paste relevant error logs (keep it short)
      render: bash

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other context about the problem

  - type: checkboxes
    id: checklist
    attributes:
      label: Checklist
      options:
        - label: I have searched existing issues
          required: true
        - label: I have provided enough information to reproduce
          required: true
