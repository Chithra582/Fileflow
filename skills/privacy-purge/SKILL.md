---
name: privacy-purge
description: Ensure ephemeral processing and immediate unlinking of temporary file buffers.
---

# Privacy Purge Skill

## Overview
Enforces zero data retention by immediately deleting uploaded and intermediate files after conversion.

## Operations
1. Tracks temporary file paths during conversion lifetime.
2. Invokes unlink and garbage collection post-response.
3. Audits working directory to prevent storage accumulation.
