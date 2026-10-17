// Public status endpoint: intentionally does not reveal secrets or account details.
export default async function handler(request) {
  if (request.method !== 'GET') return new Response('Method not allowed', {status:405});
  const configured = process.env.ENABLE_RESULTS === 'true' && Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.FROM_EMAIL);
  return Response.json({service:'breakthrough-results',configured,readyForPublicLaunch:false}, {
    headers:{'Cache-Control':'no-store'}
  });
}
