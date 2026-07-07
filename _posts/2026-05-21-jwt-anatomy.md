---
layout: post
title: 'What every segment of a JWT actually means'
slug: jwt-anatomy
date: 2026-05-21
description: 'A technical walkthrough of JWT structure, claims, signature mechanics, and why online debuggers are a security problem.'
image:
  path: /assets/zentsu-og.png
  width: 1200
  height: 630
  alt: 'Zentsu LLC. Software for Apple platforms'
---

If you have ever shipped an authenticated API, you have pasted a JWT
into a debugger, watched it expand into three colored chunks, and moved
on. That habit is fine until the day a token is rejected for reasons
the colored chunks don't explain, or the day someone on the security
team asks why you pasted a production token into a website.

We build dev tools at Zentsu, so we look at JWTs constantly. This is
the explanation we wish we had handed our past selves: what is actually
in those three segments, what the debugger glosses over, and where the
abstractions fray.

## The shape

A JWT is three Base64Url-encoded JSON-ish blobs joined by dots:

```
<header>.<payload>.<signature>
```

That's it. There is no fourth segment. The "encryption" you may have
heard about is JWE, a different and rarer spec; the standard JWT you
get from your auth provider is a JWS: _signed_, not encrypted. Anyone
who can read the bytes of the token can read the contents. That is the
single most-mispronounced fact about JWTs in production code.

## Segment 1: the header

The header is a tiny JSON object describing how the rest of the token
was produced. Two fields matter in practice:

- `alg`: the signing algorithm. `HS256` (HMAC-SHA-256, symmetric
  secret), `RS256` (RSA, asymmetric), `ES256` (ECDSA on P-256). If you
  ever see `alg: "none"` on a token your code is about to trust, stop
  reading and go fix that. The "none" algorithm is the canonical JWT
  vulnerability and has been since 2015.
- `kid`: a key ID. When your IdP rotates signing keys, the verifier
  uses `kid` to pick the right public key from a JWKS endpoint. If you
  are hard-coding a single public key in your service, key rotation
  will eventually break you.

There is no secret data here. It is metadata. The fields are
_advisory_ unless your verification library specifically pins them.
A token can claim `alg: "RS256"` and still be a forgery if the verifier
doesn't refuse mismatched algorithms.

## Segment 2: the payload (claims)

The payload is the part everyone actually cares about. It is also a
JSON object, and the keys are called _claims_. The standard ones are
short on purpose because every byte costs you in headers:

- `iss`: issuer. Who minted this token. `https://auth.example.com`.
- `sub`: subject. Who the token is _about_. Usually a user ID. This
  is not a username; treat it as opaque.
- `aud`: audience. Who the token is _for_. If your service is not in
  the audience list, you must reject the token even if the signature
  is valid.
- `exp`: expiration time, as seconds since the Unix epoch. Past this,
  the token is dead.
- `nbf`: "not before." Tokens with `nbf` in the future are not yet
  valid. Most issuers omit this; some compliance contexts require it.
- `iat`: issued at. When the token was minted. Useful for sliding
  expiry and audit logs.
- `jti`: JWT ID. A unique identifier for this specific token, used
  for revocation lists and replay-detection.

Anything else in the payload is custom. Roles, tenant IDs, feature
flags. Your team can put whatever it wants here. Just remember: it is
all readable by anyone with the token, and every byte is sent on every
request. Custom claims are not a database; they are a lossy cache
optimized for "I trust this enough to skip a lookup."

## Segment 3: the signature

This is where most explanations get hand-wavy. The signature is _not_
a password. It is not a secret you compare against another secret. It
is a verifiability check.

What actually happens: the issuer computes a cryptographic signature
over `Base64Url(header) + "." + Base64Url(payload)`, using either a
shared secret (HMAC) or a private key (RSA/ECDSA). The signature gets
Base64Url-encoded and appended as the third segment.

When your service receives the token, it does the same computation
with the verifying key (the shared HMAC secret, or the issuer's public
key) and checks that the result matches the third segment. If yes, the
header and payload have not been altered since they were signed. If
no, somebody tampered or you have the wrong key.

That's the entire trust model. The signature does not encrypt anything.
It does not hide the payload. It only proves the header and payload
were not modified after signing. If you wanted secrecy, you wanted JWE
or you wanted to not put the data in a JWT at all.

## Base64Url, not Base64

The encoding is _Base64Url-safe without padding_. That means `+`
becomes `-`, `/` becomes `_`, and trailing `=` characters are
stripped. If your debugger pastes the token through a generic Base64
decoder, the last segment will fail half the time. Many debuggers
silently re-pad behind the scenes; the segments looking "clean" in the
UI does not mean the bytes round-trip cleanly through your `base64`
shell command.

## Why the online debugger is a problem

The token in your clipboard is, by definition, valid. Signature matches,
`exp` hasn't passed, `aud` is your service. If it weren't all of those,
you wouldn't be debugging it.

When you paste it into an online JWT debugger, you have just sent a
working credential to a third party's web server. The site's privacy
policy may or may not say it's stored. The browser's history remembers.
Shell history, if you `curl`'d it, remembers. Some IdPs issue twelve-
hour lifetimes: twelve hours during which a copy of the credential
lives somewhere you don't control.

The fix is not "use a more reputable site." The fix is to never let
production tokens leave the machine. Decode them locally, in a tool
that processes bytes in-memory and forgets: a small offline utility,
a CLI, anything that doesn't phone home.

## What to actually check, every time

When a token shows up and you're not sure why your service rejected it,
walk this list before reaching for a debugger:

1. Is `alg` what your verifier expects, _pinned by config_?
2. Is `iss` the issuer you trust?
3. Is `aud` your service?
4. Is `exp` in the future, allowing small clock-skew tolerance?
5. Is `nbf` absent or already in the past?
6. Does the signature verify against the _current_ signing key, after
   honoring `kid`?

Most production rejection bugs are one of those six. The rest are
clock skew between machines, key-rotation timing windows, and,
depressingly often, somebody hand-rolling a verifier that doesn't
pin `alg`.

## The takeaway

A JWT is not magic. It is a signed, base64url-wrapped JSON pair where
the contents are public, the signature proves untampered transport, and
the standard claims tell you who minted it, who it is for, when it
became valid, and when it dies. Treat every token as a credential (because it is one)
and decode them where the bytes cannot leak.

If you spend any time in auth code, an offline JWT decoder belongs in
your toolbox next to your hex editor and your regex tester. Bench's
[JWT decoder](/tools/jwt-decoder.html) processes everything locally. Try
it the next time a token confuses you.
