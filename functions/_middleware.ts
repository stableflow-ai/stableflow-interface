const USERS = [
  { username: "admin", password: "dapdap999000" },
];
const AUTH_DOMAINS = [
  "test.stableflow.ai",
];

export async function onRequest(context: any) {
  const request = context.request
  const url = new URL(request.url)
  const hostname = url.hostname

  // HTTP Basic Authentication for test.stableflow.ai
  if (AUTH_DOMAINS.includes(hostname)) {
    const authHeader = request.headers.get("Authorization")

    let isAuthenticated = false
    
    if (authHeader && authHeader.startsWith("Basic ")) {
      try {
        // Parse Basic Auth header
        const base64Credentials = authHeader.substring(6) // Remove "Basic " prefix
        const credentials = atob(base64Credentials)
        const [username, password] = credentials.split(":", 2)
        
        // Validate username and password
        if (USERS.find((user) => user.username === username && user.password === password)) {
          isAuthenticated = true
        }
      } catch (e) {
        // Base64 decoding failed, authentication failed
        isAuthenticated = false
      }
    }
    
    // If not authenticated, return 401
    if (!isAuthenticated) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="StableFlow Test Environment"',
        },
      })
    }
  }

  // Region restriction check
  const country = context.request.cf?.country

  const BLOCKED = new Set([
    "AF","BY","CF","CU","CD","GW","HT","IR","LY","ML","MM","NI",
    "KP","RU","SO","SS","SD","SY","VE","YE",
  ])

  if (country && BLOCKED.has(country)) {
    return new Response("Access denied in your region.", {
      status: 403,
    })
  }

  return context.next()
}
