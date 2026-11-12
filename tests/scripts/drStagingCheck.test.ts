import { describe, expect, it } from 'vitest'
import {
  evaluateStagingDeployEnv,
  STAGING_DEPLOY_ENV_KEYS,
} from '../../scripts/lib/drStagingCheck'

describe('evaluateStagingDeployEnv (#197)', () => {
  it('fails closed when env is empty', () => {
    const result = evaluateStagingDeployEnv({})
    expect(result.ok).toBe(false)
    expect(result.missing).toEqual([...STAGING_DEPLOY_ENV_KEYS])
    expect(result.present).toEqual([])
    expect(result.checklist.length).toBeGreaterThanOrEqual(5)
  })

  it('fails closed when any key is whitespace-only', () => {
    const result = evaluateStagingDeployEnv({
      STAGING_DEPLOY_HOST: 'staging.example',
      STAGING_DEPLOY_USER: 'deploy',
      STAGING_DEPLOY_SSH_KEY: '   ',
      STAGING_DEPLOY_PATH: '/opt/bizcode',
    })
    expect(result.ok).toBe(false)
    expect(result.missing).toEqual(['STAGING_DEPLOY_SSH_KEY'])
  })

  it('succeeds when all four keys are non-empty', () => {
    const result = evaluateStagingDeployEnv({
      STAGING_DEPLOY_HOST: 'staging.example',
      STAGING_DEPLOY_USER: 'deploy',
      STAGING_DEPLOY_SSH_KEY: '-----BEGIN KEY-----\nMOCK\n-----END KEY-----',
      STAGING_DEPLOY_PATH: '/opt/bizcode',
    })
    expect(result.ok).toBe(true)
    expect(result.missing).toEqual([])
    expect(result.present).toEqual([...STAGING_DEPLOY_ENV_KEYS])
  })
})
