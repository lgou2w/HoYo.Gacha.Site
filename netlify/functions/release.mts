import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const MyOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new MyOctokit({ auth: GITHUB_TOKEN })

export const config: Config = {
  method: 'GET',
  path: [
    '/release/latest',
    '/release/download'
  ]
}

export default async function (req: Request, context: Context) {
  if (!GITHUB_TOKEN) {
    return new Response('GITHUB_TOKEN is not set', { status: 500 })
  }

  switch (context.url.pathname) {
    case '/release/latest':
      return await latest(req, context)
    case '/release/download':
      return await download(req, context)
  }
}

type Release = {
  id: number
  tag_name: string
  prerelease: boolean
  created_at: string
  asset: {
    name: string
    size: number
    download_url: string
  }
}

type ReleaseBlob = {
  lastCheck: number
  data: Release
}

const RELEASE_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const GITHUB_REPO = {
  owner: 'lgou2w',
  repo: 'HoYo.Gacha'
}

// Minimum release date to start checking
const MIN_CRATED_AT_START = new Date('2023-05-01T00:00:00Z')

const STORE_RELEASE = 'release'
const STORE_KEY_LATEST = 'latest'

async function latest (req: Request, context: Context) {
  const blob = await getLatestReleaseBlob()
  if (!blob) {
    return new Response('No release found', { status: 404 })
  } else {
    return new Response(JSON.stringify(blob.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

async function download (req: Request, context: Context) {
  const id = context.url.searchParams.get('id')
  if (!id || (id !== 'latest' && !/^\d+$/.test(id))) {
    return new Response('Invalid id', { status: 400 })
  }

  let release: Release | null
  if (id === 'latest') {
    const blob = await getLatestReleaseBlob()
    release = blob?.data || null
  } else {
    release = await getGitHubReleaseById(parseInt(id))
  }

  if (!release) {
    return new Response('No release found', { status: 404 })
  }

  return fetch(release.asset.download_url, {
    signal: req.signal,
    referrerPolicy: 'no-referrer',
  })
}

async function getLatestReleaseBlob (): Promise<ReleaseBlob | null> {
  const now = Date.now()
  const store = getStore(STORE_RELEASE)

  let blob = await store.get(STORE_KEY_LATEST, { type: 'json' }) as ReleaseBlob | null

  // Use cached latest release if it's not expired
  if (blob && now - blob.lastCheck < RELEASE_CACHE_TTL) {
    console.debug('Using cached latest release:', blob.data.tag_name)
    return blob
  }

  // Fetch latest release from GitHub
  console.debug('Fetching latest release from GitHub')
  const { data: latestRelease } = await octokit.rest.repos.getLatestRelease(GITHUB_REPO)
  const asset = latestRelease?.assets?.find(asset => asset.name.endsWith('.exe'))

  if (!latestRelease || new Date(latestRelease.created_at) < MIN_CRATED_AT_START || !asset) {
    return null
  }

  blob = {
    lastCheck: now,
    data: {
      id: latestRelease.id,
      tag_name: latestRelease.tag_name,
      prerelease: latestRelease.prerelease,
      created_at: latestRelease.created_at,
      asset: {
        name: asset.name,
        size: asset.size,
        download_url: asset.browser_download_url
      }
    }
  }

  console.debug('Latest release:', blob.data.tag_name)
  await store.setJSON(STORE_KEY_LATEST, blob)

  return blob
}

async function getGitHubReleaseById (id: number): Promise<Release | null> {
  const { data: release } = await octokit.rest.repos.getRelease({
    ...GITHUB_REPO,
    release_id: id
  })

  const asset = release?.assets?.find(asset => asset.name.endsWith('.exe'))
  if (!asset) {
    return null
  }

  return {
    id: release.id,
    tag_name: release.tag_name,
    prerelease: release.prerelease,
    created_at: release.created_at,
    asset: {
      name: asset.name,
      size: asset.size,
      download_url: asset.browser_download_url
    }
  }
}
