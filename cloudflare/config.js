/**
 * Fail-closed Cloudflare deployment checks. The returned names are configuration
 * keys only, never email addresses, secrets, Access tokens or database contents.
 */
export function normalizeTeamDomain(value) {
  if(typeof value!=="string")return null;
  try {
    const url=new URL(value.trim());
    if(url.protocol!=="https:" ||
       !/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(url.hostname) ||
       url.pathname!=="/" || url.search || url.hash) return null;
    return url.origin;
  } catch {return null;}
}

export function configurationIssues(env) {
  const issues=[];
  if(!normalizeTeamDomain(env?.TEAM_DOMAIN)) issues.push("TEAM_DOMAIN");
  if(typeof env?.POLICY_AUD!=="string" || !env.POLICY_AUD.trim()) issues.push("POLICY_AUD");
  if(typeof env?.ADMIN_EMAIL!=="string" ||
     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ADMIN_EMAIL.trim())) issues.push("ADMIN_EMAIL");
  if(typeof env?.CSRF_SECRET!=="string" || env.CSRF_SECRET.length<32) issues.push("CSRF_SECRET");
  if(!env?.DB || typeof env.DB.prepare!=="function") issues.push("DB");
  if(!env?.ASSETS || typeof env.ASSETS.fetch!=="function") issues.push("ASSETS");
  return issues;
}
