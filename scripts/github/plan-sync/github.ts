export type RepoRef = { owner: string; repo: string }

const GH_ACCEPT = 'application/vnd.github+json'
const GH_API_VERSION = '2022-11-28'

export function getToken(): string {
  const t = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (!t?.trim()) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required for plan:sync')
  }
  return t.trim()
}

export function parseRepoRef(): RepoRef {
  const full = process.env.GITHUB_REPOSITORY?.trim()
  if (full?.includes('/')) {
    const [owner, repo] = full.split('/')
    if (owner && repo) {
      return { owner, repo }
    }
  }
  const owner = process.env.GITHUB_OWNER?.trim()
  const repo = process.env.GITHUB_REPO?.trim()
  if (owner && repo) {
    return { owner, repo }
  }
  throw new Error('Set GITHUB_REPOSITORY (owner/repo) or GITHUB_OWNER + GITHUB_REPO')
}

export type RestIssue = {
  id: number
  node_id: string
  number: number
  title: string
  body: string | null
  labels?: { name: string }[]
}

export async function restCreateIssue(args: {
  owner: string
  repo: string
  title: string
  body: string
  labels: string[]
}): Promise<RestIssue> {
  const token = getToken()
  const res = await fetch(`https://api.github.com/repos/${args.owner}/${args.repo}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: GH_ACCEPT,
      'X-GitHub-Api-Version': GH_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: args.title, body: args.body, labels: args.labels }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`createIssue failed ${res.status}: ${text}`)
  }
  return (await res.json()) as RestIssue
}

export async function restUpdateIssue(args: {
  owner: string
  repo: string
  issueNumber: number
  title: string
  body: string
  labels: string[]
}): Promise<RestIssue> {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: GH_ACCEPT,
        'X-GitHub-Api-Version': GH_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: args.title, body: args.body, labels: args.labels }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`updateIssue failed ${res.status}: ${text}`)
  }
  return (await res.json()) as RestIssue
}

export async function restGetIssue(args: {
  owner: string
  repo: string
  issueNumber: number
}): Promise<RestIssue> {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: GH_ACCEPT,
        'X-GitHub-Api-Version': GH_API_VERSION,
      },
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`getIssue failed ${res.status}: ${text}`)
  }
  return (await res.json()) as RestIssue
}

export async function restComment(args: {
  owner: string
  repo: string
  issueNumber: number
  body: string
}): Promise<void> {
  const token = getToken()
  const res = await fetch(
    `https://api.github.com/repos/${args.owner}/${args.repo}/issues/${args.issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: GH_ACCEPT,
        'X-GitHub-Api-Version': GH_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: args.body }),
    },
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`issue comment failed ${res.status}: ${text}`)
  }
}

type GraphQlResponse<T> = { data?: T; errors?: { message: string }[] }

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = getToken()
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`graphql HTTP ${res.status}: ${text}`)
  }
  const json = (await res.json()) as GraphQlResponse<T>
  if (json.errors?.length) {
    throw new Error(`graphql: ${json.errors.map((e) => e.message).join('; ')}`)
  }
  if (!json.data) {
    throw new Error('graphql: empty data')
  }
  return json.data
}

export async function gqlAddProjectItem(args: {
  projectId: string
  contentNodeId: string
}): Promise<string> {
  const data = await graphqlRequest<{ addProjectV2ItemById: { item: { id: string } } }>(
    `mutation($pid:ID!, $cid:ID!) {
      addProjectV2ItemById(input:{projectId:$pid, contentId:$cid}) {
        item { id }
      }
    }`,
    { pid: args.projectId, cid: args.contentNodeId },
  )
  return data.addProjectV2ItemById.item.id
}

export async function gqlFindProjectItem(args: {
  projectId: string
  issueNumber: number
  owner: string
  repo: string
}): Promise<string | undefined> {
  const data = await graphqlRequest<{
    repository: {
      issue: {
        projectItems: { nodes: { id: string; project: { id: string } | null }[] }
      } | null
    }
  }>(
    `query($owner:String!, $name:String!, $num:Int!) {
      repository(owner:$owner, name:$name) {
        issue(number:$num) {
          projectItems(first: 50) {
            nodes { id project { ... on ProjectV2 { id } } }
          }
        }
      }
    }`,
    { owner: args.owner, name: args.repo, num: args.issueNumber },
  )
  const nodes = data.repository.issue?.projectItems.nodes ?? []
  const hit = nodes.find((n) => n.project?.id === args.projectId)
  return hit?.id
}

export async function gqlUpdateProjectItemStatus(args: {
  projectId: string
  itemId: string
  fieldId: string
  optionId: string
}): Promise<void> {
  await graphqlRequest<{ updateProjectV2ItemFieldValue: { projectV2Item: { id: string } } }>(
    `mutation($projectId:ID!, $itemId:ID!, $fieldId:ID!, $optionId:String!) {
      updateProjectV2ItemFieldValue(input:{
        projectId:$projectId,
        itemId:$itemId,
        fieldId:$fieldId,
        value:{ singleSelectOptionId:$optionId }
      }) {
        projectV2Item { id }
      }
    }`,
    {
      projectId: args.projectId,
      itemId: args.itemId,
      fieldId: args.fieldId,
      optionId: args.optionId,
    },
  )
}

export function requireEnv(name: string): string {
  const v = process.env[name]?.trim()
  if (!v) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return v
}

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name]?.trim()
  return v || undefined
}
