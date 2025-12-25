export async function onRequest(context: any) {
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
