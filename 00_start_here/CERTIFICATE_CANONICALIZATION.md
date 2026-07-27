# Certificate Canonicalization v1

This specification defines the reproducible drift seal used by `.wcbs/bootstrap-certificate.json`.

1. Paths are repository-relative POSIX paths with no leading `./`.
2. Entries are sorted lexicographically by byte value of the normalized path.
3. Valid UTF-8 text is encoded as UTF-8. Invalid UTF-8 is hashed as raw bytes.
4. Files declared text by `.gitattributes` normalize CRLF and lone CR to LF.
5. Whitespace is not trimmed.
6. Unicode is not normalized.
7. Symlink inputs are rejected and certification is `BLOCKED`.
8. Every input is hashed separately with SHA-256 and recorded in the manifest.
9. The aggregate input is `canonicalization_version + LF`, followed by each sorted `path + NUL + content_sha256 + LF`.
10. Wall-clock, run identity, and timestamp-derived fields are excluded.
11. The certificate itself is excluded.
12. Missing optional inputs are recorded with `sha256: null` and `state: absent`.
13. Generated Markdown is excluded when canonical source JSON exists. `LOAD_ORDER.md`, `CAPABILITY_MATRIX.md`, and `BOOTSTRAP_CONTROLLER.md` are verified by their own generation checks.
14. Source JSON is authoritative over generated renderings.
15. `canonicalization_version` is written into the certificate and necessarily changes the aggregate hash when changed.

The seal detects accidental drift, truncation, and swapped inputs. It is not cryptographic attestation because the runtime creating the certificate controls the inputs.
