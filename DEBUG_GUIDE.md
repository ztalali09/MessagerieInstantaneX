# Troubleshooting Guide - Part 3 (The Fix)

We found the issue! The proxy logs show:
`dial tcp 10.0.6.3:80: connect: connection refused`

This means **Coolify's proxy is trying to talk to your app on port 80**, but your app was listening on port 3000.

## The Fix

I have updated your `docker-compose.backend.yml` to make the app listen on port 80.

1.  **Deploy the latest changes.**
2.  **Wait for the deployment to finish.**
3.  **Test the URL:** `https://wkg8o0cg80k4cgsokoc0sgwk.amethystrealms.games`

It should work now!

## Verification (Optional)

If it still fails, check the logs again:

```bash
docker logs messagex-backend --tail 20
```

It should now say:
`🚀 MessageX API server running at http://0.0.0.0:80`
