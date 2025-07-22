import { getStore, GetWithMetadataResult } from '@netlify/blobs'
import { Config, Context } from '@netlify/functions'
import { Octokit } from '@octokit/core'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export const config: Config = {
  method: 'GET',
  path: [
    '/release/latest',
    '/release/download'
  ]
}

export default async function (req: Request, context: Context) {
  switch (context.url.pathname) {
    case '/release/latest':
      return releaseLatest(req, context)
    case '/release/download':
      return releaseDownload(req, context)
  }
}

///=========
/// private
///=========

const REPO_OWNER = 'lgou2w'
const REPO_NAME = 'HoYo.Gacha'

type LatestReleaseResponseData = {
  repository: {
    latestRelease: {
      tagName: string
      createdAt: string
      releaseAssets: {
        nodes: [{
          name: string
          size: number
          downloadUrl: string
        }]
      }
    }
  }
}

type FlattenLatestRelease =
  & Pick<LatestReleaseResponseData['repository']['latestRelease'], 'tagName' | 'createdAt'>
  & Pick<LatestReleaseResponseData['repository']['latestRelease']['releaseAssets']['nodes']['0'], 'name' | 'size' | 'downloadUrl'>

async function queryGitHubLatestRelease () {
  const { repository: { latestRelease } } = await octokit.graphql<LatestReleaseResponseData>(`
    {
      repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
        latestRelease {
          tagName
          createdAt
          releaseAssets(first: 1) {
            nodes {
              name
              size
              downloadUrl
            }
          }
        }
      }
    }
  `)

  return {
    tagName: latestRelease.tagName,
    createdAt: latestRelease.createdAt,
    ...latestRelease.releaseAssets.nodes[0]
  } as FlattenLatestRelease
}

const STORE_NAME = 'Release'
const STORE_KEY_LATEST = 'Latest'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function getLatestReleaseBlob (signal?: AbortSignal) {
  const store = getStore(STORE_NAME)
  const blob = await store.getWithMetadata(STORE_KEY_LATEST, { type: 'blob' }) as
    & { data: Blob }
    & GetWithMetadataResult
    & { metadata: {
        latestRelease: FlattenLatestRelease
        latestCheck: number
      } }
    | null

  let ttl: number
  if (blob && (ttl = Date.now() - blob.metadata.latestCheck) < CACHE_TTL) {
    console.debug('Using cached latest release: %s (TTL: %ds)',
      blob.metadata.latestRelease.tagName, Math.round((CACHE_TTL - ttl) / 1000))
    return blob
  }

  console.debug('Fetching latest release from GitHub')
  const latestRelease = await queryGitHubLatestRelease()
  if (blob && blob.metadata.latestRelease.tagName === latestRelease.tagName) {
    console.debug('Cached latest release is still valid:', latestRelease.tagName)
    const metadata = { latestRelease, latestCheck: Date.now() }
    await store.set(STORE_KEY_LATEST, blob.data, { metadata })
    return blob
  }

  console.debug('Download and cache latest release:', latestRelease.tagName)
  const newBlob = await fetch(latestRelease.downloadUrl, {
    signal,
    referrerPolicy: 'no-referrer',
  }).then((res) => res.blob())

  const metadata = { latestRelease, latestCheck: Date.now() }
  const ret = await store.set(STORE_KEY_LATEST, newBlob, { metadata })

  return {
    data: newBlob,
    etag: ret.etag,
    metadata
  }
}

async function releaseLatest (req: Request, context: Context) {
  const blob = await getLatestReleaseBlob(req.signal)
  return new Response(JSON.stringify(blob.metadata.latestRelease), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

async function releaseDownload (req: Request, context: Context) {
  const blob = await getLatestReleaseBlob(req.signal)
  return new Response(blob.data, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(blob.metadata.latestRelease.size),
      'Content-Disposition': `attachment; filename=${blob.metadata.latestRelease.name}`
    }
  })
}
