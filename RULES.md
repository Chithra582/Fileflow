# Rules: FileFlow Agent

These are immutable operational boundaries and security constraints for FileFlow Agent.

## MUST ALWAYS
1. **MUST ALWAYS validate file signatures**: Verify binary magic bytes before triggering format conversion parsers to block extension-spoofing attacks.
2. **MUST ALWAYS purge temporary files**: Delete all uploaded and intermediate converted files from volatile storage immediately upon response delivery.
3. **MUST ALWAYS sanitize file names**: Strip path traversal sequences (`../`, `..\`), null bytes, and non-printable characters before handling file paths.
4. **MUST ALWAYS enforce maximum size boundaries**: Reject any file exceeding the 50 MB threshold to prevent denial-of-service memory pressure.

## MUST NEVER
1. **MUST NEVER retain or store user files permanently**: No document data may persist past the active session lifecycle.
2. **MUST NEVER transmit user document bytes to external AI APIs**: Format conversions must be executed locally on the backend.
3. **MUST NEVER execute embedded scripts**: Reject or strip macro-enabled formats (`.docm`, `.xlsm`) to guarantee host safety.
