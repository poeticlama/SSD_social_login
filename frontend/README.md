# Frontend

## Docker (dev server with Vite proxy)

Build the image:

```
docker build -t ssd-frontend .
```

Run the dev server (port 80). If the backend runs on the host, set the proxy target:

```
docker run --rm -p 80:80 -e VITE_API_PROXY_TARGET=http://host.docker.internal:3001 ssd-frontend
```

If the backend runs in another container on the same network, use the service name:

```
docker run --rm -p 80:80 -e VITE_API_PROXY_TARGET=http://backend:3001 ssd-frontend
```

